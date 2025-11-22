import { ChatPromptTemplate } from "@langchain/core/prompts";

export const ANALYZER_PROMPT = ChatPromptTemplate.fromTemplate(`
You are an expert NLP analyzer for technical content and company classification.
Your goal is to analyze the provided text and extract structured information.

Specific Focus:
1. **Industry Classification**: Select ONE most relevant Tech category from this comprehensive list:
   - Finance/Business: FinTech, InsurTech, RegTech, WealthTech, PayTech, LegalTech, TaxTech
   - Health/Bio: MedTech, HealthTech, BioTech, FemTech, PsyTech, SexTech, AgeTech
   - Education/HR: EdTech, HRTech, JobTech, WorkTech
   - Commerce/Marketing: E-com, RetailTech, MarTech, AdTech, SalesTech
   - Real Estate/Construction: PropTech, ConTech, CRETech
   - Ecology/Food/Resources: AgriTech, FoodTech, CleanTech, GreenTech, ClimateTech, EnergyTech
   - Government/Security: GovTech, CivicTech, MilTech, PoliceTech, SpaceTech
   - Transport/Logistics: AutoTech, MobilityTech, LogisTech, TravelTech, AeroTech
   - Lifestyle/Culture: FashionTech, BeautyTech, SportTech, ArtTech, GameTech
   - General: DeepTech, HighTech, HardTech, LowTech, CloudTech, DataTech, AI, CyberSecurity, Other
   
   Choose the SINGLE category that best describes the company's core business.

2. **Company Name**: Identify the main company name.
3. **Tech Stack**: Extract programming languages, frameworks, databases, cloud services, and infrastructure tools.
4. **Startup Detection**: Determine if the company is a startup (true) or established company (false). 
   - Startups: typically young, growing, focused on innovation, may mention funding rounds, venture capital, or rapid scaling.
   - Established: mature, well-known brands, large infrastructure, wide market presence, long operating history.

Text to analyze:
"{text}"
`);
