#!/usr/bin/env tsx

import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";

dotenv.config();

async function testGitHubToken() {
  console.log("🔍 Testing GitHub Token...\n");

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error("❌ GITHUB_TOKEN not found in .env file");
    console.log("\nPlease add your GitHub token to the .env file:");
    console.log("GITHUB_TOKEN=ghp_your_token_here");
    process.exit(1);
  }

  if (token === "ghp_your_github_token_here") {
    console.error("❌ Please replace the placeholder token with your actual GitHub token");
    process.exit(1);
  }

  try {
    const octokit = new Octokit({ auth: token });

    // Test 1: Get authenticated user
    console.log("📝 Test 1: Checking authentication...");
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`✅ Authenticated as: ${user.login}`);
    console.log(`   Name: ${user.name || "Not set"}`);
    console.log(`   Email: ${user.email || "Not public"}\n`);

    // Test 2: Check rate limits
    console.log("📊 Test 2: Checking API rate limits...");
    const { data: rateLimit } = await octokit.rateLimit.get();
    console.log(`✅ Rate Limit: ${rateLimit.rate.remaining}/${rateLimit.rate.limit} requests remaining`);
    console.log(`   Resets at: ${new Date(rateLimit.rate.reset * 1000).toLocaleString()}\n`);

    // Test 3: Search for a popular repo
    console.log("🔍 Test 3: Testing repository search...");
    const { data: searchResult } = await octokit.search.repos({
      q: "topic:react stars:>1000",
      per_page: 3,
    });
    console.log(`✅ Found ${searchResult.total_count} repositories matching criteria`);
    console.log(`   Sample repos:`);
    searchResult.items.slice(0, 3).forEach((repo) => {
      console.log(`   - ${repo.full_name} (⭐ ${repo.stargazers_count})`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TESTS PASSED!");
    console.log("=".repeat(60));
    console.log("\nYour GitHub token is configured correctly! 🎉");
    console.log("You can now run the DevDose pipeline with: npm run pipeline");
  } catch (error: any) {
    console.error("\n❌ Token test failed:");
    if (error.status === 401) {
      console.error("   Invalid token. Please check your GITHUB_TOKEN in .env");
    } else if (error.status === 403) {
      console.error("   Token doesn't have required permissions");
      console.error("   Make sure you selected 'public_repo' scope");
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testGitHubToken();
