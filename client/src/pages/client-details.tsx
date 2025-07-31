import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ClientDetails, InsertClientDetails } from "@shared/schema";

import { CalculatorHeader } from "@/components/ui/calculator-header";
import { AddButton, DeleteButton } from "@/components/ui/action-buttons";
import { 
  formatCurrencyValue, 
  formatPercentageValue, 
  formatTextValue, 
  isDefaultValue,
  getValueClass,
  handleDefaultValueFocus,
  createEnhancedBlurHandler 
} from "@/lib/formatting";
import { getFieldClass } from "@/lib/design-tokens";

function ClientDetailsTable() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: clientDetails = [], isLoading } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertClientDetails) => {
      const response = await fetch("/api/client-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create client detail");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-details"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<ClientDetails>) => {
      const response = await fetch(`/api/client-details/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update client detail");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-details"] });
      setIsUpdating(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/client-details/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete client detail");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-details"] });
    },
  });

  const handleAddClientDetail = useCallback(() => {
    createMutation.mutate({});
  }, [createMutation]);

  const handleUpdateClientDetail = useCallback((id: number, updates: Partial<ClientDetails>) => {
    setIsUpdating(true);
    updateMutation.mutate({ id, ...updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: string, value: string) => {
    handleUpdateClientDetail(id, { [field]: value });
  }, [handleUpdateClientDetail]);

  const handleDeleteClientDetail = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading client details...</div>
      </div>
    );
  }

  return (
      <div className="px-6 py-6 bg-gray-50 min-h-screen">
        <CalculatorHeader 
          title="Client Details"
          itemCount={clientDetails.length}
          itemLabel={clientDetails.length === 1 ? "entity" : "entities"}
          onAddItem={handleAddClientDetail}
          addButtonText="Add Entity"
        />

        <div className="mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="single-row-header">
                <th className="section-start p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Actions
                </th>
                <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-left">
                  Entity Name
                </th>
                <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Entity Type
                </th>
                <th className="section-start p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Date of Birth
                </th>
                <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Age
                </th>
                <th className="section-start p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Tax Rate
                </th>
                <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Marginal Tax Rate
                </th>
                <th className="section-start p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Marital Status
                </th>
                <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Marital Regime
                </th>
                <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Marital Date
                </th>
                <th className="p-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">
                  Accrual Inception
                </th>
              </tr>
            </thead>
            <tbody>
              {clientDetails.map((client) => (
                <tr key={`client-${client.id}`} className="border-b border-neutral-200">
                  <td className="section-start p-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <AddButton
                        onClick={() => createMutation.mutate({})}
                        disabled={isUpdating}
                        size="sm"
                      />
                      <DeleteButton
                        onClick={() => handleDeleteClientDetail(client.id)}
                        disabled={isUpdating}
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className="p-2 text-left">
                    <input
                      type="text"
                      className={`table-input ${getValueClass(client.entityName, 'text')}`}
                      defaultValue={formatTextValue(client.entityName)}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(client.id, 'entityName', e.target.value)}
                      placeholder="Enter entity name"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <select
                      className="table-input table-dropdown"
                      defaultValue={client.entityType || "Primary entity"}
                      onChange={(e) => handleUpdateClientDetail(client.id, { entityType: e.target.value })}
                    >
                      <option value="Primary entity">Primary entity</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Dependants">Dependants</option>
                      <option value="Others">Others</option>
                    </select>
                  </td>
                  <td className="section-start p-2 text-center">
                    <input
                      type="date"
                      className="table-input"
                      defaultValue={client.dateOfBirth}
                      onBlur={(e) => handleInputBlur(client.id, 'dateOfBirth', e.target.value)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="text"
                      className={`table-input ${getFieldClass('number')}`}
                      defaultValue={client.age}
                      onBlur={(e) => handleInputBlur(client.id, 'age', e.target.value)}
                      placeholder="Age"
                    />
                  </td>
                  <td className="section-start p-2 text-center">
                    <select
                      className="table-input table-dropdown"
                      defaultValue={client.taxRate || "South Africa"}
                      onChange={(e) => handleUpdateClientDetail(client.id, { taxRate: e.target.value })}
                    >
                      <option value="South Africa">South Africa</option>
                      <option value="International">International</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="text"
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(client.marginalTaxRate, 'percentage')}`}
                      defaultValue={formatPercentageValue(client.marginalTaxRate)}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(client.id, 'marginalTaxRate', e.target.value)}
                      placeholder="0%"
                    />
                  </td>
                  <td className="section-start p-2 text-center">
                    <select
                      className="table-input table-dropdown"
                      defaultValue={client.maritalStatus || ""}
                      onChange={(e) => handleUpdateClientDetail(client.id, { maritalStatus: e.target.value })}
                    >
                      <option value="">Select status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <select
                      className="table-input table-dropdown"
                      defaultValue={client.maritalRegime || ""}
                      onChange={(e) => handleUpdateClientDetail(client.id, { maritalRegime: e.target.value })}
                    >
                      <option value="">Select regime</option>
                      <option value="In Community of Property">In Community of Property</option>
                      <option value="Out of Community of Property">Out of Community of Property</option>
                      <option value="Accrual System">Accrual System</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="date"
                      className="table-input"
                      defaultValue={client.maritalDate}
                      onBlur={(e) => handleInputBlur(client.id, 'maritalDate', e.target.value)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="text"
                      className={`table-input ${getFieldClass('number')}`}
                      defaultValue={client.accrualInception}
                      onBlur={(e) => handleInputBlur(client.id, 'accrualInception', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}

export default function ClientDetailsPage() {
  return <ClientDetailsTable />;
}