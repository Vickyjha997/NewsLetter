import 'dotenv/config';
import { linkedInScraperService } from '../services/linkedin-scraper.service';
import path from 'path';

/**
 * Test LinkedIn Profile URL Scraping
 * 
 * Usage: 
 * npm run test-linkedin-url
 * 
 * Or with custom URL:
 * ts-node src/scripts/test-linkedin-url-scraping.ts "https://www.linkedin.com/in/username/"
 */

async function testLinkedInURLScraping() {
    console.log('=== LinkedIn Profile URL Scraping Test ===\n');
    console.log('⚠️  Warning: LinkedIn may block automated access. Use sparingly.\n');

    // Get URL from command line argument or use default
    const profileUrl = process.argv[2] || 'https://www.linkedin.com/in/shubhamjnikam/';

    console.log(`📋 Profile URL: ${profileUrl}\n`);
    console.log('🔄 Starting browser automation...\n');

    try {
        // Scrape profile
        const profileData = await linkedInScraperService.scrapeProfile(profileUrl);

        if (!profileData) {
            console.error('❌ Failed to extract profile data');
            console.log('\nPossible reasons:');
            console.log('   - LinkedIn blocked automated access');
            console.log('   - Profile is private');
            console.log('   - Network timeout');
            console.log('   - Profile URL is invalid');
            console.log('\n💡 Alternatives:');
            console.log('   1. Use Google Search (already implemented)');
            console.log('   2. Request participant to download LinkedIn PDF');
            console.log('   3. Try again later (LinkedIn may have temporary blocks)');
            return;
        }

        console.log('✅ Profile Data Extracted:\n');
        console.log(`Name: ${profileData.name || 'Not found'}`);
        console.log(`Headline: ${profileData.headline || 'Not found'}`);
        console.log(`Location: ${profileData.location || 'Not found'}`);
        console.log(`\nAbout: ${profileData.about ? profileData.about.substring(0, 200) + '...' : 'Not found'}`);

        if (profileData.experience.length > 0) {
            console.log(`\nExperience (${profileData.experience.length} items):`);
            profileData.experience.slice(0, 5).forEach((exp, i) => {
                console.log(`   ${i + 1}. ${exp}`);
            });
        }

        if (profileData.education.length > 0) {
            console.log(`\nEducation (${profileData.education.length} items):`);
            profileData.education.slice(0, 3).forEach((edu, i) => {
                console.log(`   ${i + 1}. ${edu}`);
            });
        }

        if (profileData.skills.length > 0) {
            console.log(`\nSkills (${profileData.skills.length}): ${profileData.skills.slice(0, 10).join(', ')}${profileData.skills.length > 10 ? '...' : ''}`);
        }

        console.log(`\n📊 Total profile text: ${profileData.profileText.length} characters\n`);

        // Extract achievements using Gemini
        console.log('🤖 Analyzing with Gemini AI to extract achievements...\n');

        const achievements = await linkedInScraperService.extractAchievementsFromProfile(profileUrl);

        if (achievements.length > 0) {
            console.log(`✅ Found ${achievements.length} achievements:\n`);
            achievements.forEach((achievement, index) => {
                console.log(`${index + 1}. ${achievement}`);
            });
        } else {
            console.log('⚠️  No specific achievements detected.');
            console.log('   This could mean:');
            console.log('   - Profile has limited achievements listed');
            console.log('   - Gemini API key is not set');
            console.log('   - Profile text was insufficient');
        }

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('GEMINI_API_KEY')) {
            console.log('\n💡 Make sure GEMINI_API_KEY is set in your .env file');
        }
    } finally {
        // Close browser
        await linkedInScraperService.closeBrowser();
    }

    console.log('\n=== Test Complete ===');
}

testLinkedInURLScraping();

