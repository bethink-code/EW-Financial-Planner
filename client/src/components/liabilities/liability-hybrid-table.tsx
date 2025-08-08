import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Liabilities, InsertLiabilities } from '@shared/liabilities-schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { LiabilityPreviewCard } from './liability-preview-card';
import { LiabilityDetailForm } from './liability-detail-form';

interface LiabilityHybridTableProps {
  searchTerm?: string;
  onAddLiability?: () => void;
}

export function LiabilityHybridTable({ searchTerm, onAddLiability }: LiabilityHybridTableProps) {
  const [activeLiabilityId, setActiveLiabilityId] = useState<number | null>(null);

  // Fetch liabilities
  const { data: liabilities = [], isLoading } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Filter liabilities based on search term
  const filteredLiabilities = useMemo(() => {
    if (!searchTerm) return liabilities;
    return liabilities.filter(liability =>
      liability.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liability.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [liabilities, searchTerm]);

  // Set active liability to first liability if none selected
  const activeLiability = useMemo(() => {
    if (activeLiabilityId) {
      return filteredLiabilities.find(liability => liability.id === activeLiabilityId);
    }
    return filteredLiabilities[0] || null;
  }, [filteredLiabilities, activeLiabilityId]);

  // Add liability mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<Liabilities> => {
      const newLiability: InsertLiabilities = {
        category: "Enter details ...",
        description: "Enter details ...",
        currency: "ZAR",
        debtAmount: "R 0",
        peterLambie: "0%",
        victoriaLambie: "0%",
        juniorLambie: "0%",
        lambiesFamilyTrust: "0%",
        estate: "R 0",
        others: "R 0",
        client: "R 0",
        section: "BONDS",
        included: true
      };
      const response = await fetch('/api/liabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLiability),
      });
      if (!response.ok) throw new Error('Failed to add liability');
      return response.json();
    },
    onSuccess: (newLiability: Liabilities) => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      setActiveLiabilityId(newLiability.id);
      onAddLiability?.();
    },
  });

  // Delete liability mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/liabilities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      setActiveLiabilityId(null);
    },
  });

  const handleDeleteLiability = (id: number) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading liabilities...</div>;
  }

  if (filteredLiabilities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          {searchTerm ? 'No liabilities match your search.' : 'No liabilities yet.'}
        </p>
        <button
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Add Liability
        </button>
      </div>
    );
  }

  return (
    <div className="flex border-t border-neutral-200">
      {/* Left Sidebar - Preview Cards */}
      <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
        <div className="space-y-0">
          {filteredLiabilities.map((liability, index) => (
            <LiabilityPreviewCard
              key={liability.id}
              liability={liability}
              isActive={activeLiability?.id === liability.id}
              onClick={() => setActiveLiabilityId(liability.id)}
              isFirst={index === 0}
              isLast={index === filteredLiabilities.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Right Panel - Detail Form */}
      <div className="flex-1">
        {activeLiability ? (
          <LiabilityDetailForm
            liability={activeLiability}
            onDelete={handleDeleteLiability}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            Select a liability to view details
          </div>
        )}
      </div>
    </div>
  );
}