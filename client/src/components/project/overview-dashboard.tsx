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
    <div className="space-y-6">
      {/* Overview Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Position Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            {positions.map((position) => (
              <div key={position.title} className="text-center">
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">All positions show positive coverage</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Dependants position is well-funded at 309%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Estate has adequate liquidity for all obligations</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scenario Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="text-gray-600">
                The current financial plan provides robust coverage across all areas:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Estate liquidity is fully covered</li>
                <li>Dependants have significant surplus provisions</li>
                <li>Income replacement exceeds requirements</li>
              </ul>
              <p className="text-gray-600 pt-2">
                Use the individual tabs to explore detailed parameters and run scenarios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}