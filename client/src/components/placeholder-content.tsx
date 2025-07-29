import React from "react";

interface PlaceholderContentProps {
  title: string;
}

export function PlaceholderContent({ title }: PlaceholderContentProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600">Content to come</p>
      </div>
    </div>
  );
}