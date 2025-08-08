import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Assets, InsertAssets } from '@shared/assets-schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { AssetPreviewCard } from './asset-preview-card';
import { AssetDetailForm } from './asset-detail-form';

interface AssetHybridTableProps {
  searchTerm?: string;
  onAddAsset?: () => void;
}

export function AssetHybridTable({ searchTerm, onAddAsset }: AssetHybridTableProps) {
  const [activeAssetId, setActiveAssetId] = useState<number | null>(null);

  // Fetch assets
  const { data: assets = [], isLoading } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Filter assets based on search term
  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assets;
    return assets.filter(asset =>
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.section?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

  // Set active asset to first asset if none selected
  const activeAsset = useMemo(() => {
    if (activeAssetId) {
      return filteredAssets.find(asset => asset.id === activeAssetId);
    }
    return filteredAssets[0] || null;
  }, [filteredAssets, activeAssetId]);

  // Add asset mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<Assets> => {
      const newAsset: InsertAssets = {
        description: "",
        marketValue: "R 0",
        entityOwnership: "{}",
        estate: "R 0",
        others: "R 0",
        client: "R 0",
        section: "PROPERTY",
        included: true
      };
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset),
      });
      if (!response.ok) throw new Error('Failed to add asset');
      return response.json();
    },
    onSuccess: (newAsset: Assets) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      setActiveAssetId(newAsset.id);
      onAddAsset?.();
    },
  });

  // Delete asset mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      setActiveAssetId(null);
    },
  });

  const handleDeleteAsset = (id: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading assets...</div>;
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          {searchTerm ? 'No assets match your search.' : 'No assets yet.'}
        </p>
        <button
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Add Asset
        </button>
      </div>
    );
  }

  return (
    <div className="flex border-t border-neutral-200">
      {/* Left Sidebar - Preview Cards */}
      <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
        <div className="space-y-0">
          {filteredAssets.map((asset, index) => (
            <AssetPreviewCard
              key={asset.id}
              asset={asset}
              isActive={activeAsset?.id === asset.id}
              onClick={() => setActiveAssetId(asset.id)}
              isFirst={index === 0}
              isLast={index === filteredAssets.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Right Panel - Detail Form */}
      <div className="flex-1">
        {activeAsset ? (
          <AssetDetailForm
            asset={activeAsset}
            onDelete={handleDeleteAsset}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            Select an asset to view details
          </div>
        )}
      </div>
    </div>
  );
}