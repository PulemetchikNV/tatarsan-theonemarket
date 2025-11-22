import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { ANALYZER_PROMPT } from "./prompts";
import { logger } from "../utils/logger";
import * as dotenv from "dotenv";

dotenv.config();

// Define the schema using Zod
const AnalysisSchema = z.object({
    companyName: z.string().describe("The main company being analyzed"),
    industry: z
        .enum(["Fintech", "AI", "Gaming", "E-commerce", "SaaS", "Other"])
        .describe("The primary industry of the company"),
    subIndustry: z.string().optional().describe("More specific detail about the industry"),
    techStack: z.array(z.string()).describe("List of technologies used"),
    relatedCompanies: z
        .array(z.string())
        .describe("Other companies mentioned in the text, competitors or partners"),
    summary: z.string().describe("A brief summary of the company's technical focus"),
    confidence: z.number().min(0).max(1).describe("Confidence score of the analysis (0-1)"),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

export class NLPAgent {
    private model: ChatGoogleGenerativeAI;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private runnable: any; // Using any to avoid complex type inference with withStructuredOutput

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0,
        });

        // Use withStructuredOutput for strict schema validation
        // Type cast to avoid TS2589: excessively deep type instantiation
        this.runnable = ANALYZER_PROMPT.pipe(
            this.model.withStructuredOutput(AnalysisSchema as any)
        );
    }

    async analyze(text: string): Promise<AnalysisResult> {
        logger.info("Starting analysis...");
        try {
            const result = await this.runnable.invoke({ text });
            logger.info("Analysis complete.");
            return result;
        } catch (error) {
            logger.error("Error during analysis:", error);
            throw error;
        }
    }
}
