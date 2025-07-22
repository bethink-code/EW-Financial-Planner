import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import NewRetirementFunds from "./new-retirement-funds";
import LumpSumBequests from "./lump-sum-bequests";
import Assurance from "./assurance";

type TabType = "retirement-funds" | "lump-sum-bequests" | "assurance";

export default function DeathWithEstateLiquidity() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("retirement-funds");

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
            <nav className="flex space-x-8">
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
                onClick={() => handleTabChange("lump-sum-bequests")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "lump-sum-bequests"
                    ? "border-[#016991] text-[#016991]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Lump Sum Needs and Cash Bequests
              </button>
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
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "retirement-funds" && (
            <div>
              <NewRetirementFunds />
            </div>
          )}
          {activeTab === "lump-sum-bequests" && (
            <div>
              <LumpSumBequests />
            </div>
          )}
          {activeTab === "assurance" && (
            <div>
              <Assurance />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}