import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Trash2, FileText, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { FinancialPlan } from "@shared/schema";
import headerImage from "@assets/EW Header_1753945516780.png";

export default function FinancialPlans() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery<FinancialPlan[]>({
    queryKey: ["/api/financial-plans"],
    queryFn: async () => {
      const res = await fetch("/api/financial-plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/financial-plans", {
        name: "New Financial Plan",
        clientName: "",
      });
      return await res.json();
    },
    onSuccess: (plan: FinancialPlan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-plans"] });
      // Navigate into the new plan
      setLocation(`/plan/${plan.id}/assurance`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/financial-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-plans"] });
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenPlan = (plan: FinancialPlan) => {
    // For now, navigate to assurance with plan context
    // TODO: once plan-scoped routing is added, use /plan/:id/assurance
    setLocation("/assurance");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full overflow-x-auto">
        <div className="pl-6">
          <img
            src={headerImage}
            alt="EW Financial Planning"
            className="block"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 pt-8">
        <div className="max-w-[1320px]">
          {/* Title row */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Financial Plans
            </h1>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="bg-[#F97415] hover:bg-[#E86A10] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>

          {/* Plans table */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-500">Loading plans...</div>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                No financial plans yet
              </h2>
              <p className="text-gray-500 mb-6">
                Create your first financial plan to get started.
              </p>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="bg-[#F97415] hover:bg-[#E86A10] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr
                      key={plan.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleOpenPlan(plan)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#F97415]" />
                          <span className="font-medium text-gray-900">
                            {plan.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {plan.clientName || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {plan.createdAt || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {plan.updatedAt || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(plan.id, plan.name);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
