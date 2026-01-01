import { PrismaClient, NewsType } from '../../prisma/generated/prisma';
import { geminiService } from './gemini.service';

const prisma = new PrismaClient();

export interface NewsItemInput {
    type: NewsType;
    sourceUrl: string;
    title: string;
    content?: string;
    publishedDate?: Date;
    facultyId?: string;
    universityId?: string;
    participantId?: string;
    cohortId?: string;
    keywords?: string[];
}

export class NewsStorageService {
    /**
     * Save a news item to the database with AI summarization
     */
    async saveNewsItem(input: NewsItemInput): Promise<string> {
        try {
            // Generate summary using Gemini if content is provided
            let summary = input.content?.substring(0, 500);
            if (input.content && input.content.length > 200) {
                try {
                    summary = await geminiService.summarizeNewsArticle(input.title, input.content);
                } catch (e) {
                    console.error('Gemini summarization failed, using truncated content');
                }
            }

            const newsItem = await prisma.newsItem.create({
                data: {
                    type: input.type,
                    source_url: input.sourceUrl,
                    title: input.title,
                    summary,
                    content: input.content,
                    published_date: input.publishedDate,
                    faculty_id: input.facultyId,
                    university_id: input.universityId,
                    participant_id: input.participantId,
                    cohort_id: input.cohortId,
                    keywords: input.keywords || [],
                    sentiment: 'positive',
                    is_processed: false
                }
            });

            return newsItem.id;
        } catch (error: any) {
            console.error('Error saving news item:', error.message);
            throw error;
        }
    }

    /**
     * Get unprocessed news items for a cohort within a date range
     */
    async getNewsForCohort(cohortId: string, startDate: Date, endDate: Date) {
        return await prisma.newsItem.findMany({
            where: {
                cohort_id: cohortId,
                scraped_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                faculty: true,
                university: true,
                participant: true
            },
            orderBy: {
                scraped_at: 'desc'
            }
        });
    }

    /**
     * Mark news items as processed
     */
    async markAsProcessed(newsItemIds: string[]) {
        await prisma.newsItem.updateMany({
            where: {
                id: {
                    in: newsItemIds
                }
            },
            data: {
                is_processed: true
            }
        });
    }

    /**
     * Get recent news by type
     */
    async getRecentNewsByType(type: NewsType, days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await prisma.newsItem.findMany({
            where: {
                type,
                scraped_at: {
                    gte: startDate
                }
            },
            include: {
                faculty: true,
                university: true,
                participant: true
            },
            orderBy: {
                scraped_at: 'desc'
            }
        });
    }
}

export const newsStorageService = new NewsStorageService();
