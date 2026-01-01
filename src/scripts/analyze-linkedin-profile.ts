import axios from 'axios';
import * as cheerio from 'cheerio';
import { geminiService } from '../services/gemini.service';
import 'dotenv/config';

/**
 * Scrape public LinkedIn profile and extract achievements
 * Note: This only works for public profiles and gets limited data
 */

async function scrapeLinkedInProfile(profileUrl: string) {
    console.log('=== LinkedIn Profile Analysis ===\n');
    console.log(`Profile URL: ${profileUrl}\n`);

    try {
        // Fetch the public profile page
        const { data } = await axios.get(profileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);

        // Extract visible profile information
        const name = $('h1').first().text().trim() ||
            $('.top-card-layout__title').text().trim() ||
            $('[class*="name"]').first().text().trim();

        const headline = $('.top-card-layout__headline').text().trim() ||
            $('[class*="headline"]').first().text().trim();

        const about = $('.about-section').text().trim() ||
            $('[class*="summary"]').text().trim();

        // Try to extract experience section
        const experience = $('.experience-section').text().trim() ||
            $('[class*="experience"]').text().trim();

        console.log('📋 Profile Information Extracted:\n');
        console.log(`Name: ${name || 'Not found'}`);
        console.log(`Headline: ${headline || 'Not found'}`);
        console.log(`About: ${about.substring(0, 200) || 'Not found'}...\n`);

        // Combine all text for analysis
        const profileText = `
Name: ${name}
Headline: ${headline}
About: ${about}
Experience: ${experience}
        `.trim();

        if (profileText.length < 100) {
            console.log('⚠️  LinkedIn is blocking automated access or profile is private.');
            console.log('   The page returned minimal data.\n');
            console.log('💡 Alternative: Please download your LinkedIn profile as PDF:');
            console.log('   1. Go to LinkedIn → Settings → Data Privacy');
            console.log('   2. Request "Profile" data');
            console.log('   3. Save PDF to: storage/linkedin-pdfs/test.pdf');
            console.log('   4. Run: npm run test-linkedin-pdf\n');
            return;
        }

        console.log('🤖 Analyzing with Gemini AI...\n');

        // Use Gemini to extract achievements
        const achievements = await geminiService.extractLinkedInAchievements(profileText);

        console.log(`✅ Found ${achievements.length} achievements:\n`);

        achievements.forEach((achievement, index) => {
            console.log(`${index + 1}. ${achievement}`);
        });

        if (achievements.length === 0) {
            console.log('⚠️  No specific achievements detected.');
            console.log('   This could mean:');
            console.log('   - Profile has limited public information');
            console.log('   - No recent achievements in visible sections');
            console.log('   - LinkedIn blocked the scraper\n');
        }

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);

        if (error.response?.status === 999) {
            console.log('\n💡 LinkedIn detected automated access (Error 999)');
            console.log('   Please use the manual PDF download method instead.');
        } else if (error.message.includes('GEMINI_API_KEY')) {
            console.log('\n💡 Make sure GEMINI_API_KEY is set in your .env file');
        }
    }

    console.log('\n=== Analysis Complete ===');
}

// Test with the provided profile
const profileUrl = process.argv[2] || 'https://www.linkedin.com/in/vicky-jha-2606a2208';
scrapeLinkedInProfile(profileUrl);
