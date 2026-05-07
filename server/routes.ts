import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerEntityRoutes } from "./routes/entities";
import { registerRetirementFundRoutes } from "./routes/retirement-funds";
import { registerLumpSumBequestRoutes } from "./routes/lump-sum-bequests";
import { registerAssuranceRoutes } from "./routes/assurance";
import { registerDefinedBenefitFundRoutes } from "./routes/defined-benefit-funds";
import { registerVoluntaryInvestmentRoutes } from "./routes/voluntary-investments";
import { registerIncomeNeedsRoutes } from "./routes/income-needs";
import { registerIncomeProvisionsRoutes } from "./routes/income-provisions";
import { registerResidueRoutes } from "./routes/residue";
import { registerAdditionalEstateDutyItemRoutes } from "./routes/additional-estate-duty-items";
import { registerLiabilitiesRoutes } from "./routes/liabilities";
import { registerAssetsRoutes } from "./routes/assets";
import { registerClientDetailsRoutes } from "./routes/client-details";
import { registerEstatePositionParameterRoutes } from "./routes/estate-position-parameters";
import { registerFinancialPlanRoutes } from "./routes/financial-plans";
import { registerNeedsRoutes } from "./routes/needs";

export async function registerRoutes(app: Express): Promise<Server> {
  registerEntityRoutes(app);
  registerRetirementFundRoutes(app);
  registerLumpSumBequestRoutes(app);
  registerAssuranceRoutes(app);
  registerDefinedBenefitFundRoutes(app);
  registerVoluntaryInvestmentRoutes(app);
  registerIncomeNeedsRoutes(app);
  registerIncomeProvisionsRoutes(app);
  registerResidueRoutes(app);
  registerAdditionalEstateDutyItemRoutes(app);
  registerLiabilitiesRoutes(app);
  registerAssetsRoutes(app);
  registerClientDetailsRoutes(app);
  registerEstatePositionParameterRoutes(app);
  registerFinancialPlanRoutes(app);
  registerNeedsRoutes(app);

  await storage.initializeDefaultNeeds();

  return createServer(app);
}
