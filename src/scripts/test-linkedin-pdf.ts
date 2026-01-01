import { linkedInPDFService } from '../services/linkedin-pdf.service';
import path from 'path';

/**
 * Test LinkedIn PDF Processing
 * 
 * Usage:
 * 1. Download your LinkedIn profile as PDF
 * 2. Place it in: storage/linkedin-pdfs/test.pdf
 * 3. Run: npm run test-linkedin-pdf
 */

async function testLinkedInPDF() {
    console.log('=== LinkedIn PDF Processing Test ===\n');

    // Try Profile.pdf first, then fallback to test.pdf
    const pdfFiles = ['Profile.pdf', 'test.pdf'];
    let testPdfPath: string | null = null;
    let pdfFileName: string | null = null;

    for (const fileName of pdfFiles) {
        const pdfPath = path.join(process.cwd(), 'storage', 'linkedin-pdfs', fileName);
        const exists = await linkedInPDFService.pdfExists(pdfPath);
        if (exists) {
            testPdfPath = pdfPath;
            pdfFileName = fileName;
            break;
        }
    }

    if (!testPdfPath) {
        console.error('❌ PDF not found!');
        console.log('\nPlease:');
        console.log('1. Download your LinkedIn profile as PDF');
        console.log('2. Save it as: storage/linkedin-pdfs/Profile.pdf (or test.pdf)');
        console.log('3. Run this script again');
        return;
    }

    console.log(`✅ PDF found: ${pdfFileName}`);
    console.log(`📄 Path: ${testPdfPath}\n`);
    console.log('🔄 Processing PDF...\n');

    try {
        // Process the PDF
        const achievements = await linkedInPDFService.processLinkedInPDF(testPdfPath, 'test-participant');

        console.log(`\n✅ Extracted ${achievements.length} achievements:\n`);

        achievements.forEach((achievement, index) => {
            console.log(`${index + 1}. ${achievement}`);
        });

        if (achievements.length === 0) {
            console.log('\n⚠️  No achievements found. This could mean:');
            console.log('   - The PDF is empty or corrupted');
            console.log('   - Gemini API key is not set in .env');
            console.log('   - The profile has no recent achievements');
        }

    } catch (error: any) {
        console.error('\n❌ Error processing PDF:', error.message);

        if (error.message.includes('GEMINI_API_KEY')) {
            console.log('\n💡 Make sure GEMINI_API_KEY is set in your .env file');
        }
    }

    console.log('\n=== Test Complete ===');
}

testLinkedInPDF();
