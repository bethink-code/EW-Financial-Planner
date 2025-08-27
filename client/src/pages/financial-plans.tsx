import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Plus, Eye, Copy, Trash2 } from "lucide-react";
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
import { CreatePlanDialog } from "@/components/financial-plans/create-plan-dialog";
import { apiRequest } from "@/lib/queryClient";
import type { FinancialPlan, Need } from "@shared/schema";

interface FinancialPlanWithNeeds extends FinancialPlan {
  needs?: Need[];
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

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (planId: number) => 
      apiRequest(`/api/financial-plans/${planId}`, { method: "DELETE" }),
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

  const getNeedsForPlan = (planId: number): string[] => {
    // In a real implementation, this would come from the plan-needs relationships
    // For now, we'll simulate some data based on the plan
    const sampleNeeds = ["DEATH", "RETIREMENT", "INVESTMENT PLANNING"];
    return sampleNeeds;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6">
        <div className="w-[1320px]">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">Financial plans</CardTitle>
                <CreatePlanDialog 
                  isOpen={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  allNeeds={allNeeds}
                >
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create a new plan
                  </Button>
                </CreatePlanDialog>
              </div>
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
                              {getNeedsForPlan(plan.id).map((need, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {need}
                                </Badge>
                              ))}
                              <Badge variant="outline" className="text-xs">+2</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {formatDate(plan.dateApplicable)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link href={`/financial-plans/${plan.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Choose
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
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
  );
}