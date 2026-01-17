import { CodeSnippet } from "./types";

export class Deduplicator {
  private seenHashes: Set<string>;

  constructor() {
    this.seenHashes = new Set();
  }

  /**
   * Remove duplicate code snippets based on hash
   */
  deduplicate(snippets: CodeSnippet[]): CodeSnippet[] {
    const unique: CodeSnippet[] = [];

    for (const snippet of snippets) {
      if (!this.seenHashes.has(snippet.hash)) {
        this.seenHashes.add(snippet.hash);
        unique.push(snippet);
      }
    }

    return unique;
  }

  /**
   * Check if a snippet is a duplicate
   */
  isDuplicate(snippet: CodeSnippet): boolean {
    return this.seenHashes.has(snippet.hash);
  }

  /**
   * Get count of unique snippets seen
   */
  getUniqueCount(): number {
    return this.seenHashes.size;
  }
}
