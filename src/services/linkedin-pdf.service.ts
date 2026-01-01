import fs from 'fs/promises';
import path from 'path';
import { geminiService } from './gemini.service';

// Polyfill DOMMatrix for Node.js environment (pdf-parse requires it)
if (typeof global.DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
        a: number; b: number; c: number; d: number; e: number; f: number;
        constructor(init?: string | number[]) {
            if (typeof init === 'string') {
                const m = init.match(/matrix\(([^)]+)\)/);
                const values = m ? m[1].split(',').map(v => parseFloat(v.trim())) : [1, 0, 0, 1, 0, 0];
                this.a = values[0] || 1; this.b = values[1] || 0;
                this.c = values[2] || 0; this.d = values[3] || 1;
                this.e = values[4] || 0; this.f = values[5] || 0;
            } else {
                this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
            }
        }
    };
}

// Import pdf-parse after polyfill
const pdfParse = require('pdf-parse');

export class LinkedInPDFService {
    private pdfStoragePath = path.join(process.cwd(), 'storage', 'linkedin-pdfs');

    constructor() {
        this.ensureStorageDir();
    }

    private async ensureStorageDir() {
        try {
            await fs.mkdir(this.pdfStoragePath, { recursive: true });
        } catch (e) {
            console.error('Failed to create PDF storage directory:', e);
        }
    }

    /**
     * Process a LinkedIn PDF file and extract achievements
     * @param pdfPath - Absolute path to the PDF file
     * @param participantId - ID of the participant
     * @returns Array of achievement strings
     */
    async processLinkedInPDF(pdfPath: string, participantId: string): Promise<string[]> {
        try {
            // Read PDF file
            const dataBuffer = await fs.readFile(pdfPath);

            // Parse PDF
            // Note: pdf-parse may show DOMMatrix warnings but should still extract text
            const pdfData = await pdfParse(dataBuffer);
            const text = pdfData.text;

            console.log(`Extracted ${text.length} characters from LinkedIn PDF for participant ${participantId}`);

            if (!text || text.length === 0) {
                console.warn('⚠️ PDF text extraction returned empty content');
                return [];
            }

            // Use Gemini to extract achievements
            const achievements = await geminiService.extractLinkedInAchievements(text);

            return achievements;
        } catch (error: any) {
            console.error(`Error processing LinkedIn PDF for ${participantId}:`, error.message);
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }
            return [];
        }
    }

    /**
     * Save uploaded PDF to storage
     * @param fileBuffer - PDF file buffer
     * @param participantId - ID of the participant
     * @returns Path to saved file
     */
    async savePDF(fileBuffer: Buffer, participantId: string): Promise<string> {
        const filename = `${participantId}_${Date.now()}.pdf`;
        const filepath = path.join(this.pdfStoragePath, filename);

        await fs.writeFile(filepath, fileBuffer);

        return filepath;
    }

    /**
     * Check if PDF exists for participant
     */
    async pdfExists(pdfPath: string): Promise<boolean> {
        try {
            await fs.access(pdfPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get PDF storage path
     */
    getStoragePath(): string {
        return this.pdfStoragePath;
    }
}

export const linkedInPDFService = new LinkedInPDFService();
