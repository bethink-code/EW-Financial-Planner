import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatPercentageValue, formatCurrencyValue, getValueClass, isDefaultValue, handleDefaultValueFocus, createEnhancedBlurHandler } from "@/lib/formatting";
import { LumpSumBequest, InsertLumpSumBequest } from "@shared/schema";
import { Trash2, Plus } from "lucide-react";

interface LumpSumTableProps {
  searchTerm: string;
}

export function LumpSumTable({ searchTerm }: LumpSumTableProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch lump sum bequests with search
  const { data: bequests = [], isLoading } = useQuery<LumpSumBequest[]>({
    queryKey: ['/api/lump-sum-bequests', searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `/api/lump-sum-bequests?search=${encodeURIComponent(searchTerm)}`
        : '/api/lump-sum-bequests';
      const response = await fetch(url);
      return await response.json();
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: keyof InsertLumpSumBequest; value: string }) => {
      return await apiRequest('PATCH', `/api/lump-sum-bequests/${id}`, { [field]: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
      setIsUpdating(false);
    }
  });

  // Add new bequest mutation
  const addMutation = useMutation({
    mutationFn: async (newBequest: InsertLumpSumBequest) => {
      return await apiRequest('POST', '/api/lump-sum-bequests', newBequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/lump-sum-bequests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
    }
  });

  const handleInputBlur = useCallback((id: number, field: keyof InsertLumpSumBequest, value: string) => {
    if (value !== undefined) {
      setIsUpdating(true);
      updateMutation.mutate({ id, field, value });
    }
  }, [updateMutation]);

  const handleAddBequest = useCallback(() => {
    const newBequest: InsertLumpSumBequest = {
      description: "Enter here ...",
      entity: "Donald Edwards",
      start: "0",
      increasePercentage: "CPI",
      amount: "0",
      valueAtDeath: "0",
      charityNote: "Enter here ...",
    };
    addMutation.mutate(newBequest);
  }, [addMutation]);

  // Calculate total value at death
  const totalValueAtDeath = useMemo(() => {
    return bequests.reduce((sum: number, bequest: LumpSumBequest) => {
      const value = bequest.valueAtDeath?.replace(/[^\d.-]/g, '') || '0';
      return sum + (parseFloat(value) || 0);
    }, 0);
  }, [bequests]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleAddBequest}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-[#014d73] rounded-md transition-colors"
          disabled={addMutation.isPending}
        >
          <Plus size={16} />
          Add Bequest
        </button>
        <h3 className="text-lg font-semibold text-neutral-900">Details</h3>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-primary/10 border-b border-neutral-300">
                <th className="p-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider w-8"></th>
                <th className="p-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[200px]">Description</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[140px]">Entity</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[100px]">Start</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[120px]">Increase %</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[120px]">Amount</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[140px]">Value at death</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {bequests.map((bequest: LumpSumBequest) => (
                <tr key={bequest.id} className="hover:bg-neutral-50">
                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteMutation.mutate(bequest.id)}
                      className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                  <td className="p-2">
                    <input
                      defaultValue={bequest.description || "Enter here ..."}
                      onFocus={handleDefaultValueFocus}
                      onBlur={createEnhancedBlurHandler(
                        (e) => handleInputBlur(bequest.id, "description", e.target.value),
                        'text'
                      )}
                      className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(bequest.description || "Enter here ...", 'text')}`}
                      style={{ textAlign: "left" }}
                      disabled={isUpdating}
                      placeholder="Enter description"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <select
                      defaultValue={bequest.entity || "Donald Edwards"}
                      onChange={(e) => {
                        handleInputBlur(bequest.id, "entity", e.target.value);
                      }}
                      className={getFieldClass("description")} style={getFieldWidth("description")}
                      disabled={isUpdating}
                    >
                      <option value="Donald Edwards">Donald Edwards</option>
                      <option value="Betty Edwards">Betty Edwards</option>
                    </select>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      defaultValue={formatCurrencyValue(bequest.start || "0")}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value);
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleInputBlur(bequest.id, "start", e.target.value);
                      }}
                      className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(formatCurrencyValue(bequest.start || "0"), 'currency')}`}
                      style={{ textAlign: "right", minWidth: "80px" }}
                      placeholder="0"
                      disabled={isUpdating}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center gap-1">
                      <input
                        key={`increasePercentage-${bequest.id}-${bequest.increasePercentage}`}
                        type="text"
                        defaultValue={bequest.increasePercentage || "6%"}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          const formattedValue = formatPercentageValue(e.target.value);
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(bequest.id, "increasePercentage", e.target.value);
                        }}
                        className={`${getFieldClass('percentage')} table-input text-right ${getValueClass(bequest.increasePercentage || "6%", 'percentage')}`}
                        disabled={isUpdating}
                      />
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={bequest.cpi || false}
                          onChange={(e) => {
                            updateMutation.mutate({
                              id: bequest.id,
                              field: 'cpi',
                              value: e.target.checked.toString()
                            });
                          }}
                          className="mr-1"
                          disabled={isUpdating}
                        />
                        CPI
                      </label>
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      defaultValue={formatCurrencyValue(bequest.amount || "0")}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value);
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleInputBlur(bequest.id, "amount", e.target.value);
                      }}
                      className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(formatCurrencyValue(bequest.amount || "0"), 'currency')}`}
                      style={{ textAlign: "right", minWidth: "100px" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <div className="table-input h-7 text-sm bg-gray-100 border-gray-200 w-full px-3 py-1 border rounded-md text-sm text-gray-700"
                         style={{ textAlign: "right", minWidth: "120px" }}>
                      {formatCurrencyValue(bequest.valueAtDeath || "0")}
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Charity Bequest Row */}
              <tr className="bg-neutral-50">
                <td className="p-2"></td>
                <td className="p-2 text-left font-medium text-neutral-700" colSpan={2}>
                  Bequest to charities and institutions
                </td>
                <td className="p-2 text-right">
                  <input
                    defaultValue="0"
                    className="table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                    style={{ textAlign: "right", minWidth: "80px" }}
                    disabled={isUpdating}
                  />
                </td>
                <td className="p-2 text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <input
                      type="text"
                      defaultValue="6%"
                      onFocus={handleDefaultValueFocus}
                      onBlur={createEnhancedBlurHandler(
                        (e) => {
                          // Charity row - no specific handling needed for charity row
                        },
                        'percentage'
                      )}
                      className={`${getFieldClass('percentage')} table-input text-right ${getValueClass("6%", 'percentage')}`}
                      disabled={isUpdating}
                    />
                    <label className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mr-1"
                        disabled={isUpdating}
                      />
                      CPI
                    </label>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <input
                    defaultValue="0"
                    className="table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                    style={{ textAlign: "right", minWidth: "100px" }}
                    placeholder="R 0"
                    disabled={isUpdating}
                  />
                </td>
                <td className="p-2 text-right">
                  <div className="text-sm text-neutral-700">R 0</div>
                </td>
              </tr>
              
              {/* Total Row */}
              <tr className="bg-[#F5F5F5] border-t-2 border-neutral-300">
                <td className="p-2"></td>
                <td className="p-2 text-left font-bold text-neutral-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontWeight: 700 }}>
                  Total
                </td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2 text-right font-bold text-neutral-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontWeight: 700 }}>
                  R {totalValueAtDeath.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}