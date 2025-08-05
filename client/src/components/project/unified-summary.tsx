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
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'hsl(220, 14%, 96%)' }}>
            <div className="text-xs mb-1" style={{ color: 'hsl(215, 14%, 34%)' }}>Provided</div>
            <div className="text-lg font-bold" style={{ color: 'hsl(198, 99%, 29%)' }}>{formatCurrency(data.provided)}</div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'hsl(220, 14%, 96%)' }}>
            <div className="text-xs mb-1" style={{ color: 'hsl(215, 14%, 34%)' }}>Required</div>
            <div className="text-lg font-bold" style={{ color: 'hsl(220, 13%, 18%)' }}>{formatCurrency(data.required)}</div>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'hsl(220, 14%, 96%)' }}>
            <div className="text-xs mb-1" style={{ color: 'hsl(215, 14%, 34%)' }}>
              {data.surplus >= 0 ? 'Surplus' : 'Deficit'}
            </div>
            <div className="text-lg font-bold" style={{ 
              color: data.surplus >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'
            }}>
              {formatCurrency(Math.abs(data.surplus))}
            </div>
            <div className="text-xs mt-1" style={{ color: 'hsl(220, 9%, 46%)' }}>
              {data.percentage.toFixed(1)}% Coverage
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}