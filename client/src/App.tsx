import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { LoadingProvider } from "@/contexts/loading-context";
import { GlobalLoadingBar } from "@/components/ui/global-loading-bar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";

// Top-level financial planning pages
import FinancialPlansPage from "@/pages/financial-plans";
import FinancialPlanSummaryPage from "@/pages/financial-plan-summary";

// Shared form components — mounted by individual need modules under their own URLs.
import NewRetirementFunds from "@/pages/new-retirement-funds";
import LumpSumBequests from "@/pages/lump-sum-bequests";
import IncomeNeeds from "@/pages/income-needs";
import IncomeProvisions from "@/pages/income-provisions";
import AssetsLiabilitiesPage from "@/pages/assets-liabilities";
import Assurance from "@/pages/assurance";
import DefinedBenefitFunds from "@/pages/defined-benefit-funds";
import VoluntaryInvestments from "@/pages/voluntary-investments";
import Residue from "@/pages/residue";
import AdditionalEstateDutyItems from "@/pages/additional-estate-duty-items";
import ClientDetailsPage from "@/pages/client-details";
import EntityTestPage from "@/pages/entity-test";
import FutureInflowsPage from "@/pages/future-inflows";
import RetirementLumpSumNeedsPage from "@/pages/retirement-lump-sum-needs";

// Placeholder pages for needs that don't have a module yet.
import DeathNeed from "@/pages/needs/death";
import PermanentDisabilityNeed from "@/pages/needs/permanent-disability";
import TemporaryDisabilityNeed from "@/pages/needs/temporary-disability";
import DreadDiseaseNeed from "@/pages/needs/dread-disease";
import RetirementNeedRedirect from "@/pages/needs/retirement";
import LumpSumRecurringNeed from "@/pages/needs/lump-sum-recurring";
import PortfolioComparisonNeed from "@/pages/needs/portfolio-comparison";
import ContributionIncomeAnalysisNeed from "@/pages/needs/contribution-income-analysis";
import SavingFutureNeed from "@/pages/needs/saving-future-need";
import IncomeFromCapitalNeed from "@/pages/needs/income-from-capital";
import DebtRepaymentNeed from "@/pages/needs/debt-repayment";

// Need modules — each is self-contained. Layouts wrap content with the need's
// own chrome and action bar (see client/src/needs/_framework/).
import { DELLayout } from "@/needs/death-estate-liquidity/layout";
import { RetirementLayout } from "@/needs/retirement/layout";

// DEL-specific content pages
import DELLandingRedirect from "@/pages/needs/death-estate-liquidity";
import DELProjectStep from "@/pages/needs/death-estate-liquidity/project";
import DELImplementStep from "@/pages/needs/death-estate-liquidity/implement";

// Retirement-specific content pages
import RetirementSetupParameters from "@/pages/needs/retirement/setup/parameters";
import RetirementProject from "@/pages/needs/retirement/project";
import RetirementImplement from "@/pages/needs/retirement/implement";

// Retirement Build — single page with all categories as in-page tabs.
import RetirementBuild from "@/pages/needs/retirement/build";

