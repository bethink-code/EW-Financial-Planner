import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import NewRetirementFunds from "@/pages/new-retirement-funds";
import LumpSumBequests from "@/pages/lump-sum-bequests";
import IncomeNeeds from "@/pages/income-needs";
import IncomeProvisions from "@/pages/income-provisions";
import Liabilities from "@/pages/liabilities";
import { AssetsPage } from "@/pages/assets";
import DeathWithEstateLiquidity from "./pages/death-with-estate-liquidity";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DeathWithEstateLiquidity} />
      <Route path="/death-with-estate-liquidity" component={DeathWithEstateLiquidity} />
      <Route path="/retirement-funds" component={NewRetirementFunds} />
      <Route path="/lump-sum-bequests" component={LumpSumBequests} />
      <Route path="/income-needs" component={IncomeNeeds} />
      <Route path="/income-provisions" component={IncomeProvisions} />
      <Route path="/liabilities" component={Liabilities} />
      <Route path="/assets" component={AssetsPage} />
      <Route component={NotFound} />
    </Switch>
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
