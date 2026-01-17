#!/usr/bin/env tsx

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { unlink } from "fs/promises";
import { existsSync } from "fs";

dotenv.config();

/**
 * Clean slate: Remove all posts from database and delete result files
 */
async function cleanSlate() {
  console.log("\n" + "=".repeat(70));
  console.log("🧹 DEVDOSE CLEAN SLATE");
  console.log("=".repeat(70) + "\n");

  // Initialize Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Step 1: Clean database
  console.log("📊 Cleaning Supabase database...\n");

  try {
    // Get current count
    const { count: beforeCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    console.log(`   Current posts in database: ${beforeCount || 0}`);

    if (beforeCount && beforeCount > 0) {
      // Delete all posts
      const { error } = await supabase.from("posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        console.error("   ❌ Error deleting posts:", error);
      } else {
        console.log(`   ✅ Deleted ${beforeCount} posts from database`);
      }
    } else {
      console.log("   ℹ️  Database is already empty");
    }
  } catch (error) {
    console.error("   ❌ Database cleanup failed:", error);
  }

  // Step 2: Delete result files
  console.log("\n📁 Cleaning result files...\n");

  const resultFiles = [
    "discovery-results.json",
    "extraction-results.json",
    "processing-results.json",
    "quality-results.json",
    "enrichment-results.json",
    "test-extraction-results.json",
    "test-processing-results.json",
    "test-quality-results.json",
    "test-enrichment-results.json",
    // Temporary single-source files
    "temp-single-source-discovery.json",
    "temp-single-source-extraction.json",
    "temp-single-source-processing.json",
    "temp-single-source-quality.json",
    "temp-single-source-enrichment.json",
  ];

  let deletedCount = 0;
  let notFoundCount = 0;

  for (const file of resultFiles) {
    if (existsSync(file)) {
      try {
        await unlink(file);
        console.log(`   ✅ Deleted: ${file}`);
        deletedCount++;
      } catch (error) {
        console.error(`   ❌ Failed to delete ${file}:`, error);
      }
    } else {
      notFoundCount++;
    }
  }

  console.log(`\n   Deleted: ${deletedCount} files`);
  console.log(`   Not found: ${notFoundCount} files`);

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("✅ CLEAN SLATE COMPLETE");
  console.log("=".repeat(70));
  console.log("\n💡 Next Steps:");
  console.log("   1. Add your source:");
  console.log("      npm run import-sources -- best-practices-source.json");
  console.log("   2. Verify the source:");
  console.log("      npm run verify-source");
  console.log("   3. Test with single source:");
  console.log("      npm run single-source -- --url \"YOUR_URL\"");
  console.log("   4. Run full pipeline:");
  console.log("      npm run pipeline\n");
}

cleanSlate()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Clean slate failed:", error);
    process.exit(1);
  });
