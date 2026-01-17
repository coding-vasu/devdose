# DevDose Deployment Guide

## Quick Deployment Steps

### 1. Deploy Backend (Railway)

1. **Sign up for Railway**

   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `coding-vasu/devdose`

3. **Configure Service**

   - Railway will auto-detect Node.js
   - It will use the `railway.json` configuration

4. **Set Environment Variables**

   In Railway Dashboard → Variables, add:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GITHUB_TOKEN=your_github_token
   GEMINI_API_KEY=your_gemini_api_key
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=*
   ```

5. **Deploy**
   - Railway auto-deploys on push
   - Get your backend URL: `https://your-app.railway.app`

---

### 2. Deploy Frontend (Netlify)

1. **Sign up for Netlify**

   - Go to https://app.netlify.com
   - Sign in with GitHub

2. **Import Project**

   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select `coding-vasu/devdose`

3. **Configure Build Settings**

   - **Base directory**: `apps/frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `apps/frontend/dist`
   - Netlify will auto-detect from `netlify.toml`

4. **Set Environment Variables**

   In Netlify Dashboard → Site settings → Environment variables:

   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy**

   - Click "Deploy site"
   - Get your frontend URL: `https://your-app.netlify.app`

6. **Update Backend CORS**
   - Go back to Railway
   - Update `CORS_ORIGIN` to your Netlify URL
   - Redeploy

---

## Post-Deployment

### Test Your Deployment

1. **Test Backend**

   ```bash
   curl https://your-backend.railway.app/api/health
   curl https://your-backend.railway.app/api/posts
   ```

2. **Test Frontend**
   - Visit your Netlify URL
   - Check if feed loads
   - Test filtering
   - Verify bookmarks work

### Custom Domain (Optional)

#### Netlify

1. Go to Domain settings
2. Add custom domain
3. Update DNS records

#### Railway

1. Go to Settings → Domains
2. Add custom domain
3. Update CNAME record

---

## Environment Variables Reference

### Backend (.env)

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...

# GitHub API
GITHUB_TOKEN=ghp_xxx...

# AI Model (choose one)
GEMINI_API_KEY=AIzxxx...
# or
OLLAMA_HOST=http://localhost:11434

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-app.netlify.app
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Automatic Deployments

Both platforms auto-deploy on git push:

```bash
git add .
git commit -m "your changes"
git push origin main

# Railway deploys backend ✅
# Netlify deploys frontend ✅
```

---

## Monitoring

### Railway

- Dashboard → Deployments → View Logs
- Metrics tab for usage stats

### Netlify

- Site overview → Deploys
- Functions tab (if using)
- Analytics (paid feature)

---

## Troubleshooting

### Backend won't start

- Check Railway logs
- Verify all environment variables set
- Ensure build command works locally

### Frontend shows errors

- Check browser console
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend

### API calls fail

- Verify CORS_ORIGIN includes frontend URL
- Check network tab in browser devtools
- Test backend URL directly

---

## Cost

**Railway:**

- $5 free credit/month
- ~500 hours execution
- $0.000463/GB-hour for usage

**Netlify:**

- 100GB bandwidth/month (free)
- 300 build minutes/month (free)
- Unlimited sites

**Total:** FREE within limits! 🎉

---

## Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Netlify
3. Test the live app
4. (Optional) Set up custom domain
5. (Optional) Set up monitoring/alerts

---

**Need help?** Check the logs in Railway/Netlify dashboards or refer to the main deployment plan.
