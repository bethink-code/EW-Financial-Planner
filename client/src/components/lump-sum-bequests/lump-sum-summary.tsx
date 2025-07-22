import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LumpSumBequest } from "@shared/schema";

interface LumpSumSummaryProps {
  searchTerm?: string;
}

export function LumpSumSummary({ searchTerm = "" }: LumpSumSummaryProps) {
  // Fetch lump sum bequests
  const { data: bequests = [] } = useQuery<LumpSumBequest[]>({
    queryKey: ['/api/lump-sum-bequests', searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `/api/lump-sum-bequests?search=${encodeURIComponent(searchTerm)}`
        : '/api/lump-sum-bequests';
      const response = await fetch(url);
      return await response.json();
    }
  });

  // Calculate summary totals
  const summaryData = useMemo(() => {
    const totals = bequests.reduce((acc: any, bequest: LumpSumBequest) => {
      const valueAtDeath = parseFloat(bequest.valueAtDeath?.replace(/[^\d.-]/g, '') || '0') || 0;
      const amount = parseFloat(bequest.amount?.replace(/[^\d.-]/g, '') || '0') || 0;
      
      return {
        totalValueAtDeath: acc.totalValueAtDeath + valueAtDeath,
        totalAmount: acc.totalAmount + amount,
        count: acc.count + 1
      };
    }, {
      totalValueAtDeath: 0,
      totalAmount: 0,
      count: 0
    });

    return totals;
  }, [bequests]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div style={{ backgroundColor: '#E0F2FE' }} className="rounded-lg p-4 text-center">
        <div className="text-xs font-medium text-teal-700 mb-1">Total Bequests</div>
        <div className="text-lg font-bold text-neutral-900">
          {summaryData.count}
        </div>
      </div>
      
      <div style={{ backgroundColor: '#E0F2FE' }} className="rounded-lg p-4 text-center">
        <div className="text-xs font-medium text-teal-700 mb-1">Total Amount</div>
        <div className="text-lg font-bold text-neutral-900">
          R {summaryData.totalAmount.toLocaleString()}
        </div>
      </div>
      
      <div style={{ backgroundColor: '#E0F2FE' }} className="rounded-lg p-4 text-center">
        <div className="text-xs font-medium text-teal-700 mb-1">Total Value at Death</div>
        <div className="text-lg font-bold text-neutral-900">
          R {summaryData.totalValueAtDeath.toLocaleString()}
        </div>
      </div>
    </div>
  );
}