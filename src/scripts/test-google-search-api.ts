import 'dotenv/config';
import { googleSearchService } from '../services/google-search.service';

/**
 * Test Google Search API connection
 * Usage: ts-node src/scripts/test-google-search-api.ts
 */
async function testGoogleSearchAPI() {
    console.log('🧪 Testing Google Search API Connection\n');

    // Check configuration
    if (!googleSearchService.isConfigured()) {
        console.error('❌ Google Search API not configured!');
        console.log('\nPlease set in .env:');
        console.log('  GOOGLE_SEARCH_API_KEY=your_api_key');
        console.log('  GOOGLE_SEARCH_ENGINE_ID=your_engine_id');
        console.log('\nCurrent values:');
        console.log(`  GOOGLE_SEARCH_API_KEY: ${process.env.GOOGLE_SEARCH_API_KEY ? '✅ Set' : '❌ Not set'}`);
        console.log(`  GOOGLE_SEARCH_ENGINE_ID: ${process.env.GOOGLE_SEARCH_ENGINE_ID ? '✅ Set' : '❌ Not set'}`);
        process.exit(1);
    }

    console.log('✅ API credentials found in .env\n');

    // Test simple query
    console.log('1️⃣ Testing simple query: "test"...');
    try {
        const results = await googleSearchService.search({ query: 'test', num: 1 });
        if (results.length > 0) {
            console.log(`✅ Success! Found ${results.length} result(s)`);
            console.log(`   First result: ${results[0].title}`);
        } else {
            console.log('⚠️ API responded but no results returned');
        }
    } catch (error: any) {
        console.error('❌ Test query failed');
        process.exit(1);
    }

    // Test faculty search
    console.log('\n2️⃣ Testing faculty search query...');
    try {
        const results = await googleSearchService.searchFacultyNews(
            'David Rand',
            'Professor',
            'Cornell University',
            7
        );
        console.log(`✅ Faculty search works! Found ${results.length} result(s)`);
        if (results.length > 0) {
            console.log(`   First result: ${results[0].title}`);
        }
    } catch (error: any) {
        console.error('❌ Faculty search failed');
    }

    console.log('\n✅ API test complete!');
    process.exit(0);
}

testGoogleSearchAPI();

