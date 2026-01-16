# Bite-Sized Content Optimization

## Overview

DevDose is designed to transform developer education through **bite-sized, scrollable cards** that can be consumed in ~30 seconds on mobile devices. All content is optimized for this format.

---

## Content Requirements

### Code Snippets

**Length Limits:**

- **Minimum:** 3 lines
- **Maximum:** 15 lines (prefer 5-10 lines)
- **Ideal:** 5-10 lines

**Extraction Rules:**

- Focus on ONE concept per card
- Remove boilerplate and imports unless essential
- Extract only the most relevant portion from longer code
- Ensure code is self-contained and understandable

### Explanations

**Word Count:**

- **Minimum:** 10 words
- **Ideal:** 40-80 words
- **Maximum:** 120 words (with warnings)

**Structure:**

1. **First sentence:** What the code does
2. **Second sentence:** Why it's useful/important
3. **Third sentence (optional):** When to use it

---

## AI Processing

### Automatic Optimization

The processing stage automatically:

1. **Detects long code** (>15 lines)
2. **Instructs AI to extract** only the core concept
3. **Validates output** against bite-sized requirements
4. **Warns** when content exceeds ideal limits

### Prompt Enhancements

The AI system prompt includes:

```
BITE-SIZED CONTENT REQUIREMENTS:
- Code snippets: 3-15 lines maximum (prefer 5-10 lines)
- If the input code is longer, extract ONLY the most important/relevant portion
- Focus on ONE concept per card
- Explanations: 2-3 sentences maximum (40-80 words)
- Each card should teach ONE specific thing
```

### Code Extraction

When input code is >15 lines, the AI receives:

```
IMPORTANT: This code is longer than ideal for a bite-sized card.
Extract ONLY the most relevant 5-10 lines that demonstrate the
core concept. Remove any boilerplate, imports, or setup code
unless they're essential to understanding.
```

---

## Validation

### During Processing

**Code Length:**

- Extracted at source (3-20 lines)
- AI instructed to extract core portions from longer code

**Explanation Length:**

- Validated: 10-120 words
- Warning logged if >80 words
- Rejected if <10 or >120 words

### Quality Checks

Posts are rejected if:

- Title >60 characters
- Explanation <10 or >120 words
- Missing required fields
- Invalid category

---

## Pipeline Configuration

### Extraction Stage

```typescript
{
  minCodeLines: 3,   // Reduced from 10
  maxCodeLines: 20,  // Reduced from 50
  languages: ["javascript", "typescript", "css", "html"]
}
```

### Processing Stage

```typescript
{
  batchSize: 15,
  maxRetries: 3,
  model: "llama3.2:3b"
}
```

---

## Best Practices

### For Manual Source Addition

When adding sources manually, prefer:

1. **Tutorial sites** with short, focused examples
2. **Documentation** with concise code samples
3. **GitHub repos** with example directories
4. **Blog posts** with specific tips/tricks

Avoid:

- Large framework implementations
- Complex full applications
- Lengthy configuration files

### For Content Quality

**Good Example:**

```javascript
// 7 lines - perfect for a card
const [count, setCount] = useState(0);

useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

**Too Long:**

```javascript
// 25 lines - needs extraction
import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
// ... lots of boilerplate ...
```

---

## Monitoring

### During Pipeline Execution

Watch for warnings:

```
⚠️  Explanation is long (95 words). Ideal: 40-80 words.
```

### In Results

Check `processing-results.json`:

- Review explanation lengths
- Verify code snippets are concise
- Confirm categories are appropriate

---

## Mobile-First Design

All content is optimized for:

- **Scrollable cards** on mobile devices
- **Syntax highlighting** for readability
- **Quick consumption** (~30 seconds per card)
- **Single concept** per card
- **Clear, scannable** explanations

---

## Configuration

### Environment Variables

```bash
# Extraction limits
MIN_CODE_LINES=3
MAX_CODE_LINES=20

# Processing
BATCH_SIZE=15
MAX_RETRIES=3
```

### Adjusting Limits

To change bite-sized thresholds, update:

1. **Extraction:** `src/pipeline/extraction/index.ts`
2. **AI Prompts:** `src/pipeline/processing/prompt-templates.ts`
3. **Validation:** `src/pipeline/processing/ollama-client.ts`

---

## Examples

### Quick Tips (5-7 lines)

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

**Explanation (52 words):** "useMemo caches the result of expensive calculations and only recomputes when dependencies change. This prevents unnecessary re-renders and improves performance in React components. Use it for complex computations that would otherwise run on every render."

### Common Mistakes (8-10 lines)

```javascript
// ❌ Don't do this
useEffect(() => {
  fetchData();
}); // Missing dependency array!

// ✅ Do this instead
useEffect(() => {
  fetchData();
}, []); // Empty array = run once
```

**Explanation (48 words):** "Forgetting the dependency array in useEffect causes it to run on every render, leading to infinite loops and performance issues. Always include the dependency array, even if it's empty, to control when the effect runs."

---

## Summary

✅ **Code:** 3-15 lines (prefer 5-10)
✅ **Explanation:** 40-80 words (max 120)
✅ **Focus:** ONE concept per card
✅ **Format:** Mobile-optimized scrollable cards
✅ **Time:** ~30 seconds to consume
