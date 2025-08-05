import { Card, CardContent } from '@/components/ui/card';

interface UnifiedSummaryProps {
  data: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
}

export function UnifiedSummary({ data }: UnifiedSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('ZAR', 'R');
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Provided</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(data.provided)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Required</div>
            <div className="text-lg font-bold text-gray-700">{formatCurrency(data.required)}</div>
          </div>
          <div className={`p-3 rounded-lg ${
            data.surplus >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="text-xs text-gray-600 mb-1">
              {data.surplus >= 0 ? 'Surplus' : 'Deficit'}
            </div>
            <div className={`text-lg font-bold ${
              data.surplus >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatCurrency(Math.abs(data.surplus))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.percentage.toFixed(1)}% Coverage
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}