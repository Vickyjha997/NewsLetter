# Weekly Newsletter AI Agent - Implementation Plan

## Overview
Automated system that sends personalized weekly achievement digests to all participants in active cohorts. The agent collects good news about faculty, universities, and participants, then formats and emails them weekly.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Weekly Newsletter Orchestrator                 │
│              (Main Cron Job / Scheduled Task)               │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  1. Cohort   │ │  2. News     │ │  3. Email    │
│   Service    │ │   Gathering  │ │   Service    │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                 │                 │
       │        ┌────────┼────────┐        │
       │        │        │        │        │
       ▼        ▼        ▼        ▼        ▼
  ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │ Active │ │Faculty│ │University│ │Participant│ │ Generate │
  │Cohorts │ │ News  │ │  News   │ │   News    │ │  HTML    │
  └────────┘ └──────┘ └──────┘ └──────┘ └──────┘
       │        │        │        │        │
       └────────┴────────┴────────┴────────┘
                    │
                    ▼
              ┌──────────┐
              │ Database │
              │ (NewsItem│
              │ NewsletterSent)│
              └──────────┘
                    │
                    ▼
              ┌──────────┐
              │  Email   │
              │  Sending │
              └──────────┘
```

## Components Breakdown

### 1. **Cohort Data Service** (`cohort-data.service.ts`)
**Purpose**: Fetch active cohorts with all related data

**Key Functions**:
- `getActiveCohorts()`: Get cohorts where `status = ACTIVE` and current date is between `start_date` and `end_date`
- `getCohortWithRelations(cohortId)`: Get cohort with:
  - Faculty (via CohortFacultySection → CohortFacultySectionItem)
  - University (via Program → AcademicPartner)
  - Participants
  - Program details

**Database Query Pattern**:
```typescript
const cohorts = await prisma.cohort.findMany({
  where: {
    status: 'ACTIVE',
    start_date: { lte: new Date() },
    end_date: { gte: new Date() }
  },
  include: {
    program: {
      include: {
        academic_partner: true
      }
    },
    faculty_section: {
      include: {
        items: {
          include: {
            faculty: true
          }
        }
      }
    },
    participants: true
  }
});
```

---

### 2. **Google Search Service** (`google-search.service.ts`)
**Purpose**: Search Google for recent news about faculty and universities

**Key Functions**:
- `searchFacultyNews(facultyName, facultyDetails, weekStart, weekEnd)`: Search for faculty achievements
- `searchUniversityNews(universityName, weekStart, weekEnd)`: Search for university achievements
- Filter results for "good news" only (awards, honors, publications, etc.)

**Approach Options**:
- **Option A**: Use Google Custom Search API (requires API key, 100 free searches/day)
- **Option B**: Use SerpAPI or similar service (paid, more reliable)
- **Option C**: Use DuckDuckGo HTML scraping (free but less reliable)
- **Option D**: Combine university website scraping (existing) + Google search

**Recommendation**: Option D - Use existing university scrapers + add Google Custom Search for faculty

---

### 3. **Participant News Service** (`participant-news.service.ts`)
**Purpose**: Process participant LinkedIn PDFs to extract achievements

**Key Functions**:
- `processParticipantLinkedIn(participantId)`: Process LinkedIn PDF if exists
- `getRecentParticipantNews(cohortId, weekStart, weekEnd)`: Get news items for participants
- Uses existing `linkedInPDFService` and `geminiService`

**Note**: LinkedIn PDFs must be uploaded manually by participants (LinkedIn blocks automation)

---

### 4. **Weekly News Orchestrator** (`weekly-news-orchestrator.service.ts`)
**Purpose**: Orchestrate the entire news gathering process for a cohort

**Key Functions**:
- `gatherNewsForCohort(cohortId, weekStart, weekEnd)`: 
  1. Get cohort data (faculty, university, participants)
  2. For each faculty → Search Google → Save to NewsItem
  3. For university → Search Google + scrape website → Save to NewsItem
  4. For each participant → Process LinkedIn PDF → Save to NewsItem
  5. Return aggregated news items

- `filterGoodNewsOnly(newsItems)`: Filter using AI to ensure only positive news

**Error Handling**: 
- Continue if one faculty/university search fails
- Log errors but don't stop entire process
- Use rate limiting to avoid API limits

---

### 5. **Email Generation Service** (`email-generator.service.ts`)
**Purpose**: Generate HTML email from news items

**Key Functions**:
- `generateNewsletterHTML(cohort, newsItems, weekStart, weekEnd)`: 
  - Use Gemini to generate personalized intro
  - Format news items into sections (Faculty, University, Participants)
  - Create beautiful HTML template
  - Include unsubscribe link

**Email Template Structure**:
```
- Header (Cohort Name, Week Range)
- AI-Generated Intro (Gemini)
- Faculty Achievements Section
- University Achievements Section
- Participant Achievements Section
- Footer (Unsubscribe, Contact)
```

---

### 6. **Email Sending Service** (`email-sending.service.ts`)
**Purpose**: Send emails via SMTP or email service provider

**Key Functions**:
- `sendNewsletter(cohortId, htmlContent, recipients)`: Send to all participants
- Track sent status in `NewsletterSent` table
- Handle bounces and failures

**Email Service Options**:
- **SendGrid** (recommended): Easy API, good deliverability, free tier (100/day)
- **AWS SES**: Very cheap, but requires setup
- **Nodemailer + SMTP**: Use existing SMTP server
- **Resend**: Modern alternative, good developer experience

---

### 7. **Main Weekly Script** (`send-weekly-newsletter.ts`)
**Purpose**: Main entry point that runs weekly (cron job)

**Flow**:
```typescript
1. Calculate week range (last 7 days)
2. Get all active cohorts
3. For each cohort:
   a. Check if newsletter already sent this week (NewsletterSent table)
   b. Gather news (faculty, university, participants)
   c. If news found:
      - Generate HTML email
      - Send to all participants
      - Mark as sent in NewsletterSent
   d. Log results
