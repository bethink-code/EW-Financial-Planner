import { useState } from "react";
import { Trash2, Copy, MoreHorizontal } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RetirementFund, InsertRetirementFund } from "@shared/schema";

interface FundActionsProps {
  fund: RetirementFund;
  onDuplicate?: (fund: RetirementFund) => void;
}

export function FundActions({ fund, onDuplicate }: FundActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/retirement-funds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
      toast({
        title: "Fund Deleted",
        description: "Retirement fund has been deleted successfully.",
      });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete retirement fund. Please try again.",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (fundData: InsertRetirementFund) => {
      return apiRequest("POST", "/api/retirement-funds", fundData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
      toast({
        title: "Fund Duplicated",
        description: "Retirement fund has been duplicated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to duplicate retirement fund. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(fund.id);
  };

  const handleDuplicate = () => {
    // Create a copy of the fund without the ID
    const fundCopy: InsertRetirementFund = {
      description: `${fund.description} (Copy)`,
      owner: fund.owner,
      coverAmount: fund.coverAmount,
      beneficiaries: fund.beneficiaries,
      monthlyIncome: fund.monthlyIncome,
      termYears: fund.termYears,
      increasePercentage: fund.increasePercentage,
      approvedLifeCover: fund.approvedLifeCover,
      fundValue: fund.fundValue,
      fundValueAtDeath: fund.fundValueAtDeath,
      beneficiaryName: fund.beneficiaryName,
      beneficiaryPercentageSplit: fund.beneficiaryPercentageSplit,
      amount: fund.amount,
      lumpSumTaken: fund.lumpSumTaken,
      nondeductibleContribution: fund.nondeductibleContribution,
      livingAnnuity: fund.livingAnnuity,
      incomeTerm: fund.incomeTerm,
      lumpSumLeftOverProvisions: fund.lumpSumLeftOverProvisions,
      incomeProvisionOption: fund.incomeProvisionOption,
      monthlyProvisionOffered: fund.monthlyProvisionOffered,
      currentAnnualIncome: fund.currentAnnualIncome,
      annualIncomeAtDeath: fund.annualIncomeAtDeath,
    };

    duplicateMutation.mutate(fundCopy);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal size={12} />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
            className="text-xs"
          >
            <Copy size={12} className="mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
            className="text-xs text-red-600 focus:text-red-600"
          >
            <Trash2 size={12} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Retirement Fund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fund.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}