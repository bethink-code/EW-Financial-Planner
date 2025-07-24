
import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import NewRetirementFunds from "./new-retirement-funds";
import LumpSumBequests from "./lump-sum-bequests";
import Assurance from "./assurance";
import DefinedBenefitFunds from "./defined-benefit-funds";
import VoluntaryInvestments from "./voluntary-investments";
import AssetsAndLiabilities from "./assets-and-liabilities";
import IncomeNeeds from "./income-needs";
import IncomeProvisions from "./income-provisions";
import Residue from "./residue";
import AdditionalEstateDutyItems from "./additional-estate-duty-items";
import { CustomTabs, TabContent } from "@/components/ui/custom-tabs";

type TabType = 
  | "assurance" 
  | "retirement-funds" 
  | "defined-benefit-funds" 
  | "voluntary-investments" 
  | "assets-and-liabilities" 
  | "income-needs" 
  | "income-provisions" 
  | "residue" 
  | "lump-sum-needs-cash-bequests" 
  | "additional-estate-duty-items";

export default function DeathWithEstateLiquidity() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("assurance");

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const tabs = [
    { id: "assurance", label: "Assurance" },
    { id: "retirement-funds", label: "Retirement Funds" },
    { id: "defined-benefit-funds", label: "Defined Benefit Funds" },
    { id: "voluntary-investments", label: "Voluntary Investments" },
    { id: "assets-and-liabilities", label: "Assets and Liabilities" },
    { id: "income-needs", label: "Income Needs" },
    { id: "income-provisions", label: "Income Provisions" },
    { id: "residue", label: "Residue" },
    { id: "lump-sum-needs-cash-bequests", label: "Lump Sum Needs and Cash Bequests" },
    { id: "additional-estate-duty-items", label: "Additional Estate Duty Items" }
  ];

  return (
    <div className="min-h-screen bg-background" style={{ minWidth: '1400px' }}>
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Death with Estate Liquidity</h1>
          <p className="text-muted-foreground">Comprehensive estate planning and liquidity management</p>
        </div>

        {/* Tab Navigation */}
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => handleTabChange(tabId as TabType)}
        />

        {/* Tab Content */}
        <TabContent activeTab={activeTab} tabId="assurance">
          <Assurance />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="retirement-funds">
          <NewRetirementFunds />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="defined-benefit-funds">
          <DefinedBenefitFunds />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="voluntary-investments">
          <VoluntaryInvestments />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="assets-and-liabilities">
          <AssetsAndLiabilities />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="income-needs">
          <IncomeNeeds />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="income-provisions">
          <IncomeProvisions />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="residue">
          <Residue />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="lump-sum-needs-cash-bequests">
          <LumpSumBequests />
        </TabContent>
        
        <TabContent activeTab={activeTab} tabId="additional-estate-duty-items">
          <AdditionalEstateDutyItems />
        </TabContent>
      </div>
    </div>
  );
}