4. Send summary report (optional)
```

---

## Implementation Steps

### Phase 1: Core Services (Week 1)
1. ✅ Create `cohort-data.service.ts` - Fetch active cohorts
2. ✅ Create `google-search.service.ts` - Google search integration
3. ✅ Update existing news gathering scripts to work with cohorts
4. ✅ Create `weekly-news-orchestrator.service.ts`

### Phase 2: Email System (Week 1-2)
5. ✅ Create `email-generator.service.ts` - HTML generation
6. ✅ Create `email-sending.service.ts` - Email delivery
7. ✅ Design and implement email templates

### Phase 3: Integration & Testing (Week 2)
8. ✅ Create `send-weekly-newsletter.ts` - Main orchestrator script
9. ✅ Add error handling and logging
10. ✅ Test with one cohort
11. ✅ Test with multiple cohorts

### Phase 4: Automation (Week 2-3)
12. ✅ Set up cron job / scheduled task
13. ✅ Add monitoring and alerts
14. ✅ Create admin dashboard (optional)

---

## File Structure

```
src/
├── services/
│   ├── gemini.service.ts                    ✅ (exists)
│   ├── linkedin-pdf.service.ts             ✅ (exists)
│   ├── news-storage.service.ts             ✅ (exists)
│   ├── cohort-data.service.ts              🆕 NEW
│   ├── google-search.service.ts            🆕 NEW
│   ├── participant-news.service.ts         🆕 NEW
│   ├── weekly-news-orchestrator.service.ts 🆕 NEW
│   ├── email-generator.service.ts          🆕 NEW
│   └── email-sending.service.ts            🆕 NEW
├── scripts/
│   ├── gather_all_news.ts                  ✅ (exists, needs update)
│   ├── gather_faculty_news.ts              ✅ (exists, needs update)
│   └── send-weekly-newsletter.ts           🆕 NEW
├── templates/
│   └── newsletter-email.html               🆕 NEW
└── types/
    └── newsletter.types.ts                 🆕 NEW
```

---

## Key Questions to Answer

### 1. **Google Search API**
- Do you have a Google Custom Search API key?
- If not, which search approach do you prefer? (Google API, SerpAPI, DuckDuckGo scraping)
- **Recommendation**: Start with Google Custom Search API (free tier: 100 searches/day)

### 2. **Email Service Provider**
- Which email service do you want to use?
  - SendGrid (recommended - easy, good free tier)
  - AWS SES (cheapest, requires AWS account)
  - SMTP server (if you have one)
- **Recommendation**: SendGrid for simplicity

### 3. **Scheduling**
- When should the weekly email be sent? (e.g., Monday 9 AM)
- Which day should represent the "week"? (e.g., Monday-Sunday)
- **Recommendation**: Monday morning, covering previous week (Mon-Sun)

### 4. **Participant Achievements**
- Continue with LinkedIn PDF approach (manual upload)?
- Or explore LinkedIn API (requires OAuth, more complex)?
- **Recommendation**: Keep PDF approach for now (already implemented)

### 5. **News Filtering**
- How strict should "good news" filtering be?
- Use keyword-based filtering (current) or AI-based sentiment analysis?
- **Recommendation**: Combine both - keywords first, then AI sentiment check

### 6. **Rate Limiting & API Costs**
- How many cohorts/faculty/participants are we dealing with?
- This affects Google API usage and costs
- **Recommendation**: Add delays between searches, cache results

---

## Environment Variables Needed

```env
# Existing
DATABASE_URL=...
GEMINI_API_KEY=...

