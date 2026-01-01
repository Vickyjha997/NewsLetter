# Google Custom Search API Setup Guide

## Quick Setup (10 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable billing (required, but free tier available)

### Step 2: Enable Custom Search API

1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Search for "Custom Search API"
3. Click "Enable"

### Step 3: Create API Key

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy the API key (you'll use this as `GOOGLE_SEARCH_API_KEY`)

**Optional:** Restrict the API key to "Custom Search API" only for security

### Step 4: Create Custom Search Engine (CSE)

1. Go to [Custom Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" to create a new search engine
3. **Sites to search**: Enter `*` (asterisk) to search the entire web
4. **Name**: Give it a name (e.g., "Newsletter News Search")
5. Click "Create"
6. Go to "Control Panel" → "Basics"
7. Copy the "Search engine ID" (you'll use this as `GOOGLE_SEARCH_ENGINE_ID`)

### Step 5: Add to .env

Add these to your `.env` file:

```env
GOOGLE_SEARCH_API_KEY="your_api_key_here"
GOOGLE_SEARCH_ENGINE_ID="your_engine_id_here"
```

### Step 6: Test

Run the test script:

```bash
npm run test-weekly-news
```

## Free Tier Limits

- **100 searches per day** (free)
- Your usage: ~47-83 searches/day (well within free tier!)
- After free tier: $5 per 1,000 queries

## Troubleshooting

### "API key not valid"
- Make sure you enabled Custom Search API
- Check API key is correct
- Ensure billing is enabled on Google Cloud project

### "Search engine ID not found"
- Check CSE ID is correct
- Make sure CSE is set to "Search the entire web" (*)

### "Quota exceeded"
- You've exceeded 100 searches/day
- Wait until next day, or upgrade to paid tier
- Check your usage at: https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas

## References

- [Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
- [Custom Search Engine Setup](https://programmablesearchengine.google.com/)

