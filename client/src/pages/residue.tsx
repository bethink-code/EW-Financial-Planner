import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Residue, InsertResidue } from "@shared/schema";

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

  // Calculate total (should always be the percentage value since there's only one row)
  const total = residueItems.length > 0 ? parseFloat(residueItems[0].percentage || '0') : 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading residue...</div>
      </div>
    );
  }

  // Ensure we have exactly one residue item
  const residueItem = residueItems[0] || { id: 1, entity: "Residue to registered charities", percentage: "0" };

  return (
    <div className="px-6 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Residue</h1>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Header */}
              <thead>
                <tr className="bg-neutral-100">
                  <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-left border-b border-neutral-200">
                    Entity
                  </th>
                  <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">
                    Percentage
                  </th>
                </tr>
              </thead>
              
              {/* Body */}
              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3 text-left text-gray-700">
                    Residue to registered charities
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="text"
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue={residueItem.percentage}
                      onBlur={(e) => handlePercentageBlur(residueItem.id, e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                </tr>
              </tbody>
              
              {/* Footer - Total */}
              <tfoot>
                <tr className="bg-neutral-50 border-t border-neutral-300">
                  <td className="p-3 text-left font-semibold text-gray-700">
                    Total
                  </td>
                  <td className="p-3 text-center font-semibold text-gray-700">
                    {total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResiduePage() {
  return <ResidueTable />;
}