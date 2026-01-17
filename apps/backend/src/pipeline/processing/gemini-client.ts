import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProcessingInput, ProcessingOutput, ProcessingConfig } from "./types";
import { SYSTEM_PROMPT, createUserPrompt } from "./prompt-templates";

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: ProcessingConfig;

  constructor(apiKey: string, config: ProcessingConfig) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: config.model,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });
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

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent([
          { text: SYSTEM_PROMPT },
          { text: userPrompt },
        ]);

        const response = result.response;
        const text = response.text();

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

      // Rate limiting between batches
      if (i + this.config.batchSize < inputs.length) {
        await this.sleep(2000);
      }
    }

    return results;
  }

  /**
   * Parse Gemini response to extract JSON
   */
  private parseResponse(text: string): ProcessingOutput | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to parse as direct JSON
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonStr = text.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr);
      }

      return null;
    } catch (error) {
      console.error("   Failed to parse response:", error);
      return null;
    }
  }

  /**
   * Validate output structure
   */
  private validateOutput(output: any): boolean {
    return (
      typeof output.title === "string" &&
      output.title.length > 0 &&
      output.title.length <= 60 &&
      typeof output.explanation === "string" &&
      output.explanation.length > 0 &&
      ["beginner", "intermediate", "advanced"].includes(output.difficulty) &&
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
