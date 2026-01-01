import { geminiService } from '../services/gemini.service';
import 'dotenv/config';

/**
 * Demo: Test Gemini's LinkedIn achievement extraction with sample data
 * This shows how the system will work once you upload your LinkedIn PDF
 */

const SAMPLE_LINKEDIN_TEXT = `
Vicky Jha
Full Stack Developer | AI/ML Enthusiast | Building Scalable Solutions

About:
Passionate software engineer with 3+ years of experience in building full-stack applications.
Specialized in React, Node.js, Python, and cloud technologies. Recently completed advanced
certification in AI/ML from Stanford Online.

Experience:

Senior Software Engineer at Tech Innovations Inc.
Jan 2024 - Present
• Led development of microservices architecture serving 1M+ users
• Implemented AI-powered recommendation system increasing engagement by 40%
• Mentored team of 5 junior developers
• Awarded "Innovation Champion Q3 2024" for outstanding contributions

Software Engineer at StartupXYZ
Jun 2022 - Dec 2023
• Built real-time analytics dashboard using React and WebSockets
• Reduced API response time by 60% through optimization
• Contributed to open-source projects (5000+ GitHub stars)

Education:
Bachelor of Technology in Computer Science
XYZ University, 2018-2022
• Dean's List all semesters
• Winner of National Hackathon 2021

Certifications:
• AWS Certified Solutions Architect (2024)
• Machine Learning Specialization - Stanford Online (2024)
• Google Cloud Professional Developer (2023)

Publications:
• "Optimizing Microservices with AI" - Tech Journal, Dec 2024
• Speaker at DevConf 2024 on "Building Scalable AI Systems"

Achievements:
• Promoted to Senior Engineer within 18 months
• Patent pending for "AI-based Code Review System"
• Contributed to 10+ open-source projects
• Mentored 15+ developers through coding bootcamp
`;

async function testGeminiExtraction() {
    console.log('=== Testing Gemini LinkedIn Achievement Extraction ===\n');
    console.log('📄 Sample LinkedIn Profile Data:\n');
    console.log(SAMPLE_LINKEDIN_TEXT.substring(0, 300) + '...\n');
    console.log('─'.repeat(60));

    try {
        console.log('\n🤖 Analyzing with Gemini AI...\n');

        const achievements = await geminiService.extractLinkedInAchievements(SAMPLE_LINKEDIN_TEXT);

        console.log(`✅ Extracted ${achievements.length} achievements:\n`);

        achievements.forEach((achievement, index) => {
            console.log(`${index + 1}. ${achievement}`);
        });

        console.log('\n─'.repeat(60));
        console.log('\n💡 How This Works for Real Profiles:\n');
        console.log('1. Download your LinkedIn profile as PDF');
        console.log('   (Settings → Data Privacy → Get a copy of your data)');
        console.log('\n2. Save PDF to: storage/linkedin-pdfs/test.pdf');
        console.log('\n3. Run: npm run test-linkedin-pdf');
        console.log('\n4. The system will:');
        console.log('   ✓ Extract text from PDF');
        console.log('   ✓ Send to Gemini AI');
        console.log('   ✓ Get structured achievements');
        console.log('   ✓ Save to database as NewsItem');
        console.log('\n5. These achievements will appear in weekly newsletters!');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);

        if (error.message.includes('GEMINI_API_KEY')) {
            console.log('\n💡 Make sure GEMINI_API_KEY is set in your .env file');
            console.log('   Current .env status: ' + (process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Missing'));
        }
    }

    console.log('\n=== Test Complete ===\n');
}

testGeminiExtraction();
