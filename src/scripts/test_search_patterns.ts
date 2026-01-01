import axios from 'axios';

// --- Configuration ---
const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
};

const patterns = {
    cornell: [
        'https://news.cornell.edu/search/stories/QUERY',
        'https://news.cornell.edu/search/node/QUERY',
        'https://news.cornell.edu/search?q=QUERY',
        'https://news.cornell.edu/search?keys=QUERY'
    ],
    michigan: [
        'https://michiganross.umich.edu/search/node/QUERY',
        'https://michiganross.umich.edu/search?keys=QUERY',
        'https://michiganross.umich.edu/search?q=QUERY'
    ],
    oxford: [
        'https://www.sbs.ox.ac.uk/search?search=QUERY',
        'https://www.sbs.ox.ac.uk/search/node/QUERY',
        'https://www.sbs.ox.ac.uk/search?q=QUERY'
    ],
    darden: [
        'https://news.darden.virginia.edu/?s=QUERY',
        'https://news.darden.virginia.edu/search?q=QUERY',
        'https://www.darden.virginia.edu/search?q=QUERY'
    ],
    xed: [
        'https://xedinstitute.org/?s=QUERY',
        'https://xedinstitute.org/search?q=QUERY'
    ]
};

async function testPattern(name: string, urlPattern: string) {
    const testQuery = "award"; // Generic term that should exist
    const url = urlPattern.replace('QUERY', testQuery);

    try {
        const { status, request } = await axios.get(url, {
            headers: BROWSER_HEADERS,
            validateStatus: () => true // Accept all codes to check redirect vs 404
        });

        console.log(`[${status}] ${url}`);
        if (request.res.responseUrl && request.res.responseUrl !== url) {
            console.log(`  -> Redirected to: ${request.res.responseUrl}`);
        }
        return status === 200;
    } catch (e: any) {
        console.log(`[ERR] ${url}: ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log("Testing Search Patterns...");

    console.log("\n--- CORNELL ---");
    for (const p of patterns.cornell) await testPattern("Cornell", p);

    console.log("\n--- MICHIGAN ---");
    for (const p of patterns.michigan) await testPattern("Michigan", p);

    console.log("\n--- OXFORD ---");
    for (const p of patterns.oxford) await testPattern("Oxford", p);

    console.log("\n--- DARDEN ---");
    for (const p of patterns.darden) await testPattern("Darden", p);

    console.log("\n--- XED ---");
    for (const p of patterns.xed) await testPattern("XED", p);
}

runTests();
