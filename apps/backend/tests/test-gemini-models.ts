#!/usr/bin/env tsx

import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env file");
    process.exit(1);
  }

  console.log("🔍 Testing Gemini API Key and listing available models...\n");

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Try to list models
    console.log("📋 Attempting to list available models...\n");
    
    // The SDK doesn't have a listModels method, so let's try different model names
    const modelsToTry = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "models/gemini-pro",
      "models/gemini-1.5-pro",
      "models/gemini-1.5-flash",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest",
    ];

    console.log("Testing different model names:\n");

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'test' if you can read this.");
        const response = result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName.padEnd(30)} - WORKS! Response: ${text.substring(0, 50)}...`);
        
        // If we found a working model, we can stop
        console.log(`\n🎉 Found working model: ${modelName}`);
        console.log(`\nUpdate your code to use this model name.`);
        return;
      } catch (error: any) {
        if (error.status === 404) {
          console.log(`❌ ${modelName.padEnd(30)} - Not found (404)`);
        } else if (error.status === 403) {
          console.log(`⚠️  ${modelName.padEnd(30)} - Permission denied (403)`);
        } else {
          console.log(`❌ ${modelName.padEnd(30)} - Error: ${error.message.substring(0, 50)}...`);
        }
      }
    }

    console.log("\n❌ None of the common model names worked.");
    console.log("\n📋 Possible issues:");
    console.log("1. Your API key might be invalid or expired");
    console.log("2. Your API key might not have access to Gemini models");
    console.log("3. There might be a regional restriction");
    console.log("\n💡 Solutions:");
    console.log("1. Go to https://aistudio.google.com/app/apikey");
    console.log("2. Create a new API key");
    console.log("3. Make sure you're in a supported region");
    console.log("4. Check if you need to enable the Gemini API in Google Cloud Console");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
  }
}

listAvailableModels();
