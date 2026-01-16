# Manual Source Addition Guide

## Overview

Two tools are available for manually adding sources to the discovery pipeline:

1. **Interactive Addition** - Add sources one at a time with prompts
2. **Bulk Import** - Import multiple sources from a JSON file

---

## Method 1: Interactive Addition

Add sources interactively with guided prompts.

### Usage

```bash
npm run add-source
```

### Interactive Prompts

The tool will ask for:

- **Source type**: `github`, `docs`, `blog`, or `awesome`
- **Source name**: Display name (e.g., "facebook/react")
- **Source URL**: Full URL
- **Tags**: Comma-separated tags
- **Priority**: 1-10 (default: 5)

For GitHub sources, additional prompts:

- Repository owner
- Repository name
- Stars count
- Forks count
- Primary language
- Has examples? (y/n)
- Has good docs? (y/n)

### Example Session

```
➕ DEVDOSE MANUAL SOURCE ADDITION TOOL
======================================================================

Let's add a new source!

Source type (github/docs/blog/awesome): docs
Source name: Next.js Documentation
Source URL: https://nextjs.org/docs
Tags (comma-separated): react, nextjs, ssr
Priority (1-10, default 5): 9

======================================================================
✅ SOURCE ADDED SUCCESSFULLY!
======================================================================
Name:     Next.js Documentation
Type:     docs
URL:      https://nextjs.org/docs
Priority: 9/10
Tags:     react, nextjs, ssr
======================================================================

💾 Saved to: discovery-results.json
📊 Total sources: 151

Add another source? (y/n): n
```

---

## Method 2: Bulk Import

Import multiple sources from a JSON file.

### Usage

```bash
npm run import-sources -- path/to/sources.json
```

### JSON Format

Create a JSON file with an array of sources:

```json
[
  {
    "type": "docs",
    "name": "Next.js Documentation",
    "url": "https://nextjs.org/docs",
    "tags": ["react", "nextjs", "ssr"],
    "priority": 9
  },
  {
    "type": "github",
    "name": "vercel/next.js",
    "url": "https://github.com/vercel/next.js",
    "tags": ["react", "nextjs"],
    "priority": 10
  },
  {
    "type": "blog",
    "name": "CSS-Tricks",
    "url": "https://css-tricks.com",
    "tags": ["css", "frontend"],
    "priority": 8
  }
]
```

### Required Fields

- `type`: Must be `github`, `docs`, `blog`, or `awesome`
- `name`: Display name
- `url`: Full URL

### Optional Fields

- `tags`: Array of tags (default: `[]`)
- `priority`: 1-10 (default: `5`)

### Example Import

```bash
# Using the example file
npm run import-sources -- example-sources.json
```

**Output:**

```
📥 DEVDOSE BULK SOURCE IMPORT
======================================================================

📂 Loading sources from: example-sources.json

✅ Found 6 sources to import

📂 Loading existing discovery results...
   Current sources: 150

✅ Imported: React Documentation
✅ Imported: TypeScript Handbook
✅ Imported: MDN Web Docs
✅ Imported: facebook/react
✅ Imported: microsoft/TypeScript
✅ Imported: web.dev

======================================================================
📊 IMPORT SUMMARY
======================================================================
Imported:       6
Skipped:        0
Total sources:  156
======================================================================

💾 Saved to: discovery-results.json
```

---

## Features

### Duplicate Detection

Both tools check for duplicate URLs and skip them:

```
⚠️  Skipping duplicate: facebook/react
```

### Validation

- Required fields are validated
- Invalid source types are rejected
- Malformed JSON is caught

### Statistics Update

Both tools automatically update discovery statistics:

- Total source count
- Sources by type
- Sources by topic/tag

---

## Example Sources File

An example file is provided: [`example-sources.json`](file:///Users/vasuvallabh/Downloads/DevDose/example-sources.json)

Contains 6 curated sources:

- React Documentation
- TypeScript Handbook
- MDN Web Docs
- facebook/react
- microsoft/TypeScript
- web.dev

---

## Workflow

### Adding Individual Sources

1. Run the interactive tool:

   ```bash
   npm run add-source
   ```

2. Follow the prompts

3. Verify the source was added:

   ```bash
   npm run verify-source
   ```

4. Test the pipeline on it:
   ```bash
   npm run single-source -- --url "YOUR_URL"
   ```

### Bulk Importing

1. Create a JSON file with your sources

2. Import them:

   ```bash
   npm run import-sources -- my-sources.json
   ```

3. Verify imported sources:

   ```bash
   npm run verify-source
   ```

4. Run the full pipeline:
   ```bash
   npm run pipeline
   ```

---

## Tips

### Creating Source Lists

**For Documentation Sites:**

```json
{
  "type": "docs",
  "name": "Site Name",
  "url": "https://example.com/docs",
  "tags": ["relevant", "tags"],
  "priority": 9
}
```

**For GitHub Repositories:**

```json
{
  "type": "github",
  "name": "owner/repo",
  "url": "https://github.com/owner/repo",
  "tags": ["framework", "tool"],
  "priority": 8
}
```

**For Blogs/Tutorials:**

```json
{
  "type": "blog",
  "name": "Blog Name",
  "url": "https://blog.example.com",
  "tags": ["tutorials", "guides"],
  "priority": 7
}
```

### Priority Guidelines

- **10**: Official docs, top frameworks
- **9**: Major libraries, popular tools
- **8**: Quality blogs, educational sites
- **7**: Awesome lists, curated collections
- **5**: Default for unknown quality
- **1-4**: Low priority or experimental

---

## Next Steps After Adding Sources

1. **Verify Sources**

   ```bash
   npm run verify-source
   ```

2. **Test Single Source**

   ```bash
   npm run single-source -- --url "YOUR_URL"
   ```

3. **Run Full Pipeline**
   ```bash
   npm run pipeline
   ```

---

## Files

- **Interactive Tool**: [`add-source.ts`](file:///Users/vasuvallabh/Downloads/DevDose/src/scripts/add-source.ts)
- **Bulk Import**: [`import-sources.ts`](file:///Users/vasuvallabh/Downloads/DevDose/src/scripts/import-sources.ts)
- **Example Sources**: [`example-sources.json`](file:///Users/vasuvallabh/Downloads/DevDose/example-sources.json)
- **Discovery Results**: `discovery-results.json`
