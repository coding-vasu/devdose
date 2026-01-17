#!/usr/bin/env tsx

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase Connection...\n");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  // Check if credentials exist
  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL not found in .env file");
    console.log("\nPlease add your Supabase URL to the .env file:");
    console.log("SUPABASE_URL=https://your-project.supabase.co");
    process.exit(1);
  }

  if (!supabaseKey) {
    console.error("❌ SUPABASE_SERVICE_KEY not found in .env file");
    console.log("\nPlease add your Supabase service key to the .env file:");
    console.log("SUPABASE_SERVICE_KEY=eyJ...");
    process.exit(1);
  }

  // Check for placeholder values
  if (supabaseUrl === "https://your-project.supabase.co") {
    console.error("❌ Please replace the placeholder SUPABASE_URL with your actual project URL");
    console.log("\nGet it from: Supabase Dashboard → Settings → API → Project URL");
    process.exit(1);
  }

  if (supabaseKey === "your_supabase_service_key_here") {
    console.error("❌ Please replace the placeholder SUPABASE_SERVICE_KEY with your actual service key");
    console.log("\nGet it from: Supabase Dashboard → Settings → API → service_role key");
    process.exit(1);
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Check connection by trying to query the posts table
    console.log("📝 Test 1: Checking database connection...");
    
    // First, try a simple query to verify connection
    const { error: connectionError } = await supabase
      .from("posts")
      .select("count")
      .limit(0);

    if (connectionError) {
      if (connectionError.message.includes("does not exist") || 
          connectionError.message.includes("relation") ||
          connectionError.code === "42P01") {
        console.error("❌ Table 'posts' does not exist");
        console.log("\n📋 Next steps:");
        console.log("1. Go to Supabase Dashboard → SQL Editor");
        console.log("2. Copy the contents of: src/pipeline/publishing/schema.sql");
        console.log("3. Paste and run the SQL script");
        console.log("4. Run this test again");
        console.log("\nOr run this command to see the schema:");
        console.log("   cat src/pipeline/publishing/schema.sql");
        process.exit(1);
      }
      throw new Error(`Connection failed: ${connectionError.message}`);
    }

    console.log("✅ Connected to Supabase successfully!\n");

    // Test 2: Verify we can count posts
    console.log("📊 Test 2: Verifying table access...");
    const { count, error: countError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error(`Table access failed: ${countError.message}`);
    }

    console.log(`✅ Table 'posts' is accessible (${count || 0} posts currently)\n`);

    // Test 3: Test insert and query
    console.log("🔄 Test 3: Testing insert and query operations...");
    const testPost = {
      title: "Connection Test Post",
      code: "const test = 'Hello DevDose!';",
      language: "javascript",
      explanation: "This is a test post created during connection verification.",
      tags: ["test", "connection"],
      difficulty: "beginner",
      source_url: "https://github.com/test",
      source_name: "test/repo",
      source_type: "github",
      quality_score: 90,
      reading_time_seconds: 25,
      prerequisites: ["JavaScript basics"],
    };

    // Insert test post
    const { data: insertedData, error: insertError } = await supabase
      .from("posts")
      .insert([testPost])
      .select();

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    console.log(`✅ Successfully inserted test post (ID: ${insertedData[0].id})`);

    // Query test post
    const { data: queriedData, error: queryError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", insertedData[0].id)
      .single();

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`);
    }

    console.log(`✅ Successfully queried test post`);

    // Clean up test post
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", insertedData[0].id);

    if (deleteError) {
      console.warn(`⚠️  Warning: Could not delete test post: ${deleteError.message}`);
    } else {
      console.log(`✅ Successfully deleted test post\n`);
    }

    // Final summary
    console.log("=".repeat(60));
    console.log("✅ ALL TESTS PASSED!");
    console.log("=".repeat(60));
    console.log("\nYour Supabase database is configured correctly! 🎉");
    console.log("\nDatabase Info:");
    console.log(`  URL: ${supabaseUrl}`);
    console.log(`  Table: posts`);
    console.log(`  Status: Ready for pipeline\n`);
    console.log("Next steps:");
    console.log("1. Set up GitHub token (if not done)");
    console.log("2. Set up Gemini API key");
    console.log("3. Run the pipeline: npm run pipeline");
  } catch (error: any) {
    console.error("\n❌ Supabase test failed:");
    console.error(`   ${error.message}`);
    console.log("\n📋 Troubleshooting:");
    console.log("1. Check your SUPABASE_URL is correct");
    console.log("2. Verify you're using the service_role key (not anon key)");
    console.log("3. Make sure the schema.sql has been run");
    console.log("4. Check Supabase Dashboard for any issues");
    process.exit(1);
  }
}

testSupabaseConnection();
