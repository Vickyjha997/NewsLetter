import { googleSearchService } from './google-search.service';
import { newsStorageService } from './news-storage.service';
import { cohortDataService, CohortWithRelations } from './cohort-data.service';
import { NewsType } from '../../prisma/generated/prisma';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface NewsGatheringResult {
    facultyNewsCount: number;
    universityNewsCount: number;
    participantNewsCount: number;
    errors: string[];
}

export class WeeklyNewsOrchestratorService {
    private readonly goodNewsKeywords = [
        'award', 'honor', 'prize', 'grant', 'publish', 'research', 'named',
        'appointed', 'recognition', 'achievement', 'success', 'breakthrough',
        'book', 'speaking', 'conference', 'fellowship', 'chair', 'professor',
        'promoted', 'new role', 'certification', 'leadership', 'innovation'
    ];

    /**
     * Gather all news for a specific cohort within a date range
     */
    async gatherNewsForCohort(
        cohort: CohortWithRelations,
        weekStart: Date,
        weekEnd: Date
    ): Promise<NewsGatheringResult> {
        const result: NewsGatheringResult = {
            facultyNewsCount: 0,
            universityNewsCount: 0,
            participantNewsCount: 0,
            errors: []
        };

        const daysBack = Math.ceil((Date.now() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`\n📰 Gathering news for cohort: ${cohort.name || cohort.id}`);

        // 1. Gather Faculty News
        if (cohort.faculty.length > 0) {
            console.log(`  👨‍🏫 Processing ${cohort.faculty.length} faculty...`);
            for (const faculty of cohort.faculty) {
                try {
                    const count = await this.gatherFacultyNews(
                        faculty,
                        cohort.id,
                        cohort.program.academic_partner?.name,
                        daysBack
                    );
                    result.facultyNewsCount += count;

                    // Rate limiting: wait between searches
                    await this.sleep(1000);
                } catch (error: any) {
                    const errorMsg = `Error gathering news for faculty ${faculty.name}: ${error.message}`;
                    console.error(`    ❌ ${errorMsg}`);
                    result.errors.push(errorMsg);
                }
            }
        }

        // 2. Gather University News
        if (cohort.program.academic_partner) {
            console.log(`  🏛️  Processing university: ${cohort.program.academic_partner.name}...`);
            try {
                const count = await this.gatherUniversityNews(
                    cohort.program.academic_partner,
                    cohort.id,
                    daysBack
                );
                result.universityNewsCount += count;

                await this.sleep(1000);
            } catch (error: any) {
                const errorMsg = `Error gathering news for university ${cohort.program.academic_partner.name}: ${error.message}`;
                console.error(`    ❌ ${errorMsg}`);
                result.errors.push(errorMsg);
            }
        }

        // 3. Gather Participant News
        if (cohort.participants.length > 0) {
            console.log(`  👥 Processing ${cohort.participants.length} participants...`);
            for (const participant of cohort.participants) {
                try {
                    const count = await this.gatherParticipantNews(
                        participant,
                        cohort.id,
                        daysBack
                    );
                    result.participantNewsCount += count;

                    // Rate limiting: wait between searches
                    await this.sleep(1500);
                } catch (error: any) {
                    const errorMsg = `Error gathering news for participant ${participant.name}: ${error.message}`;
                    console.error(`    ❌ ${errorMsg}`);
                    result.errors.push(errorMsg);
                }
            }
        }

        console.log(`  ✅ Completed: Faculty: ${result.facultyNewsCount}, University: ${result.universityNewsCount}, Participants: ${result.participantNewsCount}`);

        return result;
    }

    /**
     * Gather news for a specific faculty member
     */
    private async gatherFacultyNews(
        faculty: {
            id: string;
            name: string;
            preferred_name: string | null;
            title: string | null;
            academic_partner: { id: string; name: string } | null;
        },
        cohortId: string,
        universityName?: string | null,
        daysBack: number = 7
    ): Promise<number> {
        if (!googleSearchService.isConfigured()) {
            console.warn(`    ⚠️  Google Search API not configured, skipping ${faculty.name}`);
            return 0;
        }

        const searchName = faculty.preferred_name || faculty.name;
        const searchResults = await googleSearchService.searchFacultyNews(
            searchName,
            faculty.title || undefined,
            universityName || undefined,
            daysBack
        );

        let savedCount = 0;

        for (const result of searchResults) {
            try {
                // Fetch full content if needed
                const content = await this.fetchArticleContent(result.link);

                await newsStorageService.saveNewsItem({
                    type: NewsType.FACULTY,
                    sourceUrl: result.link,
                    title: result.title,
                    content: content || result.snippet,
                    publishedDate: result.publishedDate ? new Date(result.publishedDate) : undefined,
                    facultyId: faculty.id,
                    cohortId: cohortId,
                    keywords: this.extractKeywords(result.title + ' ' + result.snippet)
                });

                savedCount++;
            } catch (error: any) {
                console.error(`      ⚠️  Failed to save news item: ${error.message}`);
            }
        }

        if (savedCount > 0) {
            console.log(`    ✅ Found ${savedCount} news items for ${faculty.name}`);
        }

        return savedCount;
    }

    /**
     * Gather news for a specific university
     */
    private async gatherUniversityNews(
        university: {
            id: string;
            name: string;
            display_name: string | null;
        },
        cohortId: string,
        daysBack: number = 7
    ): Promise<number> {
        let savedCount = 0;

        // 1. Google Search
        if (googleSearchService.isConfigured()) {
            const searchName = university.display_name || university.name;
            const searchResults = await googleSearchService.searchUniversityNews(
                searchName,
                daysBack
            );

            for (const result of searchResults) {
                try {
                    const content = await this.fetchArticleContent(result.link);

                    await newsStorageService.saveNewsItem({
                        type: NewsType.UNIVERSITY,
                        sourceUrl: result.link,
                        title: result.title,
                        content: content || result.snippet,
                        publishedDate: result.publishedDate ? new Date(result.publishedDate) : undefined,
                        universityId: university.id,
                        cohortId: cohortId,
                        keywords: this.extractKeywords(result.title + ' ' + result.snippet)
                    });

                    savedCount++;
                } catch (error: any) {
                    console.error(`      ⚠️  Failed to save news item: ${error.message}`);
                }
            }
        }

        // 2. TODO: Also scrape university website (integrate existing gather_all_news.ts logic)
        // This can be added later to complement Google search

        if (savedCount > 0) {
            console.log(`    ✅ Found ${savedCount} news items for ${university.name}`);
        }

        return savedCount;
    }

    /**
     * Gather news for a specific participant using LinkedIn URL
     */
    private async gatherParticipantNews(
        participant: {
            id: string;
            name: string;
            linkedin_url: string | null;
        },
        cohortId: string,
        daysBack: number = 7
    ): Promise<number> {
        if (!googleSearchService.isConfigured()) {
            return 0;
        }

        const searchResults = await googleSearchService.searchParticipantNews(
            participant.name,
            participant.linkedin_url || undefined,
            daysBack
        );

        let savedCount = 0;

        for (const result of searchResults) {
            try {
                const content = await this.fetchArticleContent(result.link);

                await newsStorageService.saveNewsItem({
                    type: NewsType.PARTICIPANT,
                    sourceUrl: result.link,
                    title: result.title,
                    content: content || result.snippet,
                    publishedDate: result.publishedDate ? new Date(result.publishedDate) : undefined,
                    participantId: participant.id,
                    cohortId: cohortId,
                    keywords: this.extractKeywords(result.title + ' ' + result.snippet)
                });

                savedCount++;
            } catch (error: any) {
                console.error(`      ⚠️  Failed to save news item: ${error.message}`);
            }
        }

        return savedCount;
    }

    /**
     * Fetch full article content from URL
     */
    private async fetchArticleContent(url: string): Promise<string | null> {
        try {
            // Skip external/non-news sites to save time
            if (!url.includes('.edu') && !url.includes('linkedin.com') && 
                !url.includes('news.') && !url.includes('press.')) {
                return null;
            }

            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(data);
            
            // Try common content selectors
            const selectors = [
                '.field-name-body', 
                '.entry-content', 
                'article', 
                '.post-content',
                'main',
                '.node__content',
                '.news-body',
                '#main-content',
                '.article-content'
            ];

            for (const selector of selectors) {
                const text = $(selector).first().text().trim();
                if (text.length > 200) {
                    return text.replace(/\s+/g, ' ').substring(0, 1000);
                }
            }

            // Fallback to body text
            return $('body').text().trim().replace(/\s+/g, ' ').substring(0, 1000);
        } catch (error) {
            // Silently fail - we'll use snippet instead
            return null;
        }
    }

    /**
     * Extract keywords from text
     */
    private extractKeywords(text: string): string[] {
        const lowerText = text.toLowerCase();
        return this.goodNewsKeywords.filter(keyword => lowerText.includes(keyword));
    }

    /**
     * Sleep utility for rate limiting
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const weeklyNewsOrchestratorService = new WeeklyNewsOrchestratorService();

