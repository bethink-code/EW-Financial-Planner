import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GaugeChart } from './charts/gauge-chart';

interface OverviewDashboardProps {
  data: {
    estatePosition: {
      provided: number;
      required: number;
      surplus: number;
      percentage: number;
    };
    dependantsPosition: {
      provided: number;
      required: number;
      surplus: number;
      percentage: number;
    };
    totalCapitalPosition: {
      provided: number;
      required: number;
      surplus: number;
      percentage: number;
    };
    incomePosition: {
      provided: number;
      required: number;
      surplus: number;
      percentage: number;
    };
  };
  chartType: string;
}

export function OverviewDashboard({ data, chartType }: OverviewDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('ZAR', 'R');
  };

  const positions = [
    {
      title: 'Estate position',
      data: data.estatePosition,
    },
    {
      title: 'Dependants position',
      data: data.dependantsPosition,
    },
    {
      title: 'Total capital position',
      data: data.totalCapitalPosition,
    },
    {
      title: 'Income position',
      data: data.incomePosition,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {positions.map((position) => (
        <Card key={position.title} className="h-80">
          <div className="h-full flex flex-col p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-center text-sm capitalize">{position.title}</h3>
            
            {/* Chart and Summary - Centered */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Compact Chart */}
              <div className="h-20 w-20 flex items-center justify-center mb-1">
                <GaugeChart
                  data={position.data}
                  title={position.title}
                  compact={true}
                />
              </div>
              
              {/* Compact Summary */}
              <div className="w-full space-y-1 text-xs">
                <div className="p-2 rounded text-center" style={{ backgroundColor: 'hsl(220, 14%, 96%)' }}>
                  <div className="text-xs" style={{ color: 'hsl(215, 14%, 34%)' }}>Provided</div>
                  <div className="text-sm font-bold" style={{ color: 'hsl(198, 99%, 29%)' }}>
                    {formatCurrency(position.data.provided)}
                  </div>
                </div>
                <div className="p-2 rounded text-center" style={{ backgroundColor: 'hsl(220, 14%, 96%)' }}>
                  <div className="text-xs" style={{ color: 'hsl(215, 14%, 34%)' }}>Required</div>
                  <div className="text-sm font-bold" style={{ color: 'hsl(220, 13%, 18%)' }}>
                    {formatCurrency(position.data.required)}
                  </div>
                </div>
                <div className="p-2 rounded text-center" style={{ backgroundColor: 'hsl(220, 14%, 96%)' }}>
                  <div className="text-xs" style={{ color: 'hsl(215, 14%, 34%)' }}>
                    {position.data.surplus >= 0 ? 'Surplus' : 'Deficit'}
                  </div>
                  <div className={`text-sm font-bold`} style={{ 
                    color: position.data.surplus >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'
                  }}>
                    {formatCurrency(Math.abs(position.data.surplus))}
                  </div>
                  <div className="text-xs" style={{ color: 'hsl(220, 9%, 46%)' }}>
                    {position.data.percentage.toFixed(1)}% Coverage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}