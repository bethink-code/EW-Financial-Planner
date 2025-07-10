import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { insertRetirementFundSchema, type InsertRetirementFund } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddFundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundDialog({ open, onOpenChange }: AddFundDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertRetirementFund>({
    resolver: zodResolver(insertRetirementFundSchema),
    defaultValues: {
      description: "",
      owner: "",
      coverAmount: "",
      beneficiaries: "[]",
      monthlyIncome: "",
      termYears: "",
      increasePercentage: "",
      approvedLifeCover: "",
      fundValue: "",
      fundValueAtDeath: "",
      beneficiaryName: "",
      beneficiaryPercentageSplit: "",
      amount: "",
      lumpSumTaken: "",
      nondeductibleContribution: "",
      livingAnnuity: "",
      incomeTerm: "",
      lumpSumLeftOverProvisions: "0",
      incomeProvisionOption: "",
      monthlyProvisionOffered: "0",
      currentAnnualIncome: "0",
      annualIncomeAtDeath: "0",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRetirementFund) => {
      return apiRequest("POST", "/api/retirement-funds", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
      toast({
        title: "Fund Created",
        description: "New retirement fund has been added successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create retirement fund. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertRetirementFund) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={20} />
            Add New Retirement Fund
          </DialogTitle>
          <DialogDescription>
            Create a new retirement fund by filling in the basic information below.
            You can edit detailed information after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fund Description *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Company Pension Fund"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., John Smith"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Financial Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="coverAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Amount</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 1000000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 15000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approvedLifeCover"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approved Life Cover</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 500000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fundValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fund Value</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 2000000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term (Years)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="increasePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Increase Percentage</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 5"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Primary Beneficiary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-900">Primary Beneficiary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="beneficiaryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiary Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Jane Smith"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beneficiaryPercentageSplit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage Split</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 100"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 1000000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus size={16} className="mr-1" />
                    Create Fund
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}