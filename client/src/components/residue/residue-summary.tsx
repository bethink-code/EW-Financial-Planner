import { useQuery } from '@tanstack/react-query';
import { Residue } from '@shared/schema';

export function ResidueSummary() {
  const { data: residueItems = [] } = useQuery<Residue[]>({
    queryKey: ['/api/residue'],
  });

  const total = residueItems.reduce((sum, item) => {
    const percentage = parseFloat(item.percentage || '0');
    return sum + percentage;
  }, 0);

  return (
    <div className="summary-card">
      <div className="grid grid-cols-1 gap-6">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900">{total}%</div>
          <div className="text-sm text-gray-600">Total Percentage</div>
        </div>
      </div>
    </div>
  );
}