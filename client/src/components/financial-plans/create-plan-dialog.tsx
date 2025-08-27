import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, X } from "lucide-react";
import { insertFinancialPlanSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Need } from "@shared/schema";

interface CreatePlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allNeeds: Need[];
  children?: React.ReactNode;
}

const formSchema = insertFinancialPlanSchema.extend({
  selectedNeeds: z.array(z.number()).min(1, "Please select at least one need"),
});

type FormData = z.infer<typeof formSchema>;

export function CreatePlanDialog({ isOpen, onOpenChange, allNeeds, children }: CreatePlanDialogProps) {
  const [selectedNeeds, setSelectedNeeds] = useState<number[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      dateApplicable: new Date().toISOString().split('T')[0],
      selectedNeeds: [],
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Create the plan first
      const planData = {
        name: data.name,
        description: data.description,
        dateApplicable: data.dateApplicable,
      };
      
      const response = await fetch("/api/financial-plans", {
        method: "POST",
        body: JSON.stringify(planData),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create plan');
      }
      
      const plan = await response.json();

      // Add selected needs to the plan
      for (let i = 0; i < selectedNeeds.length; i++) {
        const needResponse = await fetch(`/api/financial-plans/${plan.id}/needs`, {
          method: "POST",
          body: JSON.stringify({
            needId: selectedNeeds[i],
            sortOrder: i,
          }),
          headers: { "Content-Type": "application/json" },
        });
        
        if (!needResponse.ok) {
          throw new Error('Failed to add need to plan');
        }
      }

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-plans"] });
      onOpenChange(false);
      form.reset();
      setSelectedNeeds([]);
    },
  });

  const onSubmit = (data: FormData) => {
    const formDataWithNeeds = { ...data, selectedNeeds };
    createPlanMutation.mutate(formDataWithNeeds);
  };

  const toggleNeed = (needId: number) => {
    setSelectedNeeds(prev => 
      prev.includes(needId)
        ? prev.filter(id => id !== needId)
        : [...prev, needId]
    );
  };

  // Group needs by category
  const needsByCategory = allNeeds.reduce((acc, need) => {
    const category = need.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(need);
    return acc;
  }, {} as Record<string, Need[]>);

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'protection': return 'Protection';
      case 'planning': return 'Financial Planning';
      case 'investment': return 'Investment Planning';
      default: return 'Other';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protection': return 'bg-red-50 border-red-200 text-red-800';
      case 'planning': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'investment': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a new financial plan</DialogTitle>
          <DialogDescription>
            Start by entering basic information and selecting the financial needs to address.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter plan name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose and goals of this financial plan"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateApplicable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Applicable *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Needs Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Financial Needs</CardTitle>
                <div className="text-sm text-gray-600">
                  Choose which financial needs this plan should address. You can always modify this later.
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(needsByCategory).map(([category, needs]) => (
                    <div key={category}>
                      <div className="flex items-center mb-3">
                        <Badge 
                          className={`px-3 py-1 text-sm font-medium ${getCategoryColor(category)}`}
                        >
                          {getCategoryDisplayName(category)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {needs.map((need) => (
                          <div 
                            key={need.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-blue-300 ${
                              selectedNeeds.includes(need.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white'
                            }`}
                            onClick={() => toggleNeed(need.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{need.displayName}</div>
                                {need.hasDetailedSteps && (
                                  <div className="text-xs text-green-600 mt-1">
                                    ✓ Has detailed steps
                                  </div>
                                )}
                              </div>
                              <div className="ml-2">
                                {selectedNeeds.includes(need.id) ? (
                                  <Check className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <div className="h-4 w-4 border border-gray-300 rounded" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedNeeds.length === 0 && (
                  <div className="text-sm text-red-600 mt-2">
                    Please select at least one financial need.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPlanMutation.isPending || selectedNeeds.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}