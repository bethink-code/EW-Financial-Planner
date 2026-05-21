import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { HybridSidebar } from "@/components/common/hybrid-sidebar";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { CategorySelectionDialog } from "@/components/ui/category-selection-dialog";
import {
  AssetsLiabilitiesToggle,
  type AssetsLiabilitiesMode,
} from "@/components/assets-liabilities/assets-liabilities-toggle";
import { AssetDetailForm } from "@/components/assets/asset-detail-form";
import { LiabilityDetailForm } from "@/components/liabilities/liability-detail-form";
import type { Assets } from "@shared/assets-schema";
import type { Liabilities } from "@shared/liabilities-schema";

const ASSET_CATEGORIES = [
  { value: 'PROPERTY', label: 'Property' },
  { value: 'VEHICLES', label: 'Vehicles' },
  { value: 'INVESTMENTS', label: 'Investments' },
  { value: 'CASH', label: 'Cash & Bank' },
  { value: 'PERSONAL', label: 'Personal Assets' },
  { value: 'BUSINESS', label: 'Business Assets' },
  { value: 'OTHER', label: 'Other Assets' },
];

const LIABILITY_CATEGORIES = [
  { value: 'BONDS', label: 'Home Bond' },
  { value: 'VEHICLE_FINANCE', label: 'Vehicle Finance' },
  { value: 'CREDIT_CARDS', label: 'Credit Cards' },
  { value: 'PERSONAL_LOANS', label: 'Personal Loans' },
  { value: 'BUSINESS_LOANS', label: 'Business Loans' },
  { value: 'SHORT_TERM_DEBT', label: 'Short Term Debt' },
  { value: 'OTHER_DEBT', label: 'Other Debt' },
];

const parseCurrency = (s?: string | null): number =>
  parseFloat((s || '').replace(/[^\d.-]/g, '')) || 0;

const formatRand = (n: number): string => `R ${n.toLocaleString()}`;

