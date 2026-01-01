# Weekly Newsletter AI Agent - Updated README

## Quick Start

### 1. Set Up Google Custom Search API (10 minutes)

Follow the guide in `GOOGLE_SEARCH_SETUP.md` to:
- Create Google Cloud project
- Enable Custom Search API
- Create API key
- Create Custom Search Engine
- Get credentials

### 2. Configure Environment

Copy `.env.example` to `.env` and add:
```env
DATABASE_URL="your_database_url"
GEMINI_API_KEY="your_gemini_key"
GOOGLE_SEARCH_API_KEY="your_google_search_api_key"
GOOGLE_SEARCH_ENGINE_ID="your_search_engine_id"
```

### 3. Test News Gathering

```bash
npm run test-weekly-news
```

This will:
- Find all active cohorts
- Gather news for faculty, universities, and participants
- Save news items to database
- Show summary statistics

## What's Built

### ✅ Core Services (Complete)

1. **Google Search Service** - Searches for news using Google Custom Search API
2. **Cohort Data Service** - Fetches active cohorts with all relations
3. **Weekly News Orchestrator** - Coordinates news gathering process

### ✅ Database (Already Set Up)

- `Cohort` - Programs with status, dates
- `Participant` - Participants with LinkedIn URLs
- `Faculty` - Faculty members
- `AcademicPartner` - Universities
- `NewsItem` - Stores gathered news
- `NewsletterSent` - Tracks sent newsletters

### ⏳ Coming Later

- Email generation service
- Email sending service
- Weekly scheduling/cron job

## Architecture

```
┌─────────────────────────────────────┐
│   Active Cohorts (Database)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Cohort Data Service               │
│   - Get active cohorts              │
│   - Load faculty, university,       │
│     participants                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Weekly News Orchestrator          │
│   - For each cohort:                │
│     • Faculty news (Google)         │
│     • University news (Google)      │
│     • Participant news (Google)     │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│ Google      │  │ News Storage │
│ Search API  │  │ Service      │
└─────────────┘  └──────┬───────┘
                        │
                        ▼
                ┌──────────────┐
                │ NewsItem     │
                │ Table        │
                └──────────────┘
```

## Scale & Costs

- **Your Scale**: 10-15 cohorts, 2-3 faculty each, 30-35 participants each
- **Searches/Week**: ~330-585
- **Searches/Day**: ~47-83
- **Google API**: Free tier (100/day) ✅ Covers your needs!
- **Cost**: $0/month (free tier sufficient)

## Key Features

✅ **Active Cohort Detection** - Only processes cohorts that are currently active
✅ **Google Search Integration** - Reliable, official API
✅ **Good News Filtering** - Only saves positive achievements
✅ **Rate Limiting** - Prevents API quota issues
✅ **Error Handling** - Continues if one search fails
✅ **Database Integration** - All news saved with proper relationships

## Test Script Output Example

```
🚀 Starting Weekly News Gathering Test

📋 Fetching active cohorts...
✅ Found 3 active cohort(s)

📅 Gathering news from 1/15/2024 to 1/22/2024

============================================================
Cohort: Executive Leadership Program - Cohort 1
Program: Executive Leadership Program
University: Cornell University
Faculty: 3
Participants: 32
============================================================

📰 Gathering news for cohort: Executive Leadership Program - Cohort 1
  👨‍🏫 Processing 3 faculty...
    ✅ Found 2 news items for Dr. John Doe
    ✅ Found 1 news items for Dr. Jane Smith
  🏛️  Processing university: Cornell University...
    ✅ Found 3 news items for Cornell University
  👥 Processing 32 participants...
  ✅ Completed: Faculty: 3, University: 3, Participants: 5

📊 Summary for Executive Leadership Program - Cohort 1:
   Faculty news: 3
   University news: 3
   Participant news: 5
   Errors: 0

✅ News gathering complete!
```

## Next Steps

1. ✅ Set up Google Custom Search API
2. ✅ Test news gathering
3. ✅ Verify news items in database
4. ⏳ Build email generation (when ready)
5. ⏳ Build email sending (when ready)
6. ⏳ Set up weekly scheduling (when ready)

## Documentation

- `IMPLEMENTATION_PLAN.md` - Complete architecture
- `SEARCH_API_ANALYSIS.md` - Search API comparison
- `GOOGLE_SEARCH_SETUP.md` - Google API setup guide
- `IMPLEMENTATION_SUMMARY.md` - What's been built

## Support

For issues or questions:
- Check `GOOGLE_SEARCH_SETUP.md` for API setup
- Review error messages in console
- Check database for NewsItem entries
- Verify cohort status and dates

