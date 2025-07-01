import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PiggyBank, Bell, UserCircle } from "lucide-react";
import { TableControls } from "@/components/retirement-funds/table-controls";
import { GroupedTableView } from "@/components/retirement-funds/grouped-table-view";
import { CardsView } from "@/components/retirement-funds/cards-view";
import { DetailedView } from "@/components/retirement-funds/detailed-view";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

type ViewMode = "grouped" | "cards" | "detailed";

interface ColumnVisibility {
  basicInfo: boolean;
  deathBenefits: boolean;
  financialDetails: boolean;
}

export default function RetirementFunds() {
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    basicInfo: true,
    deathBenefits: true,
    financialDetails: true,
  });
  
  const { toast } = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-switch to cards view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "grouped") {
        setViewMode("cards");
      }
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  // Fetch retirement funds
  const { data: funds = [], isLoading } = useQuery({
    queryKey: ["/api/retirement-funds", debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch 
        ? `/api/retirement-funds?search=${encodeURIComponent(debouncedSearch)}`
        : "/api/retirement-funds";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch funds");
      return response.json() as RetirementFund[];
    },
  });

  // Update fund mutation
  const updateFundMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateRetirementFund }) => {
      const response = await apiRequest("PATCH", `/api/retirement-funds/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
      toast({
        title: "Fund updated",
        description: "Changes saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFieldUpdate = (id: number, field: keyof UpdateRetirementFund, value: string) => {
    updateFundMutation.mutate({ id, updates: { [field]: value } });
  };

  const handleToggleColumnGroup = (group: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <PiggyBank className="text-primary-foreground text-sm" size={16} />
                </div>
                <h1 className="text-xl font-semibold text-neutral-900">Retirement Funds</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <Bell size={18} />
              </button>
              <button className="text-neutral-600 hover:text-neutral-900 transition-colors">
                <UserCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TableControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          columnVisibility={columnVisibility}
          onToggleColumnGroup={handleToggleColumnGroup}
          fundsCount={funds.length}
        />

        {/* View Content */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "grouped" && (
              <GroupedTableView
                funds={funds}
                columnVisibility={columnVisibility}
                onFieldUpdate={handleFieldUpdate}
                isUpdating={updateFundMutation.isPending}
              />
            )}
            {viewMode === "cards" && (
              <CardsView
                funds={funds}
                onFieldUpdate={handleFieldUpdate}
                isUpdating={updateFundMutation.isPending}
              />
            )}
            {viewMode === "detailed" && (
              <DetailedView
                funds={funds}
                onFieldUpdate={handleFieldUpdate}
                isUpdating={updateFundMutation.isPending}
              />
            )}
          </>
        )}

        {/* Mobile notification */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg lg:hidden">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs">i</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Mobile View Active</h4>
              <p className="text-sm text-blue-700 mt-1">
                For the best experience with this data table, consider using Cards view on mobile devices or switch to Detailed view for comprehensive editing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
