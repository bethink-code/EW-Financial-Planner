import { Switch, Route, useLocation } from "wouter";
import { lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ViewModeProvider } from "@/contexts/view-mode-context";
import { LoadingProvider } from "@/contexts/loading-context";
import { GlobalLoadingBar } from "@/components/ui/global-loading-bar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationLayout } from "@/components/navigation/navigation-layout";

import NotFound from "@/pages/not-found";

// Financial planning pages
import FinancialPlansPage from "@/pages/financial-plans";

// Existing calculator pages
import NewRetirementFunds from "@/pages/new-retirement-funds";
import LumpSumBequests from "@/pages/lump-sum-bequests";
import IncomeNeeds from "@/pages/income-needs";
import IncomeProvisions from "@/pages/income-provisions";
import Liabilities from "@/pages/liabilities";
import { AssetsPage } from "@/pages/assets";
import Assurance from "@/pages/assurance";
import DefinedBenefitFunds from "@/pages/defined-benefit-funds";
import VoluntaryInvestments from "@/pages/voluntary-investments";
import Residue from "@/pages/residue";
import AdditionalEstateDutyItems from "@/pages/additional-estate-duty-items";
import ClientDetailsPage from "@/pages/client-details";
import EntityTestPage from "@/pages/entity-test";

// Placeholder need pages
import DeathNeed from "@/pages/needs/death";
import PermanentDisabilityNeed from "@/pages/needs/permanent-disability";
import TemporaryDisabilityNeed from "@/pages/needs/temporary-disability";
import DreadDiseaseNeed from "@/pages/needs/dread-disease";
import RetirementNeed from "@/pages/needs/retirement";
import LumpSumRecurringNeed from "@/pages/needs/lump-sum-recurring";
import PortfolioComparisonNeed from "@/pages/needs/portfolio-comparison";
import ContributionIncomeAnalysisNeed from "@/pages/needs/contribution-income-analysis";
import SavingFutureNeed from "@/pages/needs/saving-future-need";
import IncomeFromCapitalNeed from "@/pages/needs/income-from-capital";
import DebtRepaymentNeed from "@/pages/needs/debt-repayment";

// Death with estate liquidity placeholder pages
import DeathEstateLiquidityNeed from "@/pages/needs/death-estate-liquidity";
import ProjectStep from "@/pages/needs/death-estate-liquidity/project";
import ImplementStep from "@/pages/needs/death-estate-liquidity/implement";
import SetupStep from "@/pages/needs/death-estate-liquidity/setup";
import BuildStep from "@/pages/needs/death-estate-liquidity/build";
import ClientDetails from "@/pages/needs/death-estate-liquidity/setup/client-details";
import ParametersSection from "@/pages/needs/death-estate-liquidity/setup/parameters";
import ParametersSubSection from "@/pages/needs/death-estate-liquidity/setup/parameters/parameters";
import RetirementFundsGroup from "@/pages/needs/death-estate-liquidity/build/retirement-funds";
import AssetsLiabilitiesGroup from "@/pages/needs/death-estate-liquidity/build/assets-liabilities";
import IncomeCapitalNeedsGroup from "@/pages/needs/death-estate-liquidity/build/income-capital-needs";




function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        {/* Default route - redirect to assurance with proper context */}
        <Route path="/" component={() => {
          // Redirect to assurance with proper navigation context
          window.location.href = '/assurance';
          return null;
        }} />

        {/* Financial planning routes */}
        <Route path="/financial-plans" component={FinancialPlansPage} />
          
          {/* Existing calculator routes with navigation */}
          <Route path="/assurance">
            {() => (
              <NavigationLayout>
                <Assurance />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/new-retirement-funds">
            {() => (
              <NavigationLayout>
                <NewRetirementFunds />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/defined-benefit-funds">
            {() => (
              <NavigationLayout>
                <DefinedBenefitFunds />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/voluntary-investments">
            {() => (
              <NavigationLayout>
                <VoluntaryInvestments />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/assets">
            {() => (
              <NavigationLayout>
                <AssetsPage />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/liabilities">
            {() => (
              <NavigationLayout>
                <Liabilities />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/income-needs">
            {() => (
              <NavigationLayout>
                <IncomeNeeds />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/income-provisions">
            {() => (
              <NavigationLayout>
                <IncomeProvisions />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/residue">
            {() => (
              <NavigationLayout>
                <Residue />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/lump-sum-bequests">
            {() => (
              <NavigationLayout>
                <LumpSumBequests />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/additional-estate-duty-items">
            {() => (
              <NavigationLayout>
                <AdditionalEstateDutyItems />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/client-details">
            {() => (
              <NavigationLayout>
                <ClientDetailsPage />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/entity-test">
            {() => (
              <NavigationLayout>
                <EntityTestPage />
              </NavigationLayout>
            )}
          </Route>
          

          
          {/* Placeholder need routes */}
          <Route path="/needs/death" component={DeathNeed} />
          <Route path="/needs/permanent-disability" component={PermanentDisabilityNeed} />
          <Route path="/needs/temporary-disability" component={TemporaryDisabilityNeed} />
          <Route path="/needs/dread-disease" component={DreadDiseaseNeed} />
          <Route path="/needs/retirement" component={RetirementNeed} />
          <Route path="/needs/lump-sum-recurring" component={LumpSumRecurringNeed} />
          <Route path="/needs/portfolio-comparison" component={PortfolioComparisonNeed} />
          <Route path="/needs/contribution-income-analysis" component={ContributionIncomeAnalysisNeed} />
          <Route path="/needs/saving-future-need" component={SavingFutureNeed} />
          <Route path="/needs/income-from-capital" component={IncomeFromCapitalNeed} />
          <Route path="/needs/debt-repayment" component={DebtRepaymentNeed} />
          
          {/* Death with estate liquidity placeholder routes with navigation */}
          <Route path="/needs/death-estate-liquidity">
            {() => (
              <NavigationLayout>
                <DeathEstateLiquidityNeed />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/setup">
            {() => (
              <NavigationLayout>
                <SetupStep />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/build">
            {() => (
              <NavigationLayout>
                <BuildStep />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/setup/parameters">
            {() => (
              <NavigationLayout>
                <ParametersSection />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/build/retirement-funds">
            {() => (
              <NavigationLayout>
                <RetirementFundsGroup />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/build/assets-liabilities">
            {() => (
              <NavigationLayout>
                <AssetsLiabilitiesGroup />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/build/income-capital-needs">
            {() => (
              <NavigationLayout>
                <IncomeCapitalNeedsGroup />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/project">
            {() => (
              <NavigationLayout>
                <ProjectStep />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/implement">
            {() => (
              <NavigationLayout>
                <ImplementStep />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/setup/client-details">
            {() => (
              <NavigationLayout>
                <ClientDetails />
              </NavigationLayout>
            )}
          </Route>
          <Route path="/needs/death-estate-liquidity/setup/parameters/parameters">
            {() => (
              <NavigationLayout>
                <ParametersSubSection />
              </NavigationLayout>
            )}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <ViewModeProvider>
          <TooltipProvider>
            <GlobalLoadingBar />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ViewModeProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}

export default App;
