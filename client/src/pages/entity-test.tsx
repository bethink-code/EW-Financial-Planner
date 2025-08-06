import React, { useState } from 'react';
import { EntitySelector, EntityDisplay } from "@/components/ui/entity-selector";
import { EntityMultiSelector } from "@/components/ui/entity-multi-selector";

export default function EntityTestPage() {
  const [selectedEntityId, setSelectedEntityId] = useState<number>(0);
  const [multiEntityIds, setMultiEntityIds] = useState<number[]>([0]);

  const handleAddEntity = () => {
    setMultiEntityIds([...multiEntityIds, 0]);
  };

  const handleRemoveEntity = (index: number) => {
    const newIds = [...multiEntityIds];
    newIds.splice(index, 1);
    setMultiEntityIds(newIds);
  };

  const handleEntityChange = (index: number, entityId: number) => {
    const newIds = [...multiEntityIds];
    newIds[index] = entityId;
    setMultiEntityIds(newIds);
  };

  return (
    <div className="px-6 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Entity Component Testing</h1>
        
        <div className="grid gap-8">
          {/* Single Entity Selector */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Single Entity Selector</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Entity:</label>
                <EntitySelector
                  value={selectedEntityId}
                  onChange={setSelectedEntityId}
                  placeholder="Choose an entity..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Selected Entity Display:</label>
                {selectedEntityId > 0 ? (
                  <EntityDisplay entityId={selectedEntityId} />
                ) : (
                  <span className="text-gray-500 italic">No entity selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Multi Entity Selector */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Multi Entity Selector</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Selector Mode:</label>
                <EntityMultiSelector
                  entityIds={multiEntityIds}
                  onAdd={handleAddEntity}
                  onRemove={handleRemoveEntity}
                  onChange={handleEntityChange}
                  showDisplayMode={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Display Mode:</label>
                <EntityMultiSelector
                  entityIds={multiEntityIds}
                  onAdd={handleAddEntity}
                  onRemove={handleRemoveEntity}
                  onChange={handleEntityChange}
                  showDisplayMode={true}
                />
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Debug Info:</h3>
            <div className="text-sm space-y-1">
              <div>Selected Entity ID: {selectedEntityId}</div>
              <div>Multi Entity IDs: [{multiEntityIds.join(', ')}]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}