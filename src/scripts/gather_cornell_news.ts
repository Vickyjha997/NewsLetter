import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper to wait/sleep (to be polite to the server)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchArticleContent(url: string): Promise<string> {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        // Cornell specific selectors for article body
        let content = $('.field-name-body').text().trim(); // Common Drupal class
        if (!content) content = $('article').text().trim(); // Fallback

        // Clean up whitespace
        return content.replace(/\s+/g, ' ').substring(0, 500) + '...';
    } catch (e) {
        return "Failed to fetch content.";
    }
}

async function gatherCornellNews() {
    const url = 'https://news.cornell.edu';
    console.log(`Fetching news from ${url}...`);

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        console.log('\n--- Recent News from Cornell University ---\n');

        const articles: { title: string; link: string; summary: string }[] = [];
        const seenLinks = new Set<string>();

        $('a').each((i, element) => {
            const link = $(element).attr('href');
            if (!link) return;

            if (link.match(/\/stories\/20(24|25)\//)) {
                const title = $(element).text().trim();
                if (title.length < 5 || title.toLowerCase() === 'read more') return;

                const fullLink = link.startsWith('http') ? link : (url + link);

                if (!seenLinks.has(fullLink)) {
                    seenLinks.add(fullLink);
                    articles.push({ title, link: fullLink, summary: '' });
                }
            }
        });

        const recentArticles = articles.slice(0, 10);
        const goodKeywords = ['award', 'honor', 'breakthrough', 'success', 'win', 'grant', 'new', 'innovation', 'achievement', 'student', 'research', 'discovery', 'celebrate', 'gift', 'donation', 'publish', 'launch'];

        const goodNews = recentArticles.filter(a => {
            const text = a.title.toLowerCase();
            return goodKeywords.some(k => text.includes(k));
        });

        if (goodNews.length > 0) {
            console.log(`Found ${goodNews.length} "Good News" stories. Fetching details...`);

            for (const article of goodNews) {
                console.log(`\nProcessing: ${article.title}`);
                const content = await fetchArticleContent(article.link);

                console.log(`\n★ LINK: ${article.link}`);
                console.log(`  TITLE: ${article.title}`);
                console.log(`  SUMMARY: ${content}`);
                console.log('  ' + '-'.repeat(40));

                await sleep(500); // Be polite
            }
        } else {
            console.log("No specific 'good news' found to summarize.");
        }

    } catch (error: any) {
        console.error('Error fetching news:', error.message);
    }
}

gatherCornellNews();
