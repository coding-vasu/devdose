import { OllamaClient } from "../../pipeline/processing/ollama-client";
import { supabaseService } from "./supabase.service";
import { ProcessingConfig, ProcessingOutput } from "../../pipeline/processing/types";
import dotenv from "dotenv";

dotenv.config();

/**
 * Service to handle AI-based verification of reported posts
 */
export class AiVerificationService {
  private ollamaClient: OllamaClient;

  constructor() {
    const config: ProcessingConfig = {
      model: process.env.OLLAMA_MODEL || "llama3.2:3b",
      batchSize: 1,
      maxRetries: 3,
    };
    this.ollamaClient = new OllamaClient(config);
  }

  /**
   * Verify a post and update it if corrections are made
   */
  async verifyAndCorrectPost(postId: string): Promise<{
    corrected: boolean;
    oldPost: any;
    newPost?: any;
    error?: string;
  }> {
    try {
      // 1. Get the post from database
      const post = await supabaseService.getPostById(postId);
      if (!post) {
        return { corrected: false, oldPost: null, error: "Post not found" };
      }

      // 2. Call Ollama to verify
      console.log(`🔍 Verifying post ${postId} with AI...`);
      const verificationResult = await this.ollamaClient.verifySnippet(post);

      if (!verificationResult) {
        return { corrected: false, oldPost: post, error: "AI verification failed or returned no output" };
      }

      // 3. Compare and check if meaningful changes were made
      const isDifferent = this.isMeaningfullyDifferent(post, verificationResult);

      if (isDifferent) {
        console.log(`✨ AI suggested corrections for post ${postId}. Updating...`);
        
        // Prepare updates
        const updates = {
          title: verificationResult.title,
          explanation: verificationResult.explanation,
          difficulty: verificationResult.difficulty,
          category: verificationResult.category,
          tags: verificationResult.tags,
          quality_score: verificationResult.qualityScore,
          // If the AI fixed the code, update it too
          code: (verificationResult as any).code || post.code,
        };

        const updatedPost = await supabaseService.updatePost(postId, updates);
        return { corrected: true, oldPost: post, newPost: updatedPost };
      }

      console.log(`✅ AI verified post ${postId} as correct.`);
      return { corrected: false, oldPost: post };
    } catch (error) {
      console.error(`❌ Error verifying post ${postId}:`, error);
      return { corrected: false, oldPost: null, error: error instanceof Error ? error.message : "Unexpected error" };
    }
  }

  /**
   * Check if the AI output is meaningfully different from the original post
   */
  private isMeaningfullyDifferent(original: any, suggestion: ProcessingOutput): boolean {
    // Check main content fields
    if (original.title !== suggestion.title) return true;
    if (original.explanation !== suggestion.explanation) return true;
    
    // Check if code was updated (if AI returned code)
    if ((suggestion as any).code && (suggestion as any).code !== original.code) return true;

    // We consider it different if title or explanation changed
    return false;
  }
}

export const aiVerificationService = new AiVerificationService();