export default function AssetsLiabilitiesPage() {
  const [mode, setMode] = useState<AssetsLiabilitiesMode>('assets');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [selectedLiabilityId, setSelectedLiabilityId] = useState<number | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const { data: assets = [] } = useQuery<Assets[]>({ queryKey: ['/api/assets'] });
  const { data: liabilities = [] } = useQuery<Liabilities[]>({ queryKey: ['/api/liabilities'] });

  // Auto-select the first item of each dataset when data loads.
  useEffect(() => {
    if (assets.length > 0 && selectedAssetId === null) setSelectedAssetId(assets[0].id);
  }, [assets, selectedAssetId]);
  useEffect(() => {
    if (liabilities.length > 0 && selectedLiabilityId === null) setSelectedLiabilityId(liabilities[0].id);
  }, [liabilities, selectedLiabilityId]);

  // NET = total assets − total liabilities. Constant across both toggle states.
  const netTotal = useMemo(() => {
    const totalAssets = assets
      .filter(a => a.included)
      .reduce((sum, a) => sum + parseCurrency(a.marketValue), 0);
    const totalLiabilities = liabilities
      .filter(l => l.included)
      .reduce((sum, l) => sum + parseCurrency(l.debtAmount), 0);
    return formatRand(totalAssets - totalLiabilities);
  }, [assets, liabilities]);

  // Mutations — keep one per dataset; the unified page just routes the call
  // through the right mutation based on mode.
  const addAssetMutation = useMutation({
    mutationFn: (category: string) =>
      apiRequest('POST', '/api/assets', { section: category }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/assets'] }),
  });
  const addLiabilityMutation = useMutation({
    mutationFn: (category: string) =>
      apiRequest('POST', '/api/liabilities', { category, section: category }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] }),
  });
  const deleteAssetMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/assets/${id}`),
    onSuccess: (_, id) => {
      if (id === selectedAssetId) setSelectedAssetId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    },
  });
  const deleteLiabilityMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/liabilities/${id}`),
    onSuccess: (_, id) => {
      if (id === selectedLiabilityId) setSelectedLiabilityId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
  });

  const handleAdd = useCallback(() => {
    setShowCategoryDialog(true);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    if (mode === 'assets') addAssetMutation.mutate(category);
    else addLiabilityMutation.mutate(category);
  }, [mode, addAssetMutation, addLiabilityMutation]);

  const handleDelete = useCallback((id: number) => {
    const label = mode === 'assets' ? 'asset' : 'liability';
    if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) return;
    if (mode === 'assets') deleteAssetMutation.mutate(id);
    else deleteLiabilityMutation.mutate(id);
  }, [mode, deleteAssetMutation, deleteLiabilityMutation]);

  // === Per-mode derivations ===

  const activeItems: (Assets | Liabilities)[] = mode === 'assets' ? assets : liabilities;
  const selectedItemId = mode === 'assets' ? selectedAssetId : selectedLiabilityId;
  const setSelectedItemId = mode === 'assets' ? setSelectedAssetId : setSelectedLiabilityId;

  const selectedAsset = selectedAssetId ? assets.find(a => a.id === selectedAssetId) ?? null : null;
  const selectedLiability = selectedLiabilityId ? liabilities.find(l => l.id === selectedLiabilityId) ?? null : null;
  const selectedTitle = mode === 'assets'
    ? selectedAsset?.description
    : selectedLiability?.description;

  // Category breakdown for the summary band — count + total per category.
  const categoryTiles = useMemo(() => {
    const categories = mode === 'assets' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
    const buckets = new Map<string, { total: number; count: number }>();
    for (const cat of categories) buckets.set(cat.value, { total: 0, count: 0 });
    if (mode === 'assets') {
      for (const a of assets) {
        if (!a.included) continue;
        const b = buckets.get(a.section);
        if (!b) continue;
        b.total += parseCurrency(a.marketValue);
        b.count += 1;
      }
    } else {
      for (const l of liabilities) {
        if (!l.included) continue;
        const b = buckets.get(l.section);
        if (!b) continue;
        b.total += parseCurrency(l.debtAmount);
        b.count += 1;
      }
    }
    return categories
      .map(cat => ({ ...cat, ...buckets.get(cat.value)! }))
      .filter(c => c.count > 0);
  }, [mode, assets, liabilities]);

  const titleForAsset = (a: Assets) =>
    a.description?.trim() || `Asset #${a.id}`;
  const titleForLiability = (l: Liabilities) =>
    l.description?.trim() || `Liability #${l.id}`;

  const summaryCards = mode === 'assets' ? (
    <HybridSidebar
      items={assets}
      selectedId={selectedAssetId}
      onSelect={setSelectedAssetId}
      getId={(a) => a.id}
      getTitle={titleForAsset}
      renderActive={(a) => ({
        subtitle: a.section ? `Category: ${a.section}` : 'No category',
        primaryValue: a.marketValue || 'R 0',
      })}
    />
  ) : (
    <HybridSidebar
      items={liabilities}
      selectedId={selectedLiabilityId}
      onSelect={setSelectedLiabilityId}
      getId={(l) => l.id}
      getTitle={titleForLiability}
      renderActive={(l) => ({
        subtitle: l.section ? `Category: ${l.section}` : 'No category',
        primaryValue: l.debtAmount || 'R 0',
      })}
    />
  );

  const detailForms = mode === 'assets'
    ? (selectedAsset ? <AssetDetailForm asset={selectedAsset} /> : null)
    : (selectedLiability ? <LiabilityDetailForm liability={selectedLiability} /> : null);

  const addLabel = mode === 'assets' ? 'Add Asset' : 'Add Liability';
  const dialogTitle = mode === 'assets' ? 'Select Asset Category' : 'Select Liability Category';
  const dialogCategories = mode === 'assets' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
  const emptyMessage = mode === 'assets'
    ? "No assets yet. Click 'Add Asset' to create your first asset."
    : "No liabilities yet. Click 'Add Liability' to create your first liability.";

  const isUpdating =
    deleteAssetMutation.isPending ||
    deleteLiabilityMutation.isPending ||
    addAssetMutation.isPending ||
    addLiabilityMutation.isPending;

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <HybridViewWrapper
          summary={
            <SummaryBand
              firstSlot={
                <AssetsLiabilitiesToggle
                  mode={mode}
                  onChange={setMode}
                  netTotal={netTotal}
                />
              }
            >
              {categoryTiles.map(c => (
                <SummaryTile
                  key={c.value}
                  label={c.label}
                  value={formatRand(c.total)}
                  subValue={`${c.count} ${c.count === 1 ? 'item' : 'items'}`}
                />
              ))}
            </SummaryBand>
          }
          header={
            <HybridHeaderBar
              add={{ label: addLabel, onClick: handleAdd }}
              title={selectedTitle}
              emptyTitle={
                selectedItemId
                  ? mode === 'assets' ? 'Untitled Asset' : 'Untitled Liability'
                  : undefined
              }
              onDelete={selectedItemId ? () => handleDelete(selectedItemId) : undefined}
              disabled={isUpdating}
            />
          }
          summaryCards={summaryCards}
          detailForms={detailForms}
          isEmpty={activeItems.length === 0}
          emptyStateMessage={emptyMessage}
        />

        <CategorySelectionDialog
          isOpen={showCategoryDialog}
          onClose={() => setShowCategoryDialog(false)}
          onSelectCategory={handleCategorySelect}
          title={dialogTitle}
          categories={dialogCategories}
        />
      </div>
    </div>
  );
}
