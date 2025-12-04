# How to Seed the Database on Railway

You have **3 options** to seed your database:

## Option 1: Use the Seed Endpoint (Easiest) ⭐

After your backend is deployed, simply make a POST request to:

```
POST https://node-performance-app-production.up.railway.app/admin/seed
```

You can do this from:
- **Browser**: Open the URL (though POST might not work in browser)
- **Terminal**: `curl -X POST https://node-performance-app-production.up.railway.app/admin/seed`
- **Postman/Insomnia**: Create a POST request to that URL

This will automatically seed the database if it's empty.

## Option 2: Railway CLI (Recommended)

1. **Install Railway CLI** (if you haven't):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to your project** (if not already):
   ```bash
   cd backend
   railway link
   ```

4. **Run the seed command**:
   ```bash
   railway run npm run prisma:seed
   ```

## Option 3: Railway Web Interface

1. Go to your Railway dashboard
2. Click on your **backend service** (not the database)
3. Go to **Deployments** tab
4. Click on the **active deployment**
5. Look for a **"Shell"** or **"Terminal"** button (usually in the top right or in the deployment details)
6. If you find it, run: `npm run prisma:seed`

**Note**: The shell option might not be available on all Railway plans or might be in a different location. If you can't find it, use Option 1 or 2 instead.

---

After seeding, test your API:
```bash
curl https://node-performance-app-production.up.railway.app/programs
```

You should see the NØDE Core Weekly and Villa Zeno Hybrid programs!

