import { Ollama } from "ollama";
import { ProcessingInput, ProcessingOutput, ProcessingConfig } from "./types";
import { SYSTEM_PROMPT, createUserPrompt } from "./prompt-templates";

export class OllamaClient {
  private ollama: Ollama;
  private config: ProcessingConfig;

  constructor(config: ProcessingConfig) {
    this.ollama = new Ollama({ host: "http://localhost:11434" });
    this.config = config;
  }

  /**
   * Process a single code snippet
   */
  async processSnippet(
    input: ProcessingInput
  ): Promise<ProcessingOutput | null> {
    const userPrompt = createUserPrompt(
      input.code,
      input.language,
      input.sourceContext,
      input.repositoryName
    );

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
    return this.generateInternal(fullPrompt);
  }

  /**
   * Verify and potentially correct a code snippet
   */
  async verifySnippet(
    post: any // Using any here to avoid importing Post type which might cause circular dependency if types are not split
  ): Promise<ProcessingOutput | null> {
    const { VERIFICATION_SYSTEM_PROMPT, createVerificationUserPrompt } = require("./prompt-templates");
    
    const userPrompt = createVerificationUserPrompt(
      post.title,
      post.code,
      post.explanation,
      post.language,
      post.difficulty,
      post.category || "Quick Tips",
      post.tags
    );

    const fullPrompt = `${VERIFICATION_SYSTEM_PROMPT}\n\n${userPrompt}`;
    return this.generateInternal(fullPrompt);
  }

  /**
   * Internal method to handle Ollama generation
   */
  private async generateInternal(
    fullPrompt: string
  ): Promise<ProcessingOutput | null> {
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await this.ollama.generate({
          model: this.config.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
          },
        });

        const text = response.response;

        // Parse JSON response
        const output = this.parseResponse(text);

        if (output && this.validateOutput(output)) {
          return output;
        }
      } catch (error) {
        console.error(`   Attempt ${attempt + 1} failed:`, error);
        if (attempt < this.config.maxRetries - 1) {
          await this.sleep(1000 * (attempt + 1)); // Exponential backoff
        }
      }
    }

    return null;
  }

  /**
   * Process multiple snippets in batches
   */
  async processBatch(
    inputs: ProcessingInput[]
  ): Promise<ProcessingOutput[]> {
    const results: ProcessingOutput[] = [];

    for (let i = 0; i < inputs.length; i += this.config.batchSize) {
      const batch = inputs.slice(i, i + this.config.batchSize);
      console.log(
        `   Processing batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(inputs.length / this.config.batchSize)}`
      );

      const batchResults = await Promise.all(
        batch.map((input) => this.processSnippet(input))
      );

      // Filter out null results
      results.push(...batchResults.filter((r) => r !== null) as ProcessingOutput[]);

      // Rate limiting between batches (less aggressive for local)
      if (i + this.config.batchSize < inputs.length) {
        await this.sleep(500);
      }
    }

    return results;
  }

  /**
   * Parse Ollama response to extract JSON
   */
  private parseResponse(text: string): ProcessingOutput | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const sanitized = this.sanitizeJsonString(jsonMatch[1]);
        return JSON.parse(sanitized);
      }

      // Try to parse as direct JSON
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonStr = text.substring(jsonStart, jsonEnd);
        const sanitized = this.sanitizeJsonString(jsonStr);
        return JSON.parse(sanitized);
      }

      return null;
    } catch (error) {
      console.error("   Failed to parse response:", error);
      console.error("   Raw text:", text.substring(0, 500)); // Log first 500 chars for debugging
      return null;
    }
  }

  /**
   * Sanitize JSON string by removing invalid escape sequences
   * LLMs sometimes generate \_ or \( which are not valid JSON escapes
   */
  private sanitizeJsonString(jsonStr: string): string {
    // Remove invalid escape sequences that LLMs sometimes generate
    let sanitized = jsonStr;
    
    // Replace \_ with _ (underscore doesn't need escaping in JSON)
    sanitized = sanitized.replace(/\\_/g, '_');
    
    // Replace \( and \) with ( and ) (parentheses don't need escaping)
    sanitized = sanitized.replace(/\\\(/g, '(');
    sanitized = sanitized.replace(/\\\)/g, ')');
    
    // Replace \[ and \] with [ and ] (brackets don't need escaping)
    sanitized = sanitized.replace(/\\\[/g, '[');
    sanitized = sanitized.replace(/\\\]/g, ']');
    
    // Replace \{ and \} with { and } (braces don't need escaping)
    sanitized = sanitized.replace(/\\\{/g, '{');
    sanitized = sanitized.replace(/\\\}/g, '}');
    
    return sanitized;
  }

  /**
   * Validate output structure and enforce bite-sized content requirements
   */
  private validateOutput(output: any): boolean {
    const validCategories = [
      "Quick Tips",
      "Common Mistakes",
      "Did You Know",
      "Quick Wins",
      "Under the Hood",
    ];

    // Word count validation for explanation (40-80 words ideal, max 100)
    const wordCount = output.explanation?.split(/\s+/).length || 0;
    const isExplanationValid = wordCount >= 10 && wordCount <= 120; // Allow some flexibility

    // Log warnings for non-ideal content
    if (wordCount > 80) {
      console.log(`   ⚠️  Explanation is long (${wordCount} words). Ideal: 40-80 words.`);
    }

    return (
      typeof output.title === "string" &&
      output.title.length > 0 &&
      output.title.length <= 60 &&
      typeof output.explanation === "string" &&
      output.explanation.length > 0 &&
      isExplanationValid &&
      ["beginner", "intermediate", "advanced"].includes(output.difficulty) &&
      typeof output.category === "string" &&
      validCategories.includes(output.category) &&
      Array.isArray(output.tags) &&
      output.tags.length > 0 &&
      typeof output.qualityScore === "number" &&
      output.qualityScore >= 1 &&
      output.qualityScore <= 100
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
