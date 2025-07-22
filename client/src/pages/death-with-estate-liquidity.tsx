
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Death with Estate Liquidity</h1>
          <p className="text-neutral-600">Comprehensive estate planning and liquidity management</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-neutral-200">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              <button
                onClick={() => handleTabChange("assurance")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "assurance"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Assurance
              </button>
              <button
                onClick={() => handleTabChange("retirement-funds")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "retirement-funds"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Retirement Funds
              </button>
              <button
                onClick={() => handleTabChange("defined-benefit-funds")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "defined-benefit-funds"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Defined Benefit Funds
              </button>
              <button
                onClick={() => handleTabChange("voluntary-investments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "voluntary-investments"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Voluntary Investments
              </button>
              <button
                onClick={() => handleTabChange("assets-and-liabilities")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "assets-and-liabilities"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Assets and Liabilities
              </button>
              <button
                onClick={() => handleTabChange("income-needs")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "income-needs"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Income Needs
              </button>
              <button
                onClick={() => handleTabChange("income-provisions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "income-provisions"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Income Provisions
              </button>
              <button
                onClick={() => handleTabChange("residue")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "residue"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Residue
              </button>
              <button
                onClick={() => handleTabChange("lump-sum-needs-cash-bequests")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "lump-sum-needs-cash-bequests"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Lump Sum Needs and Cash Bequests
              </button>
              <button
                onClick={() => handleTabChange("additional-estate-duty-items")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "additional-estate-duty-items"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Additional Estate Duty Items
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "assurance" && (
            <div>
              <Assurance />
            </div>
          )}
          {activeTab === "retirement-funds" && (
            <div>
              <NewRetirementFunds />
            </div>
          )}
          {activeTab === "defined-benefit-funds" && (
            <div>
              <DefinedBenefitFunds />
            </div>
          )}
          {activeTab === "voluntary-investments" && (
            <div>
              <VoluntaryInvestments />
            </div>
          )}
          {activeTab === "assets-and-liabilities" && (
            <div>
              <AssetsAndLiabilities />
            </div>
          )}
          {activeTab === "income-needs" && (
            <div>
              <IncomeNeeds />
            </div>
          )}
          {activeTab === "income-provisions" && (
            <div>
              <IncomeProvisions />
            </div>
          )}
          {activeTab === "residue" && (
            <div>
              <Residue />
            </div>
          )}
          {activeTab === "lump-sum-needs-cash-bequests" && (
            <div>
              <LumpSumBequests />
            </div>
          )}
          {activeTab === "additional-estate-duty-items" && (
            <div>
              <AdditionalEstateDutyItems />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}