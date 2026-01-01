import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { newsStorageService } from '../services/news-storage.service';
import { PrismaClient, NewsType } from '../../prisma/generated/prisma';
import 'dotenv/config';

const prisma = new PrismaClient();

// --- Configuration ---

interface NewsSource {
    url: string;
    type: 'html' | 'rss';
}

interface UniversityConfig {
    name: string;
    sources: NewsSource[];
    articleBaseUrl?: string;
}

const universities: UniversityConfig[] = [
    {
        name: "Cornell University",
        sources: [
            { url: "https://news.cornell.edu", type: 'html' },
            { url: "https://business.cornell.edu/news/", type: 'html' } // Added Business School specific
        ],
        articleBaseUrl: "https://news.cornell.edu" // Base for the main one, others might need logic
    },
    {
        name: "Michigan Ross School of Business",
        sources: [
            { url: "http://michiganross.umich.edu/ross-news-blog/feed", type: 'rss' },
            { url: "https://michiganross.umich.edu/news", type: 'html' } // Fallback/Addition
        ],
        articleBaseUrl: "https://michiganross.umich.edu"
    },
    {
        name: "Saïd Business School (Oxford)",
        sources: [
            { url: "https://www.sbs.ox.ac.uk/news", type: 'html' },
            //{ url: "https://www.sbs.ox.ac.uk/research/news", type: 'html' } // Research specific
        ],
        articleBaseUrl: "https://www.sbs.ox.ac.uk"
    },
    {
        name: "XED",
        sources: [
            { url: "https://xedinstitute.org/knowledge-hub", type: 'html' }
        ],
        articleBaseUrl: "https://xedinstitute.org"
    },
    {
        name: "Darden School of Business",
        sources: [
            { url: "https://news.darden.virginia.edu/", type: 'html' },
        ],
        articleBaseUrl: "https://news.darden.virginia.edu"
    }
];

// --- Helpers ---

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
    }
});

const GOOGLEBOT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br'
};

async function fetchArticleContent(url: string): Promise<string> {
    try {
        const isExternal = !url.includes('.edu') && !url.includes('xedinstitute.org') && !url.includes('ox.ac.uk');
        if (isExternal) return "External Link (Content not fetched automatically).";

        const { data } = await axios.get(url, {
            headers: GOOGLEBOT_HEADERS,
            timeout: 10000
        });
        const $ = cheerio.load(data);

        let content = '';
        const selectors = ['.field-name-body', '.entry-content', 'article', '.post-content', 'main', '.node__content', '.news-body', '#main-content'];

        for (const sel of selectors) {
            const text = $(sel).first().text().trim();
            if (text.length > 200) {
                content = text;
                break;
            }
        }

        if (!content) content = $('body').text().trim();

        return content.replace(/\s+/g, ' ').substring(0, 500) + '...';
    } catch (e: any) {
        return `Failed to fetch content: ${e.message}`;
    }
}

// --- Main Logic ---

