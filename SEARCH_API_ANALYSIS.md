# Search API Options Analysis

## Requirements
- **Scale**: 10-15 cohorts × (2-3 faculty + 30-35 participants) + 10-15 universities
- **Weekly searches**: 
  - Faculty: 20-45 searches
  - Universities: 10-15 searches  
  - Participants: 300-525 searches (30-35 per cohort)
  - **Total: ~330-585 searches per week = ~47-83 searches per day**

## Option Comparison

### 1. Google Custom Search API ⭐ **RECOMMENDED**

**Pros:**
- ✅ Official Google API - reliable and stable
- ✅ High-quality search results
- ✅ Free tier: 100 searches/day (covers your needs perfectly!)
- ✅ After free tier: $5 per 1,000 queries (still very affordable)
- ✅ Easy to integrate
- ✅ Can filter by date range
- ✅ Good documentation

**Cons:**
- ❌ Requires API key setup (5 minutes)
- ❌ Needs a Custom Search Engine ID (CSE) - free to create

**Cost for your scale:**
- Free tier sufficient (83 searches/day < 100/day limit)
- Even if you grow, only ~$0.40/month at 100 searches/day

**Setup:** 
- Create Google Cloud project → Enable Custom Search API → Create CSE → Get API key

---

### 2. SerpAPI

**Pros:**
- ✅ Easy to use
- ✅ Good results
- ✅ No rate limits on paid plans

**Cons:**
- ❌ Paid service ($50/month for 5,000 searches minimum)
- ❌ Adds unnecessary cost when Google free tier works
- ❌ Another dependency to manage

**Cost:** $50/month (unnecessary for your needs)

**Verdict:** ❌ Not recommended - overkill and expensive

---

### 3. DuckDuckGo HTML Scraping

**Pros:**
- ✅ Completely free
- ✅ No API limits
- ✅ No API key needed

**Cons:**
- ❌ Unreliable - HTML structure changes frequently
- ❌ Can break easily (fragile)
- ❌ May get blocked/rate-limited
- ❌ Slower (full HTML parsing)
- ❌ Lower quality results
- ❌ No official API - violates ToS technically
- ❌ More complex code to maintain

**Verdict:** ❌ Not recommended for production - too fragile

---

## Recommendation: **Google Custom Search API**

**Why:**
1. ✅ **Free tier is perfect** - Your 83 searches/day is under the 100/day limit
2. ✅ **Reliable** - Official API, won't break
3. ✅ **Quality results** - Better than scraping
4. ✅ **Easy to maintain** - Standard API
5. ✅ **Scalable** - Can grow without major changes
6. ✅ **Cost-effective** - Free now, cheap if you grow

**Setup Time:** ~10 minutes
**Monthly Cost:** $0 (free tier sufficient)

---

## For Participant News (LinkedIn URLs Only)

Since you don't have LinkedIn PDFs, here are options:

### Option 1: Google Search (Recommended) ⭐
- Search: `"[Participant Name]" site:linkedin.com/in OR "achievement" OR "promoted" OR "award"`
- Search with recent date filter (past week)
- Pros: Finds public LinkedIn updates, news mentions, professional achievements
- Cons: Limited to public information

### Option 2: Google Search + News Sites
- Search broader: `"[Participant Name]" "company name" OR "promoted" OR "award" OR "new role"`
- Include news sites in search
- Pros: Catches public achievements in news
- Cons: May miss LinkedIn-only updates

### Option 3: LinkedIn Public Profile Scraping (Not Recommended)
- Scrape LinkedIn public profiles
- Cons: Violates LinkedIn ToS, can get blocked, fragile

**Recommendation:** Use Google Search with participant name + keywords + date filter. This will catch:
- Public LinkedIn posts (if participant posts publicly)
- News articles mentioning them
- Company announcements
- Professional achievements in public sources

