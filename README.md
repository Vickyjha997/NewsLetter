# Weekly Newsletter AI Agent

Automated system that sends personalized achievement digests to cohort participants every week.

## What We've Built (Phase 2 Complete)

### ✅ Infrastructure
- **University News Scraper**: Gathers news from 5 universities (Cornell, Michigan Ross, Oxford Saïd, Darden, XED)
- **Faculty News Scraper**: Searches for achievements of 60+ professors
- **Database Models**: Participant, NewsItem, NewsletterSent tables
- **AI Services**: Gemini 2.5 integration for summarization

### 🔄 Services Created
1. **Gemini Service** (`src/services/gemini.service.ts`)
   - Summarizes news articles
   - Extracts achievements from LinkedIn PDFs
   - Generates personalized email intros

2. **LinkedIn PDF Service** (`src/services/linkedin-pdf.service.ts`)
   - Processes LinkedIn profile PDFs
   - Extracts text and achievements
   - Stores PDFs in `storage/linkedin-pdfs/`

3. **News Storage Service** (`src/services/news-storage.service.ts`)
   - Saves news items to database
   - Auto-summarizes with Gemini
   - Queries news by cohort/date range

## Next Steps

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your keys
# - DATABASE_URL (PostgreSQL connection string)
# - GEMINI_API_KEY (your Gemini API key)
```

### 2. Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migration (creates new tables)
npx prisma migrate dev --name add_newsletter_tables

# Optional: Open Prisma Studio to view tables
npx prisma studio
```

### 3. Test LinkedIn PDF Processing

```bash
# Create a test script
npm run test-linkedin-pdf
```

### 4. Update Scrapers to Save to DB

The existing scrapers (`gather_all_news.ts`, `gather_faculty_news.ts`) need to be updated to:
- Import `newsStorageService`
- Call `saveNewsItem()` for each found article
- Associate with correct cohort/faculty/university

### 5. Implement Email Generation (Phase 4)

Install email dependencies:
```bash
npm install nodemailer @types/nodemailer
npm install react-email @react-email/components
```

## How LinkedIn PDF Works

### User Flow
1. Participant goes to LinkedIn → Settings → Data Privacy → "Get a copy of your data"
2. Select "Profile" → Download as PDF
3. Upload PDF to system (via admin panel or API endpoint)
4. System processes PDF with Gemini to extract achievements

### Technical Flow
```
PDF Upload → Save to storage/ → Extract text → Gemini API → Parse achievements → Save to NewsItem
```

## Database Schema

### Participant
- `name`, `email`, `linkedin_url`
- `linkedin_pdf_path` (path to stored PDF)
- `last_linkedin_update` (when PDF was last processed)
- Belongs to `Cohort`

### NewsItem
- `type` (FACULTY | UNIVERSITY | PARTICIPANT)
- `title`, `summary`, `content`
- `source_url`, `published_date`
- Relations: `faculty`, `university`, `participant`, `cohort`
- `keywords[]`, `sentiment`, `is_processed`

### NewsletterSent
- Tracks sent newsletters per cohort
- `week_start`, `week_end`
- `recipient_count`, `news_item_count`
- `status` (PENDING | SENDING | SENT | FAILED)

## Architecture

```
Weekly Cron Job
    ↓
Get Active Cohorts (status=ACTIVE, current date in range)
    ↓
For Each Cohort:
    ├─ Get Faculty → Scrape News → Save to DB
    ├─ Get University → Scrape News → Save to DB
    ├─ Get Participants → Process LinkedIn PDFs → Save to DB
    ↓
Generate Email HTML (with Gemini intro)
    ↓
Send to All Participants
    ↓
Mark as Sent in NewsletterSent table
```

## File Structure

```
src/
├── services/
│   ├── gemini.service.ts           # AI summarization
│   ├── linkedin-pdf.service.ts     # PDF processing
│   ├── news-storage.service.ts     # Database operations
│   ├── email-generator.service.ts  # (TODO Phase 4)
│   └── cohort-orchestrator.service.ts # (TODO Phase 5)
├── scripts/
│   ├── gather_all_news.ts          # University scraper
│   ├── gather_faculty_news.ts      # Faculty scraper
│   └── send-weekly-newsletter.ts   # (TODO Phase 5)
├── data/
│   └── faculty.ts                  # Faculty list
└── prisma/
    └── schema.prisma               # Database schema

storage/
└── linkedin-pdfs/                  # Uploaded PDFs
```

## Questions & Answers

**Q: How often should we process LinkedIn PDFs?**
A: Once per week, before sending the newsletter. Participants can re-upload anytime.

**Q: What if a participant doesn't have a LinkedIn PDF?**
A: Newsletter will still send, just without their personal achievements section.

**Q: How do we handle privacy/GDPR?**
A: PDFs are stored locally, only processed for achievements, participants opt-in via upload.

**Q: Can we automate LinkedIn PDF download?**
A: No - LinkedIn blocks automation. Manual download + upload is the most reliable approach.

## Cost Estimate

- **Gemini API**: ~$0.01-0.05 per newsletter (depends on content length)
- **Email Service**: $10-50/month (SendGrid/AWS SES)
- **Database**: $0-25/month (if using managed PostgreSQL)
- **Total**: ~$10-75/month for 100-500 participants

## Support

For questions or issues, refer to:
- [Implementation Plan](./brain/.../newsletter_agent_plan.md)
- [Task List](./brain/.../task.md)
