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
    <div className="grid grid-cols-4 gap-6">
      {positions.map((position) => (
        <Card key={position.title}>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">
                <GaugeChart data={position.data} title={position.title} compact />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 capitalize">{position.title}</h3>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provided:</span>
                    <span className="font-medium text-blue-700">{formatCurrency(position.data.provided)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required:</span>
                    <span className="font-medium text-gray-700">{formatCurrency(position.data.required)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-600">
                      {position.data.surplus >= 0 ? 'Surplus:' : 'Deficit:'}
                    </span>
                    <span className={`font-bold ${
                      position.data.surplus >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(position.data.surplus))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}