async function gatherAllNews() {
    console.log('Starting Multi-University News Gathering (Expanded Sources)...');
    console.log('-------------------------------------------');

    const goodKeywords = ['award', 'honor', 'breakthrough', 'success', 'win', 'grant', 'new', 'innovation', 'achievement', 'student', 'research', 'discovery', 'celebrate', 'gift', 'donation', 'publish', 'launch', 'partner', 'rank', 'top', 'appoint', 'elect', 'fellow', 'leader', 'program', 'impact'];

    for (const uni of universities) {
        console.log(`\n=== Processing: ${uni.name} ===`);
        const allArticles: { title: string; link: string; summary: string }[] = [];
        const seenLinks = new Set<string>();

        for (const source of uni.sources) {
            console.log(`  Source: ${source.url} [${source.type.toUpperCase()}]`);

            try {
                if (source.type === 'rss') {
                    try {
                        const feed = await parser.parseURL(source.url);
                        feed.items.forEach(item => {
                            if (item.title && item.link) {
                                const snippet = item.contentSnippet || item.content || '';
                                if (!seenLinks.has(item.link)) {
                                    seenLinks.add(item.link);
                                    allArticles.push({ title: item.title, link: item.link, summary: snippet });
                                }
                            }
                        });
                    } catch (rssError: any) {
                        console.error(`    [!] RSS Error: ${rssError.message}`);
                    }
                } else {
                    // HTML
                    const { data } = await axios.get(source.url, {
                        headers: GOOGLEBOT_HEADERS,
                        timeout: 15000
                    });
                    const $ = cheerio.load(data);

                    // Specific Logic for different sub-sites (simplified generic logic for now)

                    // XED Specific
                    if (uni.name === "XED") {
                        $('h5').each((i, el) => {
                            const title = $(el).text().trim();
                            let link = $(el).find('a').attr('href') || $(el).closest('a').attr('href') || $(el).next().find('a').attr('href');
                            if (!link) { const container = $(el).closest('div'); link = container.find('a').attr('href'); }

                            if (title && link) {
                                let fullLink = link;
                                if (!link.startsWith('http')) {
                                    const baseUrl = uni.articleBaseUrl!.endsWith('/') ? uni.articleBaseUrl!.slice(0, -1) : uni.articleBaseUrl;
                                    const path = link.startsWith('/') ? link : '/' + link;
                                    fullLink = baseUrl + path;
                                }
                                if (!seenLinks.has(fullLink)) {
                                    seenLinks.add(fullLink);
                                    allArticles.push({ title, link: fullLink, summary: '' });
                                }
                            }
                        });
                    }

                    // Generic
                    $('a').each((i, element) => {
                        let link = $(element).attr('href');
                        let title = $(element).text().trim();

                        if (!link || !title || title.length < 10) return;

                        const isLikelyArticle =
                            link.includes('/news/') ||
                            link.includes('/stories/') ||
                            link.includes('/blog/') ||
                            link.includes('/article/') ||
                            link.includes('/ideas/') || // Darden Ideas
                            link.match(/\/\d{4}\/\d{2}\//);

                        const parentTag = $(element).parent().prop('tagName');
                        const isHeading = ['H1', 'H2', 'H3', 'H4', 'H5'].includes(parentTag || '');

                        if (isLikelyArticle || isHeading) {
                            let fullLink = link;
                            if (!link.startsWith('http')) {
                                // Handle relative links dynamically based on source URL domain if needed
                                // For simplicity reusing configured articleBaseUrl or deriving from source
                                let base = uni.articleBaseUrl;
                                if (!base) {
                                    const urlObj = new URL(source.url);
                                    base = urlObj.origin;
                                }

                                if (base) {
                                    const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
                                    const path = link.startsWith('/') ? link : '/' + link;
                                    fullLink = baseUrl + path;
                                } else {
                                    return;
                                }
                            }

                            if (!seenLinks.has(fullLink)) {
                                seenLinks.add(fullLink);
                                allArticles.push({ title, link: fullLink, summary: '' });
                            }
                        }
                    });
                }
            } catch (error: any) {
                console.error(`    [!] Error fetching source: ${error.message}`);
            }
            await sleep(500);
        }

        console.log(`  > Total Found: ${allArticles.length} items.`);

        // Filter and Display
        const goodNews = allArticles.filter(a => {
            const text = (a.title + " " + a.summary).toLowerCase();
            return goodKeywords.some(k => text.includes(k));
        });

        // Deduplicate by title
        const uniqueGoodNews = Array.from(new Map(goodNews.map(item => [item.title, item])).values()).slice(0, 4); // Top 4

        if (uniqueGoodNews.length > 0) {
            for (const article of uniqueGoodNews) {
                console.log(`    [+] ${article.title}`);

                let content = article.summary;
                if (article.summary.length < 50) {
                    content = await fetchArticleContent(article.link);
                    console.log(`        Summary: ${content}`);
                } else {
                    console.log(`        Summary: ${article.summary.replace(/\s+/g, ' ').substring(0, 200)}...`);
                }

                console.log(`        Link: ${article.link}`);

                // Save to database
                try {
                    // Find university ID by name
                    const university = await prisma.academicPartner.findFirst({
                        where: {
                            name: {
                                contains: uni.name.split(' ')[0], // Match by first word (Cornell, Michigan, etc.)
                                mode: 'insensitive'
                            }
                        }
                    });

                    if (university) {
                        await newsStorageService.saveNewsItem({
                            type: NewsType.UNIVERSITY,
                            sourceUrl: article.link,
                            title: article.title,
                            content: content,
                            universityId: university.id,
                            keywords: goodKeywords.filter(k =>
                                (article.title + ' ' + content).toLowerCase().includes(k)
                            )
                        });
                        console.log(`        ✓ Saved to database`);
                    } else {
                        console.log(`        ⚠ University not found in DB: ${uni.name}`);
                    }
                } catch (dbError: any) {
                    console.error(`        ✗ DB Error: ${dbError.message}`);
                }

                console.log('');
                await sleep(400);
            }
        } else {
            console.log(`    [-] No specific 'good news' found.`);
        }

        await sleep(1000);
    }

    await prisma.$disconnect();
    console.log('\n✅ News gathering complete!');
}

gatherAllNews();
