import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class GeminiService {
    private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    /**
     * Summarize a news article into a concise achievement highlight
     */
    async summarizeNewsArticle(title: string, content: string): Promise<string> {
        const prompt = `Summarize this news article into a single, concise sentence (max 150 characters) highlighting the key achievement or news:

Title: ${title}
Content: ${content}

Summary:`;

        const result = await this.model.generateContent(prompt);
        return result.response.text().trim();
    }

    /**
     * Extract achievements from LinkedIn PDF text
     */
    async extractLinkedInAchievements(pdfText: string): Promise<string[]> {
        const prompt = `Extract recent professional achievements from this LinkedIn profile text. Focus on:
- New positions/promotions
- Awards and recognitions
- Publications or speaking engagements
- Certifications earned
- Notable projects completed

Return ONLY a JSON array of achievement strings (max 3 items, each max 200 chars).

LinkedIn Profile Text:
${pdfText.substring(0, 4000)}

JSON Array:`;

        const result = await this.model.generateContent(prompt);
        const text = result.response.text().trim();

        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\[([\s\S]*?)\]/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            return [];
        }
    }

    /**
     * Generate personalized email intro for a cohort
     */
    async generateEmailIntro(cohortName: string, weekStart: Date, weekEnd: Date): Promise<string> {
        const prompt = `Write a warm, professional email introduction for a weekly newsletter sent to ${cohortName} participants. 
The newsletter covers achievements from ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}.
Keep it to 2-3 sentences, friendly but professional tone.

Introduction:`;

        const result = await this.model.generateContent(prompt);
        return result.response.text().trim();
    }
}

export const geminiService = new GeminiService();
