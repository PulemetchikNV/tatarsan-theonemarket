import { ChatPromptTemplate } from "@langchain/core/prompts";

export const ANALYZER_PROMPT = ChatPromptTemplate.fromTemplate(`
You are an expert NLP analyzer for technical content and company classification.
Your goal is to analyze the provided text and extract structured information.

Specific Focus:
1. **Industry Classification**: Classify the company into one of these categories: Fintech, AI, Gaming, E-commerce, SaaS, Other.
2. **Company Linking**: Identify the main "companyName" and any "relatedCompanies" (competitors, partners, etc.).
3. **Tech Stack**: Extract programming languages, frameworks, databases, and cloud services.

Text to analyze:
"{text}"
`);
