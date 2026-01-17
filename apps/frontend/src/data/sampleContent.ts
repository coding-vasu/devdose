import { ContentCard } from '@/types/content';

export const sampleCards: ContentCard[] = [
  // Quick Tips
  {
    id: '1',
    type: 'quick-tip',
    title: 'Why ?? is safer than || in JavaScript',
    language: 'javascript',
    codeSnippet: `// ❌ || treats 0, "", false as falsy
const name = user.name || "Guest"

// ✅ ?? only defaults on null/undefined
const name = user.name ?? "Guest"`,
    explanation: 'The nullish coalescing operator (??) only treats null and undefined as falsy, unlike || which also catches 0, "", and false.',
    tags: ['JavaScript', 'ES2020'],
    difficulty: 'beginner',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing',
    viewCount: 12453,
    saveCount: 3241,
  },
  {
    id: '2',
    type: 'quick-tip',
    title: 'Destructure with defaults in one line',
    language: 'javascript',
    codeSnippet: `const { name = "Anonymous", age = 0 } = user

// Even works with renamed variables
const { name: userName = "Guest" } = user`,
    explanation: 'Combine destructuring with default values to handle missing properties elegantly without extra null checks.',
    tags: ['JavaScript', 'ES6'],
    difficulty: 'beginner',
    sourceName: 'JavaScript.info',
    sourceUrl: 'https://javascript.info/destructuring-assignment',
    viewCount: 8932,
    saveCount: 2156,
  },
  {
    id: '3',
    type: 'quick-tip',
    title: 'Use Array.at() for negative indexing',
    language: 'javascript',
    codeSnippet: `const arr = [1, 2, 3, 4, 5]

// ❌ Old way
arr[arr.length - 1] // 5

// ✅ New way
arr.at(-1) // 5
arr.at(-2) // 4`,
    explanation: 'Array.at() lets you use negative indices to access elements from the end, just like Python!',
    tags: ['JavaScript', 'ES2022'],
    difficulty: 'beginner',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at',
    viewCount: 6721,
    saveCount: 1823,
  },

  // Common Mistakes
  {
    id: '4',
    type: 'common-mistake',
    title: "forEach doesn't wait for async",
    language: 'javascript',
    codeSnippet: `// ❌ This won't work as expected
items.forEach(async (item) => {
  await saveItem(item)
})
console.log("Done!") // Runs immediately!

// ✅ Use for...of instead
for (const item of items) {
  await saveItem(item)
}
console.log("Done!") // Waits properly`,
    explanation: 'forEach ignores promises - use for...of for sequential async operations or Promise.all() for parallel.',
    tags: ['JavaScript', 'Async'],
    difficulty: 'intermediate',
    sourceName: 'Stack Overflow',
    sourceUrl: 'https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop',
    viewCount: 15632,
    saveCount: 4521,
  },
  {
    id: '5',
    type: 'common-mistake',
    title: 'Comparing objects with === always fails',
    language: 'javascript',
    codeSnippet: `// ❌ Objects are compared by reference
{ a: 1 } === { a: 1 } // false
[1, 2] === [1, 2]     // false

// ✅ Compare JSON or use deep equality
JSON.stringify(obj1) === JSON.stringify(obj2)

// Or use a library like lodash
_.isEqual(obj1, obj2)`,
    explanation: 'JavaScript compares objects by reference, not value. Two identical-looking objects are still different references in memory.',
    tags: ['JavaScript', 'Fundamentals'],
    difficulty: 'beginner',
    sourceName: 'JavaScript.info',
    sourceUrl: 'https://javascript.info/object-copy',
    viewCount: 11234,
    saveCount: 2987,
  },
  {
    id: '6',
    type: 'common-mistake',
    title: 'useState update is not immediate',
    language: 'jsx',
    codeSnippet: `// ❌ State won't be updated yet
const [count, setCount] = useState(0)

function handleClick() {
  setCount(count + 1)
  console.log(count) // Still 0!
}

// ✅ Use the functional form
setCount(prev => prev + 1)

// Or use useEffect to react to changes
useEffect(() => {
  console.log(count)
}, [count])`,
    explanation: 'React batches state updates for performance. The new value is available in the next render, not immediately after setState.',
    tags: ['React', 'Hooks'],
    difficulty: 'beginner',
    sourceName: 'React Docs',
    sourceUrl: 'https://react.dev/learn/state-as-a-snapshot',
    viewCount: 18234,
    saveCount: 5123,
  },

  // Did You Know
  {
    id: '7',
    type: 'did-you-know',
    title: 'CSS has native nesting now!',
    language: 'css',
    codeSnippet: `.card {
  background: white;
  
  /* Native nesting - no Sass needed! */
  & h2 {
    font-size: 1.5rem;
  }
  
  &:hover {
    background: #f0f0f0;
  }
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
}`,
    explanation: 'CSS nesting is now supported in all major browsers! No more need for preprocessors just for nesting.',
    tags: ['CSS', 'Modern'],
    difficulty: 'beginner',
    sourceName: 'web.dev',
    sourceUrl: 'https://web.dev/articles/css-nesting',
    viewCount: 9876,
    saveCount: 2654,
  },
  {
    id: '8',
    type: 'did-you-know',
    title: 'console.table() exists!',
    language: 'javascript',
    codeSnippet: `const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
]

// Instead of console.log()
console.table(users)

// Outputs a beautiful formatted table
// ┌─────────┬─────────┬─────┐
// │ (index) │  name   │ age │
// ├─────────┼─────────┼─────┤
// │    0    │ "Alice" │ 25  │
// │    1    │ "Bob"   │ 30  │
// └─────────┴─────────┴─────┘`,
    explanation: 'console.table() displays arrays and objects as formatted tables in the browser console. Perfect for debugging!',
    tags: ['JavaScript', 'DevTools'],
    difficulty: 'beginner',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/console/table',
    viewCount: 7543,
    saveCount: 1987,
  },
  {
    id: '9',
    type: 'did-you-know',
    title: 'You can import JSON directly in JS',
    language: 'javascript',
    codeSnippet: `// Modern browsers & bundlers support this!
import config from './config.json' assert { type: 'json' }

console.log(config.apiUrl)

// Or with dynamic import
const data = await import('./data.json', {
  assert: { type: 'json' }
})`,
    explanation: 'JSON modules let you import JSON files just like JavaScript modules. No more fetch + parse needed!',
    tags: ['JavaScript', 'ES2022'],
    difficulty: 'intermediate',
    sourceName: 'V8 Blog',
    sourceUrl: 'https://v8.dev/features/import-assertions',
    viewCount: 5432,
    saveCount: 1456,
  },

  // Quick Wins
  {
    id: '10',
    type: 'quick-win',
    title: 'Git undo last commit (keep changes)',
    language: 'bash',
    codeSnippet: `# Undo commit, keep changes staged
git reset --soft HEAD~1

# Undo commit, unstage changes
git reset HEAD~1

# Undo commit, discard changes ⚠️
git reset --hard HEAD~1`,
    explanation: 'Made a commit too early? Reset it! Use --soft to keep your changes staged, or no flag to unstage them.',
    tags: ['Git', 'CLI'],
    difficulty: 'beginner',
    sourceName: 'Git Docs',
    sourceUrl: 'https://git-scm.com/docs/git-reset',
    viewCount: 21345,
    saveCount: 6789,
  },
  {
    id: '11',
    type: 'quick-win',
    title: 'One-liner to flatten nested arrays',
    language: 'javascript',
    codeSnippet: `const nested = [1, [2, [3, [4]]]]

// Flatten one level
nested.flat() // [1, 2, [3, [4]]]

// Flatten completely
nested.flat(Infinity) // [1, 2, 3, 4]

// Combine with map
users.flatMap(u => u.orders)`,
    explanation: 'Array.flat() removes array nesting. Use Infinity to flatten all levels, or flatMap() to map and flatten in one step.',
    tags: ['JavaScript', 'ES2019'],
    difficulty: 'beginner',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat',
    viewCount: 8765,
    saveCount: 2345,
  },
  {
    id: '12',
    type: 'quick-win',
    title: 'Copy to clipboard in 2 lines',
    language: 'javascript',
    codeSnippet: `async function copyText(text) {
  await navigator.clipboard.writeText(text)
}

// With error handling
try {
  await navigator.clipboard.writeText("Hello!")
  showToast("Copied!")
} catch {
  showToast("Failed to copy")
}`,
    explanation: 'The Clipboard API makes copying text trivial. No more hacky textarea solutions needed!',
    tags: ['JavaScript', 'Web API'],
    difficulty: 'beginner',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText',
    viewCount: 12456,
    saveCount: 3567,
  },

  // Under the Hood
  {
    id: '13',
    type: 'under-the-hood',
    title: "Why React keys must be stable",
    language: 'jsx',
    codeSnippet: `// ❌ Random keys = re-render every item
{items.map(item => (
  <Item key={Math.random()} /> // Don't do this!
))}

// ❌ Index keys = bugs on reorder
{items.map((item, i) => (
  <Item key={i} /> // Breaks on sort/filter
))}

// ✅ Stable unique ID
{items.map(item => (
  <Item key={item.id} />
))}`,
    explanation: 'React uses keys to track which items changed. Unstable keys force full re-renders, destroying component state and causing performance issues.',
    tags: ['React', 'Performance'],
    difficulty: 'intermediate',
    sourceName: 'React Docs',
    sourceUrl: 'https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key',
    viewCount: 14567,
    saveCount: 4123,
  },
  {
    id: '14',
    type: 'under-the-hood',
    title: 'How the event loop actually works',
    language: 'javascript',
    codeSnippet: `console.log("1")

setTimeout(() => console.log("2"), 0)

Promise.resolve().then(() => console.log("3"))

console.log("4")

// Output: 1, 4, 3, 2
// Why? Microtasks (Promises) run before macrotasks (setTimeout)`,
    explanation: 'JavaScript has two task queues: microtasks (promises, queueMicrotask) run before macrotasks (setTimeout, events). This is why Promise.then runs before setTimeout, even with 0ms delay.',
    tags: ['JavaScript', 'Internals'],
    difficulty: 'advanced',
    sourceName: 'Jake Archibald',
    sourceUrl: 'https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/',
    viewCount: 9876,
    saveCount: 2876,
  },
  {
    id: '15',
    type: 'under-the-hood',
    title: 'CSS specificity is just math',
    language: 'css',
    codeSnippet: `/* Specificity: (IDs, Classes, Elements) */

p { }                  /* (0, 0, 1) */
.card { }              /* (0, 1, 0) */
#header { }            /* (1, 0, 0) */
p.card { }             /* (0, 1, 1) */
#header .nav a { }     /* (1, 1, 1) */
style=""               /* (1, 0, 0, 0) - inline wins */
!important             /* Overrides everything ⚠️ */`,
    explanation: 'Specificity is calculated as a three-part score: IDs beat classes, classes beat elements. When scores are equal, last rule wins.',
    tags: ['CSS', 'Fundamentals'],
    difficulty: 'beginner',
    sourceName: 'CSS-Tricks',
    sourceUrl: 'https://css-tricks.com/specifics-on-css-specificity/',
    viewCount: 11234,
    saveCount: 3456,
  },
  {
    id: '16',
    type: 'quick-tip',
    title: 'Optional chaining saves lines',
    language: 'javascript',
    codeSnippet: `// ❌ Verbose null checking
const city = user && user.address && user.address.city

// ✅ Optional chaining
const city = user?.address?.city

// Works with methods too!
user?.getProfile?.()

// And array access
items?.[0]?.name`,
    explanation: 'Optional chaining (?.) short-circuits to undefined if any part is null/undefined. Combine with ?? for powerful fallbacks.',
    tags: ['JavaScript', 'ES2020'],
    difficulty: 'beginner',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
    viewCount: 13245,
    saveCount: 3987,
  },
  {
    id: '17',
    type: 'did-you-know',
    title: 'CSS :has() is the parent selector!',
    language: 'css',
    codeSnippet: `/* Style parent based on children */
.card:has(img) {
  padding: 0; /* Cards with images */
}

/* Form validation styling */
form:has(:invalid) button {
  opacity: 0.5;
  pointer-events: none;
}

/* Responsive without media queries */
.grid:has(> :nth-child(4)) {
  grid-template-columns: repeat(2, 1fr);
}`,
    explanation: ':has() is the long-awaited parent selector! Style elements based on what they contain. It\'s like querySelector but in CSS.',
    tags: ['CSS', 'Modern'],
    difficulty: 'intermediate',
    sourceName: 'web.dev',
    sourceUrl: 'https://web.dev/articles/css-has',
    viewCount: 8765,
    saveCount: 2543,
  },
  {
    id: '18',
    type: 'common-mistake',
    title: "Don't forget cleanup in useEffect",
    language: 'jsx',
    codeSnippet: `// ❌ Memory leak: listener never removed
useEffect(() => {
  window.addEventListener('resize', handler)
}, [])

// ✅ Return cleanup function
useEffect(() => {
  window.addEventListener('resize', handler)
  
  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])`,
    explanation: 'Effects that add listeners, timers, or subscriptions MUST return a cleanup function. Otherwise you\'ll leak memory and create duplicate handlers.',
    tags: ['React', 'Hooks'],
    difficulty: 'intermediate',
    sourceName: 'React Docs',
    sourceUrl: 'https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed',
    viewCount: 16543,
    saveCount: 4876,
  },

  // --- Beginner ---

  // HTML/CSS
  {
    id: '19',
    type: 'quick-tip',
    title: 'Use <main> not just <div>',
    language: 'html',
    codeSnippet: `<main>
  <h1>Page Title</h1>
  <p>Content...</p>
</main>`,
    explanation: 'Semantic tags like <main>, <article>, and <nav> help screen readers and SEO engines understand your page structure better than generic <div>s.',
    tags: ['HTML', 'Accessibility'],
    difficulty: 'beginner',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main',
    viewCount: 4521,
    saveCount: 1201,
  },
  {
    id: '20',
    type: 'quick-win',
    title: 'The Holy Grail of Centering',
    language: 'css',
    codeSnippet: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
    explanation: 'The 3-line Flexbox combo is the modern standard for perfectly centering elements both horizontally and vertically.',
    tags: ['CSS', 'Flexbox'],
    difficulty: 'beginner',
    sourceName: 'CSS-Tricks',
    sourceUrl: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
    viewCount: 25630,
    saveCount: 8940,
  },
  {
    id: '21',
    type: 'did-you-know',
    title: 'border-box saves math',
    language: 'css',
    codeSnippet: `* {
  box-sizing: border-box;
}`,
    explanation: 'Default CSS adds padding/border to width. `border-box` includes them *within* the width, making layout math much easier.',
    tags: ['CSS', 'Layout'],
    difficulty: 'beginner',
    sourceName: 'web.dev',
    sourceUrl: 'https://web.dev/learn/css/box-model/',
    viewCount: 12500,
    saveCount: 3400,
  },

  // JavaScript
  {
    id: '22',
    type: 'common-mistake',
    title: 'Stop using var',
    language: 'javascript',
    codeSnippet: `// ❌ Function scoped, hoisted
var x = 1;

// ✅ Block scoped, clearer
const y = 2;
let z = 3;`,
    explanation: '`var` has confusing scoping rules. Use `const` by default for values that don\'t change, and `let` only when re-assignment is needed.',
    tags: ['JavaScript', 'Best Practices'],
    difficulty: 'beginner',
    sourceName: 'JavaScript.info',
    sourceUrl: 'https://javascript.info/var',
    viewCount: 34000,
    saveCount: 9800,
  },
  {
    id: '23',
    type: 'quick-tip',
    title: 'String interpolation made easy',
    language: 'javascript',
    codeSnippet: `const name = "Dev";
console.log(\`Hello \${name}!\`);`,
    explanation: 'Backticks (\`) allow you to embed variables directly into strings using ${} without messy concatenation.',
    tags: ['JavaScript', 'ES6'],
    difficulty: 'beginner',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals',
    viewCount: 18900,
    saveCount: 4500,
  },

  // React
  {
    id: '24',
    type: 'common-mistake',
    title: 'The Fragment Fix',
    language: 'jsx',
    codeSnippet: `// ✅ Use Fragment instead of div
return (
  <>
    <Header />
    <Main />
  </>
);`,
    explanation: 'JSX expressions must have one parent. `<>` (Fragments) let you group elements without adding extra nodes to the DOM.',
    tags: ['React', 'JSX'],
    difficulty: 'beginner',
    sourceName: 'React Docs',
    sourceUrl: 'https://react.dev/reference/react/Fragment',
    viewCount: 22100,
    saveCount: 5600,
  },
  {
    id: '25',
    type: 'common-mistake',
    title: 'Don\'t loop Hooks',
    language: 'jsx',
    codeSnippet: `// ❌ Fails
if (condition) useEffect(...)

// ✅ Top level only
useEffect(...)`,
    explanation: 'Hooks must run in the exact same order on every render. Never put them inside loops, conditions, or nested functions.',
    tags: ['React', 'Hooks'],
    difficulty: 'beginner',
    sourceName: 'React Docs',
    sourceUrl: 'https://react.dev/warnings/invalid-hook-call-warning',
    viewCount: 28900,
    saveCount: 7800,
  },

  // Angular
  {
    id: '26',
    type: 'quick-tip',
    title: 'Displaying data in templates',
    language: 'typescript',
    codeSnippet: `<h1>Hello {{ name }}!</h1>`,
    explanation: 'Use double curly braces `{{ }}` to embed component property values into your HTML template.',
    tags: ['Angular', 'Templates'],
    difficulty: 'beginner',
    sourceName: 'Angular Docs',
    sourceUrl: 'https://angular.io/guide/interpolation',
    viewCount: 15600,
    saveCount: 3200,
  },
  {
    id: '27',
    type: 'quick-win',
    title: 'Conditional Rendering',
    language: 'typescript',
    codeSnippet: `<div *ngIf="isLoggedIn; else loginBtn">
  Welcome!
</div>
<ng-template #loginBtn>Login</ng-template>`,
    explanation: 'The structural directive `*ngIf` adds or removes elements from the DOM based on a boolean condition.',
    tags: ['Angular', 'Directives'],
    difficulty: 'beginner',
    sourceName: 'Angular Docs',
    sourceUrl: 'https://angular.io/api/common/NgIf',
    viewCount: 19800,
    saveCount: 4100,
  },

  // Git
  {
    id: '28',
    type: 'quick-tip',
    title: 'What changed?',
    language: 'bash',
    codeSnippet: `git status`,
    explanation: 'Your best friend using the CLI. It shows staged changes, untracked files, and what branch you are on.',
    tags: ['Git', 'CLI'],
    difficulty: 'beginner',
    sourceName: 'Git Docs',
    sourceUrl: 'https://git-scm.com/docs/git-status',
    viewCount: 45000,
    saveCount: 12000,
  },
  {
    id: '29',
    type: 'quick-win',
    title: 'Oops, undo file edits',
    language: 'bash',
    codeSnippet: `git checkout -- filename.js
# or modern way
git restore filename.js`,
    explanation: 'Quickly revert a file back to its state in the last commit, discarding all local changes.',
    tags: ['Git', 'CLI'],
    difficulty: 'beginner',
    sourceName: 'Git Docs',
    sourceUrl: 'https://git-scm.com/docs/git-restore',
    viewCount: 32000,
    saveCount: 8900,
  },
  {
    id: '30',
    type: 'did-you-know',
    title: 'git add is a stage',
    language: 'bash',
    codeSnippet: `git add .`,
    explanation: 'Git has a "staging area" where you prepare commits. You can pick and choose exactly which files go into the next snapshot.',
    tags: ['Git', 'Concepts'],
    difficulty: 'beginner',
    sourceName: 'Atlassian Git',
    sourceUrl: 'https://www.atlassian.com/git/tutorials/saving-changes/git-add',
    viewCount: 21000,
    saveCount: 5400,
  },

  // --- Intermediate ---

  // JavaScript
  {
    id: '31',
    type: 'common-mistake',
    title: 'When to map?',
    language: 'javascript',
    codeSnippet: `// ❌ Returns undefined
const b = a.forEach(x => x*2)

// ✅ Returns new array
const b = a.map(x => x*2)`,
    explanation: 'Use `map` when you want to transform an array into a new one. Use `forEach` when you just want to perform side effects (like logging).',
    tags: ['JavaScript', 'Arrays'],
    difficulty: 'intermediate',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
    viewCount: 26700,
    saveCount: 7200,
  },
  {
    id: '32',
    type: 'quick-tip',
    title: 'Clean Object Access',
    language: 'javascript',
    codeSnippet: `const { age, name } = user;
// instead of
const age = user.age;`,
    explanation: 'Destructuring allows you to unpack values from arrays or properties from objects into distinct variables.',
    tags: ['JavaScript', 'ES6'],
    difficulty: 'intermediate',
    sourceName: 'JavaScript.info',
    sourceUrl: 'https://javascript.info/destructuring-assignment',
    viewCount: 23400,
    saveCount: 6500,
  },

  // React
  {
    id: '33',
    type: 'common-mistake',
    title: 'Lying to dependencies',
    language: 'jsx',
    codeSnippet: `useEffect(() => {
  console.log(count)
}, [count]) // ✅ Include everything used inside`,
    explanation: 'Always list *every* reactive value used inside the effect in the dependency array to avoid stale closures and bugs.',
    tags: ['React', 'Hooks'],
    difficulty: 'intermediate',
    sourceName: 'React Docs',
    sourceUrl: 'https://react.dev/learn/lifecycle-of-reactive-effects',
    viewCount: 31200,
    saveCount: 9100,
  },
  {
    id: '34',
    type: 'quick-win',
    title: 'Reusing Logic',
    language: 'jsx',
    codeSnippet: `function useWindowSize() {
  // state + effect logic
  return size;
}`,
    explanation: 'Extract stateful logic into a function starting with `use` to reuse it across multiple components.',
    tags: ['React', 'Hooks'],
    difficulty: 'intermediate',
    sourceName: 'React Docs',
    sourceUrl: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
    viewCount: 19500,
    saveCount: 5800,
  },

  // Angular
  {
    id: '35',
    type: 'quick-tip',
    title: 'No more .subscribe()',
    language: 'typescript',
    codeSnippet: `<div *ngIf="user$ | async as user">
  {{ user.name }}
</div>`,
    explanation: 'The `async` pipe automatically subscribes to an Observable and unsubscribes when the component is destroyed, preventing memory leaks.',
    tags: ['Angular', 'RxJS'],
    difficulty: 'intermediate',
    sourceName: 'Angular Docs',
    sourceUrl: 'https://angular.io/api/common/AsyncPipe',
    viewCount: 14300,
    saveCount: 3900,
  },

  // CSS
  {
    id: '36',
    type: 'under-the-hood',
    title: '1D vs 2D Layouts',
    language: 'css',
    codeSnippet: `display: flex; /* Row OR Col */
display: grid; /* Row AND Col */`,
    explanation: 'Use Flexbox for one-dimensional layouts (a row of buttons). Use Grid for two-dimensional layouts (entire page structure).',
    tags: ['CSS', 'Layout'],
    difficulty: 'intermediate',
    sourceName: 'CSS-Tricks',
    sourceUrl: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
    viewCount: 29800,
    saveCount: 8200,
  },
  {
    id: '37',
    type: 'quick-win',
    title: 'Native theming',
    language: 'css',
    codeSnippet: `:root {
  --main-color: #3498db;
}
.btn { color: var(--main-color); }`,
    explanation: 'CSS Custom Properties (variables) allow you to store values in one place and reuse them, making theming and maintenance easy.',
    tags: ['CSS', 'Variables'],
    difficulty: 'intermediate',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties',
    viewCount: 24500,
    saveCount: 6100,
  },

  // Git
  {
    id: '38',
    type: 'under-the-hood',
    title: 'Cleaner History',
    language: 'bash',
    codeSnippet: `git pull --rebase`,
    explanation: 'Rebasing rewrites history to make it a straight line, avoiding "merge bubbles" and making the project history easier to read.',
    tags: ['Git', 'Workflow'],
    difficulty: 'intermediate',
    sourceName: 'Atlassian Git',
    sourceUrl: 'https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase',
    viewCount: 18700,
    saveCount: 4600,
  },

  // --- Advanced ---

  // JavaScript
  {
    id: '39',
    type: 'under-the-hood',
    title: 'Macro vs Microtasks',
    language: 'javascript',
    codeSnippet: `// Promise (Micro) runs before Timeout (Macro)
Promise.resolve().then(log);`,
    explanation: 'The Event Loop prioritizes the Microtask queue (Promises) over the Macrotask queue (setTimeout), affecting code execution order.',
    tags: ['JavaScript', 'Internals'],
    difficulty: 'advanced',
    sourceName: 'Jake Archibald',
    sourceUrl: 'https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/',
    viewCount: 42100,
    saveCount: 11500,
  },
  {
    id: '40',
    type: 'under-the-hood',
    title: 'Data Privacy',
    language: 'javascript',
    codeSnippet: `function createCounter() {
  let count = 0;
  return () => ++count;
}`,
    explanation: 'A closure gives a function access to its outer scope even after the outer function has returned, enabling private state.',
    tags: ['JavaScript', 'Concepts'],
    difficulty: 'advanced',
    sourceName: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures',
    viewCount: 38900,
    saveCount: 9200,
  },

  // React
  {
    id: '41',
    type: 'common-mistake',
    title: 'Don\'t over-optimize',
    language: 'jsx',
    codeSnippet: `const cached = useMemo(() => compute(a), [a])`,
    explanation: 'Only use memoization for expensive calculations or reference equality checks. Overusing it adds necessary overhead.',
    tags: ['React', 'Performance'],
    difficulty: 'advanced',
    sourceName: 'Kent C. Dodds',
    sourceUrl: 'https://kentcdodds.com/blog/usememo-and-usecallback',
    viewCount: 29800,
    saveCount: 7400,
  },

  // Angular
  {
    id: '42',
    type: 'under-the-hood',
    title: 'OnPush Strategy',
    language: 'typescript',
    codeSnippet: `changeDetection: ChangeDetectionStrategy.OnPush`,
    explanation: 'Switching to `OnPush` tells Angular to only check this component when its Inputs change, significantly improving performance in large apps.',
    tags: ['Angular', 'Performance'],
    difficulty: 'advanced',
    sourceName: 'Angular University',
    sourceUrl: 'https://blog.angular-university.io/onpush-change-detection-how-it-works/',
    viewCount: 16500,
    saveCount: 4300,
  },

  // Git
  {
    id: '43',
    type: 'did-you-know',
    title: 'Finding Bugs Automatically',
    language: 'bash',
    codeSnippet: `git bisect start
git bisect bad HEAD
git bisect good <commit-hash>`,
    explanation: 'Use binary search to find the exact commit that introduced a bug. Git will checkout commits for you to test.',
    tags: ['Git', 'Advanced'],
    difficulty: 'advanced',
    sourceName: 'Git Docs',
    sourceUrl: 'https://git-scm.com/docs/git-bisect',
    viewCount: 13400,
    saveCount: 3100,
  },
];
