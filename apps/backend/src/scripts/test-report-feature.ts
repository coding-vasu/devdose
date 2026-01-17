import { aiVerificationService } from "../api/services/ai-verification.service";
import { supabaseService } from "../api/services/supabase.service";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script to test the report and AI verification feature
 */
async function testReportFeature() {
  console.log("🚀 Starting Report Feature Test...");

  try {
    // 1. Get a random post to report
    const posts = await supabaseService.getRandomPosts({ count: 1 });
    if (posts.length === 0) {
      console.log("❌ No posts found in database to test with.");
      return;
    }

    const testPost = posts[0];
    console.log(`\nOriginal Post (ID: ${testPost.id}):`);
    console.log(`Title: ${testPost.title}`);
    console.log(`Explanation: ${testPost.explanation.substring(0, 50)}...`);

    // 2. Trigger verification
    console.log("\n📡 Triggering AI verification (this may take a moment)...");
    const result = await aiVerificationService.verifyAndCorrectPost(testPost.id);

    if (result.error) {
      console.error(`❌ Verification failed: ${result.error}`);
      return;
    }

    if (result.corrected) {
      console.log("\n✨ Post was CORRECTED by AI!");
      console.log(`New Title: ${result.newPost.title}`);
      console.log(`New Explanation: ${result.newPost.explanation.substring(0, 50)}...`);
    } else {
      console.log("\n✅ Post was VERIFIED as correct by AI (no changes needed).");
    }

    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
  }
}

testReportFeature();
