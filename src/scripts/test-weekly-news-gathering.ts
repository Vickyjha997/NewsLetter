import 'dotenv/config';
import { cohortDataService } from '../services/cohort-data.service';
import { weeklyNewsOrchestratorService } from '../services/weekly-news-orchestrator.service';
import { googleSearchService } from '../services/google-search.service';

/**
 * Test script to gather news for active cohorts
 * Usage: npm run test-weekly-news
 */
async function testWeeklyNewsGathering() {
    console.log('🚀 Starting Weekly News Gathering Test\n');

    // Check if Google Search is configured
    if (!googleSearchService.isConfigured()) {
        console.error('❌ Google Search API not configured!');
        console.log('\nPlease set in .env:');
        console.log('  GOOGLE_SEARCH_API_KEY=your_api_key');
        console.log('  GOOGLE_SEARCH_ENGINE_ID=your_engine_id');
        console.log('\nGet keys from: https://developers.google.com/custom-search/v1/overview');
        process.exit(1);
    }

    try {
        // Get active cohorts
        console.log('📋 Fetching active cohorts...');
        const cohorts = await cohortDataService.getActiveCohorts();

        if (cohorts.length === 0) {
            console.log('⚠️  No active cohorts found');
            console.log('   Active cohorts must have:');
            console.log('   - status = ACTIVE');
            console.log('   - start_date <= today');
            console.log('   - end_date >= today');
            return;
        }

        console.log(`✅ Found ${cohorts.length} active cohort(s)\n`);

        // Calculate week range (last 7 days)
        const weekEnd = new Date();
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        console.log(`📅 Gathering news from ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}\n`);

        // Process each cohort
        for (const cohort of cohorts) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Cohort: ${cohort.name || cohort.id}`);
            console.log(`Program: ${cohort.program.name}`);
            console.log(`University: ${cohort.program.academic_partner?.name || 'N/A'}`);
            console.log(`Faculty: ${cohort.faculty.length}`);
            console.log(`Participants: ${cohort.participants.length}`);
            console.log(`${'='.repeat(60)}`);

            const result = await weeklyNewsOrchestratorService.gatherNewsForCohort(
                cohort,
                weekStart,
                weekEnd
            );

            console.log(`\n📊 Summary for ${cohort.name || cohort.id}:`);
            console.log(`   Faculty news: ${result.facultyNewsCount}`);
            console.log(`   University news: ${result.universityNewsCount}`);
            console.log(`   Participant news: ${result.participantNewsCount}`);
            
            if (result.errors.length > 0) {
                console.log(`   Errors: ${result.errors.length}`);
                result.errors.forEach(err => console.log(`     - ${err}`));
            }
        }

        console.log('\n✅ News gathering complete!');
        console.log('\n💡 Next steps:');
        console.log('   1. Check NewsItem table in database');
        console.log('   2. Review gathered news items');
        console.log('   3. Build email generation service');
        console.log('   4. Schedule weekly execution');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await cohortDataService.disconnect();
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    testWeeklyNewsGathering();
}

export { testWeeklyNewsGathering };