# New - Google Search
GOOGLE_SEARCH_API_KEY=...          # For Google Custom Search API
GOOGLE_SEARCH_ENGINE_ID=...        # Custom Search Engine ID

# New - Email Service (choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=...

# Option 2: AWS SES
AWS_SES_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Option 3: SMTP
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM_EMAIL=...

# App Config
NEWSLETTER_SENDER_NAME=...         # e.g., "Your Program Team"
NEWSLETTER_SENDER_EMAIL=...        # e.g., "newsletter@yourdomain.com"
```

---

## Database Considerations

### Existing Models (Already Set Up ✅)
- `Cohort` - Has status, start_date, end_date
- `Participant` - Has email, linkedin_url, linkedin_pdf_path
- `Faculty` - Has name, academic_partner relationship
- `AcademicPartner` - University/partner info
- `NewsItem` - Stores news with type (FACULTY/UNIVERSITY/PARTICIPANT)
- `NewsletterSent` - Tracks sent newsletters

### Additional Indexes (May Need)
```sql
-- For querying active cohorts efficiently
CREATE INDEX idx_cohort_status_dates ON Cohort(status, start_date, end_date);

-- For querying news by week
CREATE INDEX idx_news_scraped_date ON NewsItem(scraped_at);
```

---

## Testing Strategy

1. **Unit Tests**: Test each service independently
2. **Integration Tests**: Test news gathering for one cohort
3. **End-to-End Test**: Full flow with test email addresses
4. **Dry Run Mode**: Test without sending emails

---

## Error Handling & Monitoring

### Error Scenarios:
- Google API quota exceeded → Log, continue with next cohort
- Email sending failure → Retry logic, mark as PARTIAL
- LinkedIn PDF processing fails → Skip participant, continue
- Database connection lost → Retry with exponential backoff

### Logging:
- Use structured logging (Winston or similar)
- Log to file + console
- Include: cohort ID, timestamp, operation, success/failure

### Monitoring:
- Track: News items found per cohort, emails sent, failures
- Send alert email if newsletter fails for multiple cohorts
- Dashboard to view newsletter history

---

## Cost Estimates

Assuming 10 cohorts, 5 faculty per cohort, 50 participants per cohort:

- **Google Custom Search API**: 
  - Free: 100 searches/day
  - If exceeded: $5 per 1,000 queries
  - Estimated: ~50 faculty searches/week = Free tier sufficient
  
- **Gemini API**: 
  - ~$0.01-0.05 per newsletter (summarization + email generation)
  - 10 cohorts = $0.10-0.50/week = $0.40-2/month
  
- **SendGrid**: 
  - Free: 100 emails/day
  - Paid: $19.95/month for 50,000 emails
  - 500 participants = Free tier sufficient
  
- **Total Estimated**: **$0-25/month** (depending on scale)

---

## Next Steps

1. **Answer the key questions above**
2. **Set up Google Custom Search API** (if using)
3. **Choose email service provider** and get API keys
4. **Start with Phase 1** - Create core services
5. **Test with one cohort** before scaling

---

## Recommendations Summary

1. ✅ **Google Search**: Use Google Custom Search API (free tier should be enough)
2. ✅ **Email Service**: SendGrid (easiest, good free tier)
3. ✅ **Scheduling**: Monday 9 AM, covering previous week
4. ✅ **Participant News**: Continue with LinkedIn PDF approach
5. ✅ **News Filtering**: Keyword-based + AI sentiment check
6. ✅ **Start Small**: Test with one cohort first

---

Would you like me to start implementing? Please provide:
1. Answers to the key questions above
2. API keys (or confirm if you want me to set up structure first)
3. Any specific preferences or constraints

