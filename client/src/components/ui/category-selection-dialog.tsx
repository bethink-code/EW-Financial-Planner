import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CategorySelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  title: string;
  categories: { value: string; label: string }[];
}

export function CategorySelectionDialog({
  isOpen,
  onClose,
  onSelectCategory,
  title,
  categories
}: CategorySelectionDialogProps) {
  const handleCategorySelect = (category: string) => {
    onSelectCategory(category);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <p className="text-sm text-neutral-600 mb-4">
            Select the category for the new item:
          </p>
          <div className="grid gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant="outline"
                className="justify-start h-12 text-left"
                onClick={() => handleCategorySelect(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}