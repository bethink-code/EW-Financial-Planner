import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TableNavigation from "@/pages/table-navigation";
import NotFound from "@/pages/not-found";
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
import AssetsAndLiabilities from "@/pages/assets-and-liabilities";
import DeathWithEstateLiquidity from "./pages/death-with-estate-liquidity";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={TableNavigation} />
        <Route path="/death-with-estate-liquidity" component={DeathWithEstateLiquidity} />
        <Route path="/assurance" component={Assurance} />
        <Route path="/new-retirement-funds" component={NewRetirementFunds} />
        <Route path="/assets-and-liabilities" component={AssetsAndLiabilities} />
        <Route path="/defined-benefit-funds" component={DefinedBenefitFunds} />
        <Route path="/voluntary-investments" component={VoluntaryInvestments} />
        <Route path="/assets" component={AssetsPage} />
        <Route path="/liabilities" component={Liabilities} />
        <Route path="/income-needs" component={IncomeNeeds} />
        <Route path="/income-provisions" component={IncomeProvisions} />
        <Route path="/residue" component={Residue} />
        <Route path="/lump-sum-bequests" component={LumpSumBequests} />
        <Route path="/additional-estate-duty-items" component={AdditionalEstateDutyItems} />
        <Route component={NotFound} />
      </Switch>
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
