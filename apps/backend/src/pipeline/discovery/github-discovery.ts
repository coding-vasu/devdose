import { Octokit } from "@octokit/rest";
import { GitHubRepo, DiscoveryConfig } from "./types";
import { withRetry } from "../utils/retry";

export class GitHubDiscovery {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Discover trending repositories for a specific topic
   */
  async discoverByTopic(
    topic: string,
    config: DiscoveryConfig
  ): Promise<GitHubRepo[]> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - config.activityMonths);

    const query = this.buildSearchQuery(topic, config, cutoffDate);

    console.log(`🔍 Searching GitHub: ${query}`);

    try {
      // Wrap GitHub API call with retry logic
      const { data } = await withRetry(
        () => this.octokit.search.repos({
          q: query,
          sort: "stars",
          order: "desc",
          per_page: config.maxResultsPerTopic,
        }),
        {
          maxRetries: 3,
          baseDelay: 2000,
          shouldRetry: (error) => {
            // Retry on rate limits and server errors
            return error.status === 403 || error.status >= 500;
          },
        }
      );

      console.log(
        `✅ Found ${data.items.length} repositories for topic: ${topic}`
      );

      // Transform to our format
      const repos = await Promise.all(
        data.items.map((item) => this.transformRepo(item, topic))
      );

      return repos.filter((repo) => repo !== null) as GitHubRepo[];
    } catch (error) {
      console.error(`❌ Error discovering repos for ${topic}:`, error);
      return [];
    }
  }

  /**
   * Build GitHub search query
   */
  private buildSearchQuery(
    topic: string,
    config: DiscoveryConfig,
    cutoffDate: Date
  ): string {
    const parts = [
      `topic:${topic}`,
      `stars:>${config.minStars}`,
      `pushed:>${cutoffDate.toISOString().split("T")[0]}`,
    ];

    return parts.join(" ");
  }

  /**
   * Transform GitHub API response to our format
   */
  private async transformRepo(
    item: any,
    topic: string
  ): Promise<GitHubRepo | null> {
    try {
      // Check if repo has good documentation
      const hasGoodDocs = await this.checkDocumentation(
        item.owner.login,
        item.name
      );

      // Check if repo has examples
      const hasExamples = await this.checkExamples(item.owner.login, item.name);

      return {
        type: "github",
        name: item.full_name,
        url: item.html_url,
        owner: item.owner.login,
        repo: item.name,
        tags: [topic, ...(item.topics || [])],
        stars: item.stargazers_count,
        forks: item.forks_count,
        language: item.language,
        lastPushed: new Date(item.pushed_at),
        hasExamples,
        hasGoodDocs,
        priority: this.calculatePriority(item, hasGoodDocs, hasExamples),
      };
    } catch (error) {
      console.error(`Error transforming repo ${item.full_name}:`, error);
      return null;
    }
  }

  /**
   * Check if repository has good documentation
   */
  private async checkDocumentation(
    owner: string,
    repo: string
  ): Promise<boolean> {
    try {
      const { data } = await this.octokit.repos.getReadme({
        owner,
        repo,
      });

      // Consider "good" if README is > 1000 bytes
      return data.size > 1000;
    } catch {
      return false;
    }
  }

  /**
   * Check if repository has examples directory
   */
  private async checkExamples(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path: "examples",
      });
      return true;
    } catch {
      // Try alternative paths
      try {
        await this.octokit.repos.getContent({
          owner,
          repo,
          path: "example",
        });
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Calculate priority score (1-10)
   */
  private calculatePriority(
    item: any,
    hasGoodDocs: boolean,
    hasExamples: boolean
  ): number {
    let score = 5; // Base score

    // Star-based scoring
    if (item.stargazers_count > 50000) score += 3;
    else if (item.stargazers_count > 10000) score += 2;
    else if (item.stargazers_count > 5000) score += 1;

    // Documentation bonus
    if (hasGoodDocs) score += 1;

    // Examples bonus
    if (hasExamples) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Discover across multiple topics (parallelized)
   */
  async discoverAll(config: DiscoveryConfig): Promise<GitHubRepo[]> {
    console.log(`🔍 Discovering repos for ${config.topics.length} topics in parallel...`);

    // Process all topics in parallel
    const repoPromises = config.topics.map((topic) =>
      this.discoverByTopic(topic, config)
    );

    const repoArrays = await Promise.all(repoPromises);
    const allRepos = repoArrays.flat();

    // Deduplicate by repo name
    const unique = this.deduplicateRepos(allRepos);

    console.log(`\n📊 Discovery Summary:`);
    console.log(`   Total found: ${allRepos.length}`);
    console.log(`   Unique: ${unique.length}`);
    console.log(`   Duplicates removed: ${allRepos.length - unique.length}`);

    return unique;
  }

  /**
   * Remove duplicate repositories
   */
  private deduplicateRepos(repos: GitHubRepo[]): GitHubRepo[] {
    const seen = new Set<string>();
    return repos.filter((repo) => {
      if (seen.has(repo.name)) return false;
      seen.add(repo.name);
      return true;
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
