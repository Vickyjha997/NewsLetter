import axios from 'axios';

interface GoogleSearchResult {
    title: string;
    link: string;
    snippet: string;
    publishedDate?: string;
}

interface GoogleSearchOptions {
    query: string;
    dateRestrict?: string; // e.g., "w1" for past week, "m1" for past month
    num?: number; // Number of results (1-10)
    site?: string; // Restrict to specific site
}

export class GoogleSearchService {
    private apiKey: string;
    private searchEngineId: string;
    private baseUrl = 'https://www.googleapis.com/customsearch/v1';

    constructor() {
        this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
        this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';

        if (!this.apiKey || !this.searchEngineId) {
            console.warn('⚠️ Google Search API credentials not found. Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env');
        }
    }

    /**
     * Search Google Custom Search API
     */
    async search(options: GoogleSearchOptions): Promise<GoogleSearchResult[]> {
        if (!this.apiKey || !this.searchEngineId) {
            console.error('Google Search API credentials not configured');
            return [];
        }

        try {
            // Truncate query if too long (Google has a limit, typically ~2048 chars for URL)
            // Let's keep it reasonable - around 500 chars for the query string
            let query = options.query.trim();
            if (query.length > 500) {
                console.warn(`⚠️ Query too long (${query.length} chars), truncating to 500`);
                query = query.substring(0, 500);
            }

            // Validate num parameter (must be 1-10)
            const num = Math.min(Math.max(options.num || 5, 1), 10);

            const params: Record<string, string> = {
                key: this.apiKey,
                cx: this.searchEngineId,
                q: query,
                num: String(num)
            };

            if (options.dateRestrict) {
                params.dateRestrict = options.dateRestrict;
            }

            if (options.site) {
                // Add site restriction to query if not already there
                const siteQuery = `site:${options.site}`;
                if (!params.q.includes(siteQuery)) {
                    params.q = `${params.q} ${siteQuery}`;
                }
            }

            const response = await axios.get(this.baseUrl, { params });

            if (!response.data.items) {
                return [];
            }

            return response.data.items.map((item: any) => ({
                title: item.title || '',
                link: item.link || '',
                snippet: item.snippet || '',
                publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
                             item.pagemap?.metatags?.[0]?.['pubdate'] ||
                             undefined
            }));
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 429) {
                    console.error('⚠️ Google Search API quota exceeded');
                } else if (status === 400) {
                    console.error('❌ Google Search API Bad Request (400)');
                    console.error(`   Query: ${options.query.substring(0, 100)}...`);
                    if (errorData?.error) {
                        console.error(`   Error: ${JSON.stringify(errorData.error, null, 2)}`);
                    } else {
                        console.error(`   Response: ${JSON.stringify(errorData, null, 2)}`);
                    }
                } else {
                    console.error(`❌ Google Search API Error (${status}): ${error.message}`);
                    if (errorData) {
                        console.error(`   Details: ${JSON.stringify(errorData, null, 2)}`);
                    }
                }
            } else {
                console.error(`Error searching Google: ${error.message}`);
            }
            return [];
        }
    }

    /**
     * Search for faculty achievements/news
     */
    async searchFacultyNews(
        facultyName: string,
        facultyTitle?: string,
        universityName?: string,
        daysBack: number = 7
    ): Promise<GoogleSearchResult[]> {
        // Build search query for good news about faculty
        let query = `"${facultyName}"`;

        if (facultyTitle) {
            query += ` "${facultyTitle}"`;
        }

        if (universityName) {
            query += ` ${universityName}`;
        }

        // Add good news keywords
        query += ' (award OR honor OR prize OR grant OR publish OR research OR named OR appointed OR recognition OR achievement OR success OR breakthrough OR new book OR speaking engagement OR conference)';

        // Convert days to dateRestrict format (w1 = week, m1 = month, d1 = day)
        let dateRestrict = 'w1'; // Default to past week
        if (daysBack <= 1) {
            dateRestrict = 'd1';
        } else if (daysBack <= 7) {
            dateRestrict = 'w1';
        } else if (daysBack <= 30) {
            dateRestrict = 'm1';
        }

        const results = await this.search({
            query,
            dateRestrict,
            num: 5
        });

        // Filter results for good news keywords (double-check)
        const goodKeywords = ['award', 'honor', 'prize', 'grant', 'publish', 'research', 'named', 
                             'appointed', 'recognition', 'achievement', 'success', 'breakthrough',
                             'book', 'speaking', 'conference', 'fellowship', 'chair', 'professor'];

        return results.filter(result => {
            const text = (result.title + ' ' + result.snippet).toLowerCase();
            return goodKeywords.some(keyword => text.includes(keyword));
        });
    }

    /**
     * Search for university achievements/news
     */
    async searchUniversityNews(
        universityName: string,
        daysBack: number = 7
    ): Promise<GoogleSearchResult[]> {
        let query = `"${universityName}"`;

        // Add good news keywords
        query += ' (award OR honor OR ranking OR research OR breakthrough OR innovation OR new program OR grant OR donation OR gift OR partnership OR achievement OR success OR student OR faculty achievement)';

        // Convert days to dateRestrict format
        let dateRestrict = 'w1';
        if (daysBack <= 1) {
            dateRestrict = 'd1';
        } else if (daysBack <= 7) {
            dateRestrict = 'w1';
        } else if (daysBack <= 30) {
            dateRestrict = 'm1';
        }

        return await this.search({
            query,
            dateRestrict,
            num: 5
        });
    }

    /**
     * Search for participant achievements/news using LinkedIn profile
     */
    async searchParticipantNews(
        participantName: string,
        linkedinUrl?: string,
        daysBack: number = 7
    ): Promise<GoogleSearchResult[]> {
        let query = `"${participantName}"`;

        // If LinkedIn URL provided, try to extract company/role info
        // For now, just use name-based search

        // Search on LinkedIn and general web
        query += ' (site:linkedin.com/in OR "promoted" OR "new role" OR "award" OR "achievement" OR "recognition" OR "published" OR "speaking" OR "certification" OR "leadership")';

        // Convert days to dateRestrict format
        let dateRestrict = 'w1';
        if (daysBack <= 1) {
            dateRestrict = 'd1';
        } else if (daysBack <= 7) {
            dateRestrict = 'w1';
        } else if (daysBack <= 30) {
            dateRestrict = 'm1';
        }

        const results = await this.search({
            query,
            dateRestrict,
            num: 3 // Fewer results for participants to save API calls
        });

        // Filter for positive news
        const goodKeywords = ['promoted', 'new role', 'award', 'achievement', 'recognition',
                             'published', 'speaking', 'certification', 'leadership', 'success',
                             'appointed', 'named', 'grant', 'fellowship'];

        return results.filter(result => {
            const text = (result.title + ' ' + result.snippet).toLowerCase();
            return goodKeywords.some(keyword => text.includes(keyword));
        });
    }

    /**
     * Check if API is configured
     */
    isConfigured(): boolean {
        return !!this.apiKey && !!this.searchEngineId;
    }

    /**
     * Test API connection with a simple query
     */
    async testConnection(): Promise<boolean> {
        if (!this.isConfigured()) {
            console.error('❌ API not configured');
            return false;
        }

        try {
            const testQuery = 'test';
            const results = await this.search({ query: testQuery, num: 1 });
            console.log('✅ Google Search API connection successful');
            return true;
        } catch (error: any) {
            console.error('❌ Google Search API connection failed');
            if (error.response?.data) {
                console.error('Error details:', JSON.stringify(error.response.data, null, 2));
            }
            return false;
        }
    }
}

export const googleSearchService = new GoogleSearchService();

