import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Plus, Eye, Copy, Trash2 } from "lucide-react";
import { FinancialPlanningLayout } from "@/components/navigation/financial-planning-layout";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import { CreatePlanDialog } from "@/components/financial-plans/create-plan-dialog";
import type { FinancialPlan, Need, PlanNeed } from "@shared/schema";

interface FinancialPlanWithNeeds extends FinancialPlan {
  needs?: Need[];
  planNeeds?: PlanNeed[];
}

export default function FinancialPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch financial plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["/api/financial-plans", searchQuery],
    queryFn: () => {
      const url = searchQuery 
        ? `/api/financial-plans?search=${encodeURIComponent(searchQuery)}`
        : "/api/financial-plans";
      return fetch(url).then(res => res.json());
    },
  });

  // Fetch needs to show in plans
  const { data: allNeeds = [] } = useQuery({
    queryKey: ["/api/needs"],
  });

  // Fetch plan needs for each plan to show associated needs
  const { data: planNeedsMap = {} } = useQuery({
    queryKey: ["/api/plan-needs", plans],
    queryFn: async () => {
      if (!plans || plans.length === 0) return {};
      
      const map: Record<number, Need[]> = {};
      
      for (const plan of plans) {
        try {
          const response = await fetch(`/api/financial-plans/${plan.id}/with-needs`);
          if (response.ok) {
            const data = await response.json();
            map[plan.id] = data.needs || [];
          }
        } catch (error) {
          console.error(`Error fetching needs for plan ${plan.id}:`, error);
          map[plan.id] = [];
        }
      }
      
      return map;
    },
    enabled: plans && plans.length > 0,
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await fetch(`/api/financial-plans/${planId}`, { 
        method: "DELETE" 
      });
      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-plans"] });
    },
  });

  const handleDeletePlan = async (planId: number, planName: string) => {
    if (confirm(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`)) {
      await deletePlanMutation.mutateAsync(planId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getNeedsForPlan = (planId: number): Need[] => {
    return planNeedsMap[planId] || [];
  };

  return (
    <FinancialPlanningLayout variant="list">
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-6 py-6">
          <div className="w-[1320px]">
            <Card>
              <CardHeader className="pb-4">
              </CardHeader>

              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-600">Plan name</TableHead>
                        <TableHead className="font-semibold text-gray-600">Needs</TableHead>
                        <TableHead className="font-semibold text-gray-600">Date applicable</TableHead>
                        <TableHead className="w-32"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            Loading plans...
                          </TableCell>
                        </TableRow>
                      ) : plans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            {searchQuery ? "No plans found matching your search." : "No financial plans created yet."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        plans.map((plan: FinancialPlan) => (
                          <TableRow key={plan.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {getNeedsForPlan(plan.id).slice(0, 3).map((need, index) => (
                                  <Badge key={index} variant="muted" className="text-xs">
                                    {need.displayName.toUpperCase()}
                                  </Badge>
                                ))}
                                {getNeedsForPlan(plan.id).length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{getNeedsForPlan(plan.id).length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(plan.dateApplicable)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Link href={`/financial-plans/${plan.id}`}>
                                  <Button className="bg-[#E6F0F5] hover:bg-[#D6E7F0] text-[#016991] border-[#E6F0F5]" size="sm">
                                    Choose
                                  </Button>
                                </Link>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-9 w-9 p-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-9 w-9 p-0"
                                  onClick={() => handleDeletePlan(plan.id, plan.name)}
                                  disabled={deletePlanMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FinancialPlanningLayout>
  );
}