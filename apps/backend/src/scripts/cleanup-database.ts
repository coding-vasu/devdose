import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

dotenv.config();

/**
 * High-quality sources to keep (Priority 9-10)
 */
const APPROVED_SOURCES = [
  // Priority 10 - GitHub Repos with Examples
  "vercel/next.js",
  "mui/material-ui",
  "facebook/docusaurus",
  "pmndrs/zustand",
  "gatsbyjs/gatsby",
  
  // Priority 9 - High-quality GitHub Repos
  "freeCodeCamp/freeCodeCamp",
  "facebook/react",
  "facebook/react-native",
  "ant-design/ant-design",
  "storybookjs/storybook",
  "oven-sh/bun",
  "enaqx/awesome-react",
  "TanStack/query",
  "payloadcms/payload",
  "trpc/trpc",
  "NervJS/taro",
  "xyflow/xyflow",
  "jaredpalmer/formik",
  
  // Priority 10 - Documentation Sites
  "React Documentation",
  "TypeScript Handbook",
  "MDN Web Docs",
  "Vue.js Guide",
  "Angular Documentation",
];

interface CleanupStats {
  totalPosts: number;
  postsToKeep: number;
  postsToDelete: number;
  deletedPosts: number;
}

async function promptUser(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function cleanupDatabase(dryRun: boolean = false): Promise<CleanupStats> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment"
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🔍 Analyzing database...\n");

  // Get total posts count
  const { count: totalPosts, error: countError } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Failed to count posts: ${countError.message}`);
  }

  console.log(`📊 Total posts in database: ${totalPosts || 0}`);

  // Get posts from approved sources
  const { count: postsToKeep, error: keepError } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .in("source_name", APPROVED_SOURCES);

  if (keepError) {
    throw new Error(`Failed to count approved posts: ${keepError.message}`);
  }

  console.log(`✅ Posts from approved sources: ${postsToKeep || 0}`);

  const postsToDelete = (totalPosts || 0) - (postsToKeep || 0);
  console.log(`🗑️  Posts to delete: ${postsToDelete}\n`);

  // Show breakdown by source
  console.log("📋 Breakdown by source:");
  const { data: sources, error: sourcesError } = await supabase
    .from("posts")
    .select("source_name")
    .not("source_name", "in", `(${APPROVED_SOURCES.map(s => `"${s}"`).join(",")})`);

  if (!sourcesError && sources) {
    const sourceCounts: Record<string, number> = {};
    sources.forEach((s) => {
      if (s.source_name) {
        sourceCounts[s.source_name] = (sourceCounts[s.source_name] || 0) + 1;
      }
    });

    Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([source, count]) => {
        console.log(`   ${source}: ${count} posts`);
      });

    if (Object.keys(sourceCounts).length > 10) {
      console.log(`   ... and ${Object.keys(sourceCounts).length - 10} more sources`);
    }
  }

  console.log("\n" + "=".repeat(60));

  let deletedPosts = 0;

  if (dryRun) {
    console.log("🔍 DRY RUN - No data will be deleted");
  } else {
    const confirmed = await promptUser(
      `\n⚠️  Are you sure you want to delete ${postsToDelete} posts? (y/N): `
    );

    if (!confirmed) {
      console.log("❌ Cleanup cancelled");
      process.exit(0);
    }

    console.log("\n🗑️  Deleting posts from low-priority sources...");

    // Delete posts NOT from approved sources
    const { error: deleteError, count } = await supabase
      .from("posts")
      .delete({ count: "exact" })
      .not("source_name", "in", `(${APPROVED_SOURCES.map(s => `"${s}"`).join(",")})`);

    if (deleteError) {
      throw new Error(`Failed to delete posts: ${deleteError.message}`);
    }

    deletedPosts = count || 0;
    console.log(`✅ Deleted ${deletedPosts} posts`);
  }

  return {
    totalPosts: totalPosts || 0,
    postsToKeep: postsToKeep || 0,
    postsToDelete,
    deletedPosts,
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🚀 Database Cleanup Script\n");
  console.log(`Keeping only posts from ${APPROVED_SOURCES.length} approved sources\n`);

  try {
    const stats = await cleanupDatabase(dryRun);

    console.log("\n" + "=".repeat(60));
    console.log("📊 CLEANUP SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total posts (before): ${stats.totalPosts}`);
    console.log(`Posts kept: ${stats.postsToKeep}`);
    console.log(`Posts deleted: ${stats.deletedPosts}`);
    console.log("=".repeat(60) + "\n");

    if (!dryRun) {
      console.log("✅ Database cleanup complete!");
    }
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

main();
