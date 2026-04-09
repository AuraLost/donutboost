# Deployment Guide: GitHub -> Render -> UptimeRobot

Follow these steps to deploy your **DonutBoost** platform and keep it alive 24/7.

## 1. Prepare your GitHub Repository
1. Initialize a git repository in your project folder (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DonutBoost Platform"
   ```
2. Create a new **Private** or **Public** repository on [GitHub](https://github.com/new).
3. Connect your local repo and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/donutboost.git
   git branch -M main
   git push -u origin main
   ```

## 2. Deploy to Render.com
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub account and select the `donutboost` repository.
3. Configure the following settings:
   - **Name**: `donutboost`
   - **Region**: Select the one closest to you.
   - **Branch**: `main`
   - **Root Directory**: (Leave blank)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
4. Click **Deploy Web Service**.

## 3. Keep it Alive with UptimeRobot
Render's free tier spins down after 15 minutes of inactivity. To keep it "hot":
1. Once deployed, copy your Render URL (e.g., `https://donutboost.onrender.com`).
2. Go to [UptimeRobot](https://uptimerobot.com/).
3. Click **Add New Monitor**.
4. Settings:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `DonutBoost Alive`
   - **URL (or IP)**: Your Render URL.
   - **Monitoring Interval**: `5 minutes` (Free tier limit).
5. Click **Create Monitor**.

## 4. Environment Variables (Optional)
If you add features like Discord integration later:
1. Go to **Settings** -> **Environment Variables** in Render.
2. Add your `DISCORD_CLIENT_ID`, etc., there.

---
**Your platform is now live and persistent!** 🚀
