import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNavigation } from "@/components/ui/top-navigation";
import TableNavigation from "@/pages/table-navigation";
import NotFound from "@/pages/not-found";

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
import ProjectStep from "@/pages/needs/death-estate-liquidity/project";
import ImplementStep from "@/pages/needs/death-estate-liquidity/implement";
import ClientDetails from "@/pages/needs/death-estate-liquidity/setup/client-details";
import ParametersSubSection from "@/pages/needs/death-estate-liquidity/setup/parameters/parameters";


function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <div className="pt-16">
        <Switch>
          <Route path="/" component={TableNavigation} />
          
          {/* Existing calculator routes */}
          <Route path="/assurance" component={Assurance} />
          <Route path="/new-retirement-funds" component={NewRetirementFunds} />
          <Route path="/defined-benefit-funds" component={DefinedBenefitFunds} />
          <Route path="/voluntary-investments" component={VoluntaryInvestments} />
          <Route path="/assets" component={AssetsPage} />
          <Route path="/liabilities" component={Liabilities} />
          <Route path="/income-needs" component={IncomeNeeds} />
          <Route path="/income-provisions" component={IncomeProvisions} />
          <Route path="/residue" component={Residue} />
          <Route path="/lump-sum-bequests" component={LumpSumBequests} />
          <Route path="/additional-estate-duty-items" component={AdditionalEstateDutyItems} />
          
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
          
          {/* Death with estate liquidity placeholder routes */}
          <Route path="/needs/death-estate-liquidity/project" component={ProjectStep} />
          <Route path="/needs/death-estate-liquidity/implement" component={ImplementStep} />
          <Route path="/needs/death-estate-liquidity/setup/client-details" component={ClientDetails} />
          <Route path="/needs/death-estate-liquidity/setup/parameters/parameters" component={ParametersSubSection} />
          
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
