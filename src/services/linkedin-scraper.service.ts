import puppeteer, { Browser, Page } from 'puppeteer';
import { geminiService } from './gemini.service';

export interface LinkedInProfileData {
    name: string;
    headline: string;
    location: string;
    about: string;
    experience: string[];
    education: string[];
    skills: string[];
    profileText: string;
}

export class LinkedInScraperService {
    private browser: Browser | null = null;

    /**
     * Initialize browser (creates new instance if needed)
     */
    private async getBrowser(): Promise<Browser> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                ],
            });
        }
        return this.browser;
    }

    /**
     * Close browser
     */
    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Scrape LinkedIn profile using Puppeteer
     * ⚠️ Warning: LinkedIn may block automated access. Use sparingly.
     */
    async scrapeProfile(profileUrl: string): Promise<LinkedInProfileData | null> {
        let page: Page | null = null;
        
        try {
            console.log(`🔍 Scraping LinkedIn profile: ${profileUrl}`);

            const browser = await this.getBrowser();
            page = await browser.newPage();

            // Set realistic viewport and user agent
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Navigate to profile
            await page.goto(profileUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });

            // Wait for profile to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Extract profile data
            const profileData = await page.evaluate(() => {
                // Helper function to safely get text
                const getText = (selector: string): string => {
                    const element = document.querySelector(selector);
                    return element?.textContent?.trim() || '';
                };

                // Helper function to get multiple elements
                const getMultipleText = (selector: string): string[] => {
                    const elements = Array.from(document.querySelectorAll(selector));
                    return elements.map(el => el.textContent?.trim() || '').filter(text => text.length > 0);
                };

                // Extract name (various selectors for different LinkedIn layouts)
                const name = getText('h1.text-heading-xlarge') || 
                            getText('h1[class*="text-heading"]') ||
                            getText('.ph5 h1') ||
                            getText('h1') ||
                            '';

                // Extract headline
                const headline = getText('.text-body-medium.break-words') ||
                               getText('[class*="headline"]') ||
                               getText('.ph5 .text-body-medium') ||
                               '';

                // Extract location
                const location = getText('.text-body-small.inline.t-black--light.break-words') ||
                               getText('[class*="location"]') ||
                               '';

                // Extract about/summary
                const about = getText('#about ~ .display-flex .text-body-medium') ||
                            getText('#about + * .text-body-medium') ||
                            getText('[data-section="summary"] .text-body-medium') ||
                            '';

                // Extract experience (try multiple selectors)
                const experienceItems = getMultipleText('[data-section="experience"] .pv-entity__summary-info-v2 h3') ||
                                      getMultipleText('#experience ~ * h3') ||
                                      getMultipleText('[data-section="experience"] .t-16.t-black.t-bold') ||
                                      [];

                // Extract education
                const educationItems = getMultipleText('[data-section="education"] h3') ||
                                     getMultipleText('#education ~ * h3') ||
                                     [];

                // Extract skills
                const skillsItems = getMultipleText('.pv-skill-category-entity__name-text') ||
                                  getMultipleText('[data-section="skills"] span') ||
                                  [];

                // Get all visible text as fallback
                const bodyText = document.body.innerText || '';

                return {
                    name,
                    headline,
                    location,
                    about,
                    experience: experienceItems,
                    education: educationItems,
                    skills: skillsItems,
                    bodyText: bodyText.substring(0, 5000), // Limit to avoid huge strings
                };
            });

            // Check if we got blocked or profile is private
            if (!profileData.name && profileData.bodyText.length < 500) {
                console.warn('⚠️ LinkedIn may be blocking access or profile is private');
                return null;
            }

            // Combine all text for analysis
            const profileText = `
Name: ${profileData.name}
Headline: ${profileData.headline}
Location: ${profileData.location}
About: ${profileData.about}

Experience:
${profileData.experience.map((exp, i) => `${i + 1}. ${exp}`).join('\n')}

Education:
${profileData.education.map((edu, i) => `${i + 1}. ${edu}`).join('\n')}

Skills:
${profileData.skills.join(', ')}

Full Text (excerpt):
${profileData.bodyText.substring(0, 2000)}
            `.trim();

            return {
                name: profileData.name,
                headline: profileData.headline,
                location: profileData.location,
                about: profileData.about,
                experience: profileData.experience,
                education: profileData.education,
                skills: profileData.skills,
                profileText,
            };

        } catch (error: any) {
            console.error(`❌ Error scraping LinkedIn profile: ${error.message}`);
            
            if (error.message.includes('timeout') || error.message.includes('Navigation')) {
                console.warn('⚠️ LinkedIn may be blocking automated access');
            }
            
            return null;
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    /**
     * Extract achievements from LinkedIn profile using Gemini AI
     */
    async extractAchievementsFromProfile(profileUrl: string): Promise<string[]> {
        const profileData = await this.scrapeProfile(profileUrl);

        if (!profileData || !profileData.profileText) {
            console.warn('⚠️ Could not extract profile data');
            return [];
        }

        console.log(`✅ Extracted ${profileData.profileText.length} characters from LinkedIn profile`);

        // Use Gemini to extract achievements
        const achievements = await geminiService.extractLinkedInAchievements(profileData.profileText);

        return achievements;
    }
}

export const linkedInScraperService = new LinkedInScraperService();

