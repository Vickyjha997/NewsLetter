# Google API Key Troubleshooting Guide

## Error: "API key not valid. Please pass a valid API key."

This error means your API key is either:
1. ❌ Not set correctly in `.env`
2. ❌ Invalid or expired
3. ❌ Not enabled for Custom Search API
4. ❌ Has restrictions that block usage
5. ❌ Has extra quotes/whitespace

## Step-by-Step Fix

### 1. Check Your .env File

Open your `.env` file and verify:

```env
GOOGLE_SEARCH_API_KEY=your_actual_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_actual_engine_id_here
```

**Common mistakes:**
- ❌ `GOOGLE_SEARCH_API_KEY="AIza..."` (extra quotes)
- ❌ `GOOGLE_SEARCH_API_KEY = AIza...` (spaces around =)
- ✅ `GOOGLE_SEARCH_API_KEY=AIza...` (correct)

**Make sure:**
- No quotes around the values
- No spaces before/after the `=`
- The key starts with `AIza` (typical Google API key format)

### 2. Verify API Key in Google Cloud Console

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your API key
3. Click on it to edit
4. Check:
   - ✅ Key is **Enabled**
   - ✅ **API restrictions**: Should allow "Custom Search API" OR be unrestricted
   - ✅ **Application restrictions**: Should be appropriate for your use case

### 3. Enable Custom Search API

1. Go to [Google Cloud Console - APIs & Services](https://console.cloud.google.com/apis/library)
2. Search for "Custom Search API"
3. Click on it
4. Make sure it shows **"API Enabled"** (green)
5. If not, click **"Enable"**

### 4. Check Billing

Even for free tier, Google requires:
- ✅ Billing account linked to your project
- ✅ Valid payment method (won't be charged for free tier)

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Make sure your project has billing enabled

### 5. Create a New API Key (If Needed)

If the above doesn't work, create a new key:

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the new key
4. Click **"Restrict Key"**:
   - **API restrictions**: Select "Restrict key" → Check "Custom Search API"
   - **Application restrictions**: Leave as "None" (or configure as needed)
5. Click **"Save"**
6. Update your `.env` file with the new key

### 6. Verify Search Engine ID

Also verify your Custom Search Engine ID:

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Select your search engine
3. Go to **"Setup"** → **"Basics"**
4. Copy the **"Search engine ID"** (should be something like: `017576662512468239146:omuauf_lfve`)
5. Make sure it matches your `.env` file

### 7. Test the API Key Manually

You can test your API key directly in browser:

```
https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_ENGINE_ID&q=test
```

Replace:
- `YOUR_API_KEY` with your actual API key
- `YOUR_ENGINE_ID` with your actual engine ID

If this works in browser, the issue is with your `.env` file loading.

### 8. Restart Your Application

After updating `.env`:
- Close and restart your terminal/IDE
- Run the test again: `npm run test-google-api`

## Quick Checklist

- [ ] API key in `.env` has no quotes
- [ ] API key in `.env` has no spaces around `=`
- [ ] API key starts with `AIza`
- [ ] Custom Search API is enabled in Google Cloud
- [ ] API key restrictions allow Custom Search API
- [ ] Billing is enabled on Google Cloud project
- [ ] Search Engine ID is correct
- [ ] Restarted terminal/application after updating `.env`

## Still Not Working?

1. **Create a completely new API key** (fresh start)
2. **Create a new Search Engine** (in case engine ID is wrong)
3. **Check API key in browser** (as shown in step 7 above)
4. **Verify .env file location** (should be in project root)
5. **Check for typos** in the `.env` file

## Example .env File

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Google Gemini
GEMINI_API_KEY=your_gemini_key_here

# Google Custom Search (NO QUOTES!)
GOOGLE_SEARCH_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
GOOGLE_SEARCH_ENGINE_ID=017576662512468239146:omuauf_lfve
```

Notice: **No quotes around the values!**

