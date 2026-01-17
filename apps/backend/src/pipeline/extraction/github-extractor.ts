import { Octokit } from "@octokit/rest";
import { CodeSnippet, ExtractionConfig } from "./types";
import { createHash } from "crypto";

export class GitHubExtractor {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Extract code snippets from a GitHub repository
   */
  async extractFromRepo(
    owner: string,
    repo: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    const snippets: CodeSnippet[] = [];

    try {
      // 1. Extract from README
      const readmeSnippets = await this.extractFromReadme(
        owner,
        repo,
        config
      );
      snippets.push(...readmeSnippets);

      // 2. Extract from examples directory
      const exampleSnippets = await this.extractFromExamples(
        owner,
        repo,
        config
      );
      snippets.push(...exampleSnippets);

      console.log(
        `   Extracted ${snippets.length} snippets from ${owner}/${repo}`
      );
    } catch (error) {
      console.error(`   Error extracting from ${owner}/${repo}:`, error);
    }

    return snippets;
  }

  /**
   * Extract code blocks from README
   */
  private async extractFromReadme(
    owner: string,
    repo: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    try {
      const { data } = await this.octokit.repos.getReadme({
        owner,
        repo,
      });

      // Decode base64 content
      const content = Buffer.from(data.content, "base64").toString("utf-8");

      // Extract code blocks
      return this.extractCodeBlocks(content, {
        sourceName: `${owner}/${repo}`,
        sourceUrl: `https://github.com/${owner}/${repo}`,
        sourceType: "github",
        filePath: "README.md",
      }, config);
    } catch {
      return [];
    }
  }

  /**
   * Extract code from examples directory
   */
  private async extractFromExamples(
    owner: string,
    repo: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    const snippets: CodeSnippet[] = [];

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: "examples",
      });

      if (!Array.isArray(data)) return [];

      // Get first 5 example files
      const files = data.filter((item) => item.type === "file").slice(0, 5);

      for (const file of files) {
        const fileSnippets = await this.extractFromFile(
          owner,
          repo,
          file.path,
          config
        );
        snippets.push(...fileSnippets);
      }
    } catch {
      // Examples directory doesn't exist
    }

    return snippets;
  }

  /**
   * Extract code from a specific file
   */
  private async extractFromFile(
    owner: string,
    repo: string,
    path: string,
    config: ExtractionConfig
  ): Promise<CodeSnippet[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ("content" in data && typeof data.content === "string") {
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        const language = this.detectLanguage(path);

        if (config.languages.includes(language)) {
          const lines = content.split("\n");
          const lineCount = lines.length;

          // Only extract if file is within size limits
          if (
            lineCount >= config.minCodeLines &&
            lineCount <= config.maxCodeLines
          ) {
            return [
              {
                code: content,
                language,
                metadata: {
                  sourceName: `${owner}/${repo}`,
                  sourceUrl: `https://github.com/${owner}/${repo}/blob/main/${path}`,
                  sourceType: "github",
                  filePath: path,
                  lineNumbers: { start: 1, end: lineCount },
                },
                hash: this.hashCode(content),
              },
            ];
          }
        }
      }
    } catch {
      // File doesn't exist or error reading
    }

    return [];
  }

  /**
   * Extract code blocks from markdown content
   */
  private extractCodeBlocks(
    markdown: string,
    metadata: Omit<CodeSnippet["metadata"], "lineNumbers" | "context">,
    config: ExtractionConfig
  ): CodeSnippet[] {
    const snippets: CodeSnippet[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    let match;
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const language = match[1] || "javascript";
      const code = match[2].trim();
      const lines = code.split("\n");

      // Filter by language and size
      if (
        config.languages.includes(language) &&
        lines.length >= config.minCodeLines &&
        lines.length <= config.maxCodeLines
      ) {
        snippets.push({
          code,
          language,
          metadata: {
            ...metadata,
            lineNumbers: { start: 1, end: lines.length },
          },
          hash: this.hashCode(code),
        });
      }
    }

    return snippets;
  }

  /**
   * Detect language from file extension
   */
  private detectLanguage(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      css: "css",
      scss: "css",
      html: "html",
      md: "markdown",
    };

    return languageMap[ext || ""] || "javascript";
  }

  /**
   * Generate hash for code deduplication
   */
  private hashCode(code: string): string {
    // Normalize code (remove extra whitespace, comments)
    const normalized = code
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
      .replace(/\/\/.*/g, "") // Remove line comments
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    return createHash("sha256").update(normalized).digest("hex");
  }
}
