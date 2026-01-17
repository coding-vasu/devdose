import { Source, GitHubRepo } from "./types";

/**
 * Manually curated high-quality sources
 * These are guaranteed to have valuable content
 */
export const CURATED_SOURCES: (Source | GitHubRepo)[] = [
  // ===== Official Documentation =====
  {
    type: "docs",
    name: "React Documentation",
    url: "https://react.dev",
    tags: ["react", "hooks", "components"],
    priority: 10,
  },
  {
    type: "docs",
    name: "TypeScript Handbook",
    url: "https://www.typescriptlang.org/docs",
    tags: ["typescript", "types"],
    priority: 10,
  },
  {
    type: "docs",
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web",
    tags: ["javascript", "css", "html", "web-apis"],
    priority: 10,
  },
  {
    type: "docs",
    name: "Vue.js Guide",
    url: "https://vuejs.org/guide",
    tags: ["vue", "composition-api"],
    priority: 9,
  },
  {
    type: "docs",
    name: "Angular Documentation",
    url: "https://angular.dev",
    tags: ["angular", "rxjs"],
    priority: 9,
  },

  // ===== Top GitHub Repositories =====
  {
    type: "github",
    name: "facebook/react",
    url: "https://github.com/facebook/react",
    owner: "facebook",
    repo: "react",
    tags: ["react", "hooks"],
    priority: 10,
  },
  {
    type: "github",
    name: "microsoft/TypeScript",
    url: "https://github.com/microsoft/TypeScript",
    owner: "microsoft",
    repo: "TypeScript",
    tags: ["typescript"],
    priority: 10,
  },
  {
    type: "github",
    name: "vuejs/core",
    url: "https://github.com/vuejs/core",
    owner: "vuejs",
    repo: "core",
    tags: ["vue"],
    priority: 9,
  },
  {
    type: "github",
    name: "angular/angular",
    url: "https://github.com/angular/angular",
    owner: "angular",
    repo: "angular",
    tags: ["angular"],
    priority: 9,
  },
  {
    type: "github",
    name: "vercel/next.js",
    url: "https://github.com/vercel/next.js",
    owner: "vercel",
    repo: "next.js",
    tags: ["react", "nextjs", "ssr"],
    priority: 9,
  },

  // ===== Educational Platforms =====
  {
    type: "blog",
    name: "web.dev",
    url: "https://web.dev",
    tags: ["performance", "web", "best-practices"],
    priority: 9,
  },
  {
    type: "blog",
    name: "CSS-Tricks",
    url: "https://css-tricks.com",
    tags: ["css", "layout", "animations"],
    priority: 8,
  },
  {
    type: "blog",
    name: "JavaScript.info",
    url: "https://javascript.info",
    tags: ["javascript", "fundamentals"],
    priority: 8,
  },

  // ===== Awesome Lists =====
  {
    type: "awesome",
    name: "awesome-react",
    url: "https://github.com/enaqx/awesome-react",
    tags: ["react"],
    priority: 7,
  },
  {
    type: "awesome",
    name: "awesome-typescript",
    url: "https://github.com/dzharii/awesome-typescript",
    tags: ["typescript"],
    priority: 7,
  },
  {
    type: "awesome",
    name: "awesome-css",
    url: "https://github.com/awesome-css-group/awesome-css",
    tags: ["css"],
    priority: 7,
  },
  {
    type: "awesome",
    name: "awesome-javascript",
    url: "https://github.com/sorrycc/awesome-javascript",
    tags: ["javascript"],
    priority: 7,
  },
];

/**
 * Get curated sources by tag
 */
export function getCuratedSourcesByTag(tag: string): Source[] {
  return CURATED_SOURCES.filter((source) =>
    source.tags.includes(tag.toLowerCase())
  );
}

/**
 * Get high-priority curated sources
 */
export function getHighPrioritySources(minPriority: number = 8): Source[] {
  return CURATED_SOURCES.filter((source) => source.priority >= minPriority);
}
