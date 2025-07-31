import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Residue } from "@shared/schema";
import { SafeFragment } from "@/lib/safe-fragment";

function ResidueSummary({ items }: { items: Residue[] }) {
  const total = items.reduce((sum, item) => {
    const percentage = parseFloat(item.percentage || '0');
    return sum + percentage;
  }, 0);

  return (
    <div className="summary-card">
      <div className="grid grid-cols-1 gap-6">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">{total}%</div>
          <div className="text-sm text-gray-600">Total Percentage</div>
        </div>
      </div>
    </div>
  );
}

function ResidueTable() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: residueItems = [], isLoading } = useQuery<Residue[]>({
    queryKey: ["/api/residue"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<Residue>) => {
      const response = await fetch(`/api/residue/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update residue");
      return response.json();
    },
    onSuccess: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: ["/api/residue"] });
    },
    onError: () => {
      setIsUpdating(false);
    },
  });

  const handleUpdateResidue = useCallback((id: number, updates: Partial<Residue>) => {
    setIsUpdating(true);
    updateMutation.mutate({ id, ...updates });
  }, [updateMutation]);

  const handlePercentageBlur = useCallback((id: number, value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    handleUpdateResidue(id, { percentage: numericValue });
  }, [handleUpdateResidue]);

  // Calculate total
  const total = residueItems.reduce((sum, item) => {
    const percentage = parseFloat(item.percentage || '0');
    return sum + percentage;
  }, 0);

  if (isLoading) {
    return (
      <div className="px-6 py-6 bg-gray-50 min-h-screen">
        <div className="text-center">Loading residue...</div>
      </div>
    );
  }

  // Ensure we have exactly one residue item (auto-create if none exists)
  const residueItem = residueItems[0] || { id: 1, entity: "Residue to registered charities", percentage: "0" };

  return (
    <div className="px-6 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl">
        {/* Header with Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Residue</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  1 entity
                </span>
              </div>
            </div>
          </div>
          
          <ResidueSummary items={residueItems} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead>
              <tr className="bg-neutral-100">
                <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-left border-b border-neutral-200">
                  Entity
                </th>
                <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">
                  Percentage
                </th>
              </tr>
            </thead>
            
            {/* Body */}
            <tbody>
              <SafeFragment key={`residue-${residueItem.id}`}>
                <tr>
                  <td className="p-2 text-left">
                    <span className="text-gray-700">Residue to registered charities</span>
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="text"
                      className="table-input field-percentage"
                      defaultValue={residueItem.percentage}
                      onBlur={(e) => handlePercentageBlur(residueItem.id, e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                </tr>
              </SafeFragment>
            </tbody>
            
            {/* Footer - Total */}
            <tfoot>
              <tr className="bg-neutral-50 border-t border-neutral-300">
                <td className="p-2 text-left font-semibold text-gray-700">
                  Total
                </td>
                <td className="p-2 text-center font-semibold text-gray-700">
                  {total}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ResiduePage() {
  return <ResidueTable />;
}