// Portfolio — client-level section (sibling of Financial planning in the
// client header strip). All portfolio work is ring-fenced to client/src/portfolio/.
import { PortfolioLayout } from "@/portfolio/layout";
import PortfolioPage from "@/portfolio";
import LegacyProductDetail from "@/portfolio/page-legacy-detail";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        {/* Top-level financial planning */}
        <Route path="/" component={FinancialPlansPage} />
        <Route path="/financial-plans" component={FinancialPlansPage} />
        <Route path="/financial-plans/:id" component={FinancialPlanSummaryPage} />

        {/* Direct calculator routes (no need chrome) — for development access. */}
        <Route path="/entity-test" component={EntityTestPage} />

        {/* === Portfolio (client-level section, no plan/need chrome) === */}
        <Route path="/portfolio/legacy/:productId">
          {() => (
            <PortfolioLayout>
              <LegacyProductDetail />
            </PortfolioLayout>
          )}
        </Route>
        <Route path="/portfolio">
          {() => (
            <PortfolioLayout>
              <PortfolioPage />
            </PortfolioLayout>
          )}
        </Route>

        {/* === Need: Death with estate liquidity === */}
        <Route path="/needs/death-estate-liquidity" component={DELLandingRedirect} />
        <Route path="/needs/death-estate-liquidity/setup/client-details">
          {() => <DELLayout><ClientDetailsPage /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/setup/residue">
          {() => <DELLayout><Residue /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/setup/additional-estate-duty-items">
          {() => <DELLayout><AdditionalEstateDutyItems /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/build/assurance">
          {() => <DELLayout><Assurance /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/build/retirement-funds">
          {() => <DELLayout><NewRetirementFunds /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/build/defined-benefit-funds">
          {() => <DELLayout><DefinedBenefitFunds /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/build/voluntary-investments">
          {() => <DELLayout><VoluntaryInvestments /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/build/assets-liabilities">
          {() => <DELLayout><AssetsLiabilitiesPage /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/build/income-needs">
          {() => <DELLayout><IncomeNeeds /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/build/lump-sum-bequests">
          {() => <DELLayout><LumpSumBequests /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/build/income-provisions">
          {() => <DELLayout><IncomeProvisions /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/project">
          {() => <DELLayout><DELProjectStep /></DELLayout>}
        </Route>
        <Route path="/needs/death-estate-liquidity/implement">
          {() => <DELLayout><DELImplementStep /></DELLayout>}
        </Route>

        {/* === Need: Retirement === */}
        <Route path="/needs/retirement" component={RetirementNeedRedirect} />
        <Route path="/needs/retirement/setup/parameters">
          {() => <RetirementLayout><RetirementSetupParameters /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/setup/client-details">
          {() => <RetirementLayout><ClientDetailsPage /></RetirementLayout>}
        </Route>
        {/* Legacy per-section deep-form pages — kept for parity and fallback. */}
        <Route path="/needs/retirement/build/retirement-funds">
          {() => <RetirementLayout><NewRetirementFunds /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/build/defined-benefit-funds">
          {() => <RetirementLayout><DefinedBenefitFunds /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/build/voluntary-investments">
          {() => <RetirementLayout><VoluntaryInvestments /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/build/future-inflows">
          {() => <RetirementLayout><FutureInflowsPage /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/build/lump-sum-needs">
          {() => <RetirementLayout><RetirementLumpSumNeedsPage /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/build/income-required">
          {() => <RetirementLayout><IncomeNeeds /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/build/income-provided">
          {() => <RetirementLayout><IncomeProvisions /></RetirementLayout>}
        </Route>

        {/* Build entry — bare /build path; registered last so the legacy
            per-section sub-paths above win first. */}
        <Route path="/needs/retirement/build">
          {() => <RetirementLayout><RetirementBuild /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/project">
          {() => <RetirementLayout><RetirementProject /></RetirementLayout>}
        </Route>
        <Route path="/needs/retirement/implement">
          {() => <RetirementLayout><RetirementImplement /></RetirementLayout>}
        </Route>

        {/* === Placeholder needs (no module yet — clicking lands here) === */}
        <Route path="/needs/death" component={DeathNeed} />
        <Route path="/needs/permanent-disability" component={PermanentDisabilityNeed} />
        <Route path="/needs/temporary-disability" component={TemporaryDisabilityNeed} />
        <Route path="/needs/dread-disease" component={DreadDiseaseNeed} />
        <Route path="/needs/lump-sum-recurring" component={LumpSumRecurringNeed} />
        <Route path="/needs/portfolio-comparison" component={PortfolioComparisonNeed} />
        <Route path="/needs/contribution-income-analysis" component={ContributionIncomeAnalysisNeed} />
        <Route path="/needs/saving-future-need" component={SavingFutureNeed} />
        <Route path="/needs/income-from-capital" component={IncomeFromCapitalNeed} />
        <Route path="/needs/debt-repayment" component={DebtRepaymentNeed} />

        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <TooltipProvider>
          <GlobalLoadingBar />
          <Toaster />
          <Router />
        </TooltipProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}

export default App;
