import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DatabasePost, PublishingConfig, PublishingResult } from "./types";
import { EnrichmentResult } from "../enrichment/types";
import { readFile } from "fs/promises";
import { createHash } from "crypto";

dotenv.config();

/**
 * Main publishing orchestrator
 */
export class Publishing {
  private supabase: SupabaseClient;
  private config: PublishingConfig;

  constructor(config?: Partial<PublishingConfig>) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment"
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Default configuration
    this.config = {
      batchInsertSize: parseInt(process.env.BATCH_INSERT_SIZE || "100"),
      ...config,
    };
  }

  /**
   * Run publishing on enrichment results
   */
  async run(enrichmentResultPath: string): Promise<PublishingResult> {
    console.log("🚀 Starting Publishing Stage...\n");

    // Load enrichment results
    const enrichmentData = await readFile(enrichmentResultPath, "utf-8");
    const enrichmentResult: EnrichmentResult = JSON.parse(enrichmentData);

    console.log(
      `📚 Publishing ${enrichmentResult.enrichedPosts.length} posts to Supabase...\n`
    );

    let published = 0;
    let failed = 0;
    let duplicates = 0;

    // Convert to database format with code hash
    const dbPosts: DatabasePost[] = enrichmentResult.enrichedPosts.map(
      (post) => ({
        title: post.title,
        code: post.code,
        language: post.language,
        explanation: post.explanation,
        tags: [...post.tags, ...post.enrichment.extractedTags],
        difficulty: post.difficulty,
        category: post.category,
        source_url: post.sourceUrl,
        source_name: post.sourceName,
        source_type: post.sourceType,
        quality_score: post.qualityScore,
        reading_time_seconds: post.enrichment.readingTimeSeconds,
        prerequisites: post.enrichment.prerequisites,
        code_hash: createHash("md5").update(post.code).digest("hex"),
      })
    );

    // Insert in batches
    for (let i = 0; i < dbPosts.length; i += this.config.batchInsertSize) {
      const batch = dbPosts.slice(i, i + this.config.batchInsertSize);

      console.log(
        `   Inserting batch ${Math.floor(i / this.config.batchInsertSize) + 1}/${Math.ceil(dbPosts.length / this.config.batchInsertSize)}`
      );

      try {
        // Use upsert to handle duplicates gracefully
        const { data, error } = await this.supabase
          .from("posts")
          .upsert(batch, { 
            onConflict: 'code_hash',
            ignoreDuplicates: false // Update existing posts
          })
          .select();

        if (error) {
          // Check if error is due to duplicates
          if (error.code === '23505') {
            console.log(`   ⚠️  Skipped ${batch.length} duplicate posts`);
            duplicates += batch.length;
          } else {
            console.error(`   Error inserting batch:`, error);
            failed += batch.length;
          }
        } else {
          const insertedCount = data?.length || 0;
          published += insertedCount;
          console.log(`   ✅ Inserted/Updated ${insertedCount} posts`);
        }
      } catch (error) {
        console.error(`   Exception inserting batch:`, error);
        failed += batch.length;
      }

      // Minimal delay between batches to avoid overwhelming the database
      if (i + this.config.batchInsertSize < dbPosts.length) {
        await this.sleep(200); // Reduced from 1000ms
      }
    }

    const result: PublishingResult = {
      published,
      failed,
      duplicates,
      timestamp: new Date(),
    };

    this.printSummary(result);

    return result;
  }

  /**
   * Print publishing summary
   */
  private printSummary(result: PublishingResult) {
    console.log("\n" + "=".repeat(60));
    console.log("📊 PUBLISHING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Published: ${result.published}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Duplicates: ${result.duplicates}`);
    console.log("=".repeat(60) + "\n");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI usage
if (require.main === module) {
  const publishing = new Publishing();

  publishing
    .run("enrichment-results.json")
    .then((result) => {
      console.log("✅ Publishing complete!");
      console.log(`   Published: ${result.published} posts`);
      if (result.failed > 0) {
        console.log(`   Failed: ${result.failed} posts`);
      }
    })
    .catch((error) => {
      console.error("❌ Publishing failed:", error);
      process.exit(1);
    });
}
