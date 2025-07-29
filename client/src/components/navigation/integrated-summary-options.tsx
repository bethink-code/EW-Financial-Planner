import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Option 1: Tabs integrated into the summary card header
export function Option1() {
  const [location] = useLocation();
  const isRetirementFunds = location.includes("/retirement-funds");
  
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Integrated tabs in the card header */}
      <div className="border-b">
        <div className="flex">
          <Link href="/retirement-funds">
            <button className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              isRetirementFunds 
                ? "border-[#016991] text-[#016991] bg-blue-50" 
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}>
              Retirement funds
            </button>
          </Link>
          <Link href="/defined-benefit-funds">
            <button className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              !isRetirementFunds 
                ? "border-[#016991] text-[#016991] bg-blue-50" 
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}>
              Defined benefit funds (GEPF)
            </button>
          </Link>
        </div>
      </div>
      
      {/* Summary content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Retirement Funds</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">3 funds</span>
            <button className="h-9 px-4 bg-[#016991] text-white rounded text-sm hover:bg-[#016991]/90">
              + Add Fund
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Total Funds</h3>
            <p className="text-xl font-semibold">3</p>
          </div>
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Cover Amount Total</h3>
            <p className="text-xl font-semibold">R 1,000,000</p>
          </div>
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Monthly Income Total</h3>
            <p className="text-xl font-semibold">R 25,000</p>
          </div>
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Approved Life Cover Total</h3>
            <p className="text-xl font-semibold">R 1,000,000</p>
          </div>
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Fund Value Total</h3>
            <p className="text-xl font-semibold">R 500,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Option 2: Pills/buttons style integrated into summary header
export function Option2() {
  const [location] = useLocation();
  const isRetirementFunds = location.includes("/retirement-funds");
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header with integrated navigation pills */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Retirement Funds</h2>
          <div className="flex gap-2">
            <Link href="/retirement-funds">
              <button className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                isRetirementFunds 
                  ? "bg-[#016991] text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}>
                Retirement funds
              </button>
            </Link>
            <Link href="/defined-benefit-funds">
              <button className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                !isRetirementFunds 
                  ? "bg-[#016991] text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}>
                Defined benefit funds
              </button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">3 funds</span>
          <button className="h-9 px-4 bg-[#016991] text-white rounded text-sm hover:bg-[#016991]/90">
            + Add Fund
          </button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Total Funds</h3>
          <p className="text-xl font-semibold">3</p>
        </div>
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Cover Amount Total</h3>
          <p className="text-xl font-semibold">R 1,000,000</p>
        </div>
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Monthly Income Total</h3>
          <p className="text-xl font-semibold">R 25,000</p>
        </div>
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Approved Life Cover Total</h3>
          <p className="text-xl font-semibold">R 1,000,000</p>
        </div>
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Fund Value Total</h3>
          <p className="text-xl font-semibold">R 500,000</p>
        </div>
      </div>
    </div>
  );
}

// Option 3: Sidebar navigation within the card
export function Option3() {
  const [location] = useLocation();
  const isRetirementFunds = location.includes("/retirement-funds");
  
  return (
    <div className="bg-white rounded-lg shadow-sm border flex">
      {/* Sidebar navigation */}
      <div className="w-64 border-r bg-gray-50">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3">Retirement Funds</h2>
          <div className="space-y-1">
            <Link href="/retirement-funds">
              <button className={cn(
                "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                isRetirementFunds 
                  ? "bg-white text-[#016991] font-medium shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100"
              )}>
                Retirement funds
              </button>
            </Link>
            <Link href="/defined-benefit-funds">
              <button className={cn(
                "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                !isRetirementFunds 
                  ? "bg-white text-[#016991] font-medium shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100"
              )}>
                Defined benefit funds (GEPF)
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">3 funds</span>
          <button className="h-9 px-4 bg-[#016991] text-white rounded text-sm hover:bg-[#016991]/90">
            + Add Fund
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Total Funds</h3>
            <p className="text-xl font-semibold">3</p>
          </div>
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Cover Amount Total</h3>
            <p className="text-xl font-semibold">R 1,000,000</p>
          </div>
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Monthly Income Total</h3>
            <p className="text-xl font-semibold">R 25,000</p>
          </div>
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Approved Life Cover Total</h3>
            <p className="text-xl font-semibold">R 1,000,000</p>
          </div>
          <div className="summary-card">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Fund Value Total</h3>
            <p className="text-xl font-semibold">R 500,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Option 4: Dropdown selector style
export function Option4() {
  const [location] = useLocation();
  const isRetirementFunds = location.includes("/retirement-funds");
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header with dropdown selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Retirement Funds</h2>
          <select 
            className="px-4 py-2 border rounded-lg text-sm bg-white"
            value={isRetirementFunds ? "retirement" : "defined"}
            onChange={(e) => {
              if (e.target.value === "retirement") {
                window.location.href = "/retirement-funds";
              } else {
                window.location.href = "/defined-benefit-funds";
              }
            }}
          >
            <option value="retirement">Retirement funds</option>
            <option value="defined">Defined benefit funds (GEPF)</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">3 funds</span>
          <button className="h-9 px-4 bg-[#016991] text-white rounded text-sm hover:bg-[#016991]/90">
            + Add Fund
          </button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Total Funds</h3>
          <p className="text-xl font-semibold">3</p>
        </div>
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Cover Amount Total</h3>
          <p className="text-xl font-semibold">R 1,000,000</p>
        </div>
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Monthly Income Total</h3>
          <p className="text-xl font-semibold">R 25,000</p>
        </div>
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Approved Life Cover Total</h3>
          <p className="text-xl font-semibold">R 1,000,000</p>
        </div>
        <div className="summary-card">
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">Fund Value Total</h3>
          <p className="text-xl font-semibold">R 500,000</p>
        </div>
      </div>
    </div>
  );
}