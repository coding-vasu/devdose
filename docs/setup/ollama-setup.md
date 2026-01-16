# Ollama Setup for DevDose Pipeline

## ✅ What's Been Done

### 1. Installed Ollama

- ✅ Installed via Homebrew
- ✅ Started Ollama service
- ⏳ Downloading Llama 3.2 (3B) model (~2GB, 12% complete)

### 2. Updated Pipeline Code

- ✅ Installed `ollama` NPM package
- ✅ Created `ollama-client.ts` - Local AI client
- ✅ Updated `processing/index.ts` to use Ollama instead of Gemini
- ✅ Configured for smaller batch sizes (5 instead of 10) for local processing

### 3. Model Configuration

- **Model:** `llama3.2:3b`
- **Size:** 2GB
- **Speed:** Fast (runs on your Mac)
- **Cost:** $0 - Completely free!

---

## 🎯 Next Steps

### Once Model Download Completes (~12 minutes):

1. **Test the Pipeline:**

   ```bash
   npm run test-pipeline
   ```

2. **Expected Results:**
   - ✅ 10 code snippets processed with AI
   - ✅ Titles and explanations generated
   - ✅ Quality scoring completed
   - ✅ Posts enriched with metadata
   - ✅ Published to Supabase database

---

## 🚀 How It Works

### Ollama vs Gemini

| Feature      | Gemini (Cloud)      | Ollama (Local)    |
| ------------ | ------------------- | ----------------- |
| **Cost**     | Free tier (limited) | 100% Free         |
| **Speed**    | Fast (API call)     | Fast (local)      |
| **Privacy**  | Data sent to Google | 100% Private      |
| **Internet** | Required            | Not required      |
| **Setup**    | API key needed      | One-time download |

### Pipeline Flow with Ollama

```
Code Snippet → Ollama (Local AI) → Generated Content
                ↓
          Title, Explanation,
          Difficulty, Tags,
          Quality Score
```

---

## 📊 Performance Expectations

### Processing Speed (Local)

- **Single snippet:** ~2-5 seconds
- **10 snippets:** ~30-60 seconds
- **100 snippets:** ~5-10 minutes

### Quality

- Llama 3.2 is a high-quality model
- Comparable to GPT-3.5
- Excellent for code explanation

---

## 🔧 Commands Reference

### Ollama Commands

```bash
# Check if Ollama is running
brew services list | grep ollama

# List downloaded models
ollama list

# Pull a different model
ollama pull llama3.2:1b  # Smaller, faster
ollama pull llama3.2:7b  # Larger, better quality

# Test Ollama directly
ollama run llama3.2:3b "Explain this code: const x = 5;"

# Stop Ollama service
brew services stop ollama
```

### Pipeline Commands

```bash
# Test pipeline with sample data
npm run test-pipeline

# Run full pipeline
npm run pipeline

# Run individual stages
npm run processing
npm run quality
npm run enrichment
npm run publishing
```

---

## 💡 Tips

### 1. **Model Selection**

- `llama3.2:1b` - Fastest, smallest (1GB)
- `llama3.2:3b` - **Recommended** - Good balance (2GB)
- `llama3.2:7b` - Best quality, slower (4GB)

### 2. **Batch Size**

Currently set to 5 snippets per batch. Adjust in `.env`:

```bash
BATCH_SIZE=5  # Smaller = slower but more stable
BATCH_SIZE=10 # Faster but uses more RAM
```

### 3. **Memory Usage**

- Llama 3.2 (3B) uses ~4GB RAM
- Make sure you have at least 8GB total RAM
- Close other apps if needed

---

## 🐛 Troubleshooting

### Model Download Stuck?

```bash
# Cancel and restart
pkill ollama
brew services restart ollama
ollama pull llama3.2:3b
```

### "Connection refused" Error?

```bash
# Make sure Ollama is running
brew services start ollama

# Check status
curl http://localhost:11434
```

### Out of Memory?

```bash
# Use smaller model
ollama pull llama3.2:1b

# Update pipeline to use it
# Edit src/pipeline/processing/index.ts
# Change: model: "llama3.2:1b"
```

---

## 🎉 Benefits of Ollama

1. **✅ No API Keys** - No setup hassle
2. **✅ Unlimited Usage** - Process as much as you want
3. **✅ Privacy** - Your code never leaves your computer
4. **✅ Offline** - Works without internet
5. **✅ Fast** - No network latency
6. **✅ Free** - Zero cost forever

---

## 📝 What's Next?

Once the model finishes downloading:

1. Run `npm run test-pipeline`
2. Check the results in Supabase
3. If it works, run the full pipeline with real data
4. Celebrate! 🎉

---

**Current Status:** ⏳ Downloading model... (12% complete, ~12 minutes remaining)

**Check progress:**

```bash
# In another terminal
watch -n 5 'ollama list'
```
