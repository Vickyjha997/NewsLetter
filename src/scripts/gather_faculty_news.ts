import axios from 'axios';
import * as cheerio from 'cheerio';
import { facultyList } from '../data/faculty';


const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
};

const SEARCH_CONFIGS: Record<string, { url: string, selector: string }> = {
    'Cornell University': {
        url: 'https://news.cornell.edu/search?q=QUERY',
        selector: '.search-result, .views-row' 
    },
    'Saïd Business School (Oxford)': {
        
        url: 'https://www.sbs.ox.ac.uk/search?search=QUERY',
        selector: '.search-result, .node--type-news'
    },
    'Darden School of Business': {
        url: 'https://news.darden.virginia.edu/?s=QUERY',
        selector: 'article, .post'
    },
    'XED': {
        url: 'https://xedinstitute.org/?s=QUERY',
        selector: 'article, .search-result'
    },
    'Michigan Ross School of Business': {
        // Blocks direct search, fallback to DDG site-search later or just return empty for now
        url: 'DDG_FALLBACK', // Special flag
        selector: ''
    }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runDuckDuckGoFallback(name: string, uni: string) {
    const query = `site:michiganross.umich.edu "${name}" news award`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    try {
        const { data } = await axios.get(url, { headers: BROWSER_HEADERS });
        const $ = cheerio.load(data);
        const items: { title: string, link: string }[] = [];
        $('.result').each((i, el) => {
            const t = $(el).find('.result__title a').text().trim();
            const l = $(el).find('.result__title a').attr('href');
            if (t && l && !l.includes('duckduckgo')) items.push({ title: t, link: l });
        });
        return items;
    } catch { return []; }
}

async function searchFaculty(faculty: { name: string, university: string }) {
    const config = SEARCH_CONFIGS[faculty.university];
    if (!config) {
        console.log(`[Skipping] No search config for ${faculty.university} (${faculty.name})`);
        return;
    }

    console.log(`\nSearching for: ${faculty.name} (${faculty.university})`);

    let items: { title: string, link: string, snippet?: string }[] = [];

    if (config.url === 'DDG_FALLBACK') {
        items = await runDuckDuckGoFallback(faculty.name, faculty.university);
    } else {
        const searchUrl = config.url.replace('QUERY', encodeURIComponent(faculty.name));
        try {
            const { data, request } = await axios.get(searchUrl, {
                headers: BROWSER_HEADERS,
                timeout: 10000
            });
            const $ = cheerio.load(data);

            // Generic Parsing Logic based on common structures
            // We try the specific selector, or fall back to 'a' tags inside generic containers
            const containers = $(config.selector);

            if (containers.length > 0) {
                containers.each((i, el) => {
                    const a = $(el).find('a').first();
                    const title = a.text().trim() || $(el).find('h3, h2').text().trim();
                    const link = a.attr('href');
                    const snippet = $(el).text().replace(/\s+/g, ' ').substring(0, 150);

                    if (title && link) items.push({ title, link, snippet });
                });
            } else {
                // If strict selector fails, try finding ANY link with title-like text that isn't nav
                $('main a, #content a').each((i, el) => {
                    const t = $(el).text().trim();
                    const l = $(el).attr('href');
                    if (t.length > 20 && l && !l.includes('search') && !l.includes('tag')) {
                        items.push({ title: t, link: l });
                    }
                });
            }

            // Normallize links
            items = items.map(item => {
                if (item.link && !item.link.startsWith('http')) {
                    const uObj = new URL(searchUrl); // Base logic
                    // If link starts with /, append to origin. Else relative? Assuming /
                    if (item.link.startsWith('/')) item.link = uObj.origin + item.link;
                    else item.link = uObj.origin + '/' + item.link;
                }
                return item;
            });

        } catch (e: any) {
            console.error(`  [Error] ${e.message}`);
        }
    }

    // Filter for Good News Keywords
    const goodKeywords = ['award', 'honor', 'prize', 'grant', 'research', 'publish', 'named', 'appointed', 'success', 'gift', 'chair', 'fellow'];
    const relevant = items.filter(i => {
        const txt = (i.title + (i.snippet || '')).toLowerCase();
        return goodKeywords.some(k => txt.includes(k));
    });

    if (relevant.length > 0) {
        console.log(`  > Found ${relevant.length} relevant items:`);
        relevant.slice(0, 3).forEach(r => {
            console.log(`    [+] ${r.title}`);
            console.log(`        Link: ${r.link}`);
        });
    } else {
        console.log(`  [-] No keywords found in ${items.length} raw results.`);
        if (items.length > 0) console.log(`      Latest: ${items[0].title} (${items[0].link})`);
    }
}

async function run() {
    console.log(`Starting Faculty News Gathering for ${facultyList.length} members...`);

    // Process in batches to avoid overwhelming servers
    const BATCH_SIZE = 5;
    for (let i = 0; i < facultyList.length; i += BATCH_SIZE) {
        const batch = facultyList.slice(i, i + BATCH_SIZE);
        console.log(`\n--- Batch ${i / BATCH_SIZE + 1} ---`);

        await Promise.all(batch.map(async (faculty) => {
            await searchFaculty(faculty);
            // Random jitter to look human
            await sleep(Math.random() * 2000 + 1000);
        }));

        // Wait longer between batches
        await sleep(3000);
    }
}

run();
