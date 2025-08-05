import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GaugeChart } from './charts/gauge-chart';

interface ChartPanelProps {
  title: string;
  data: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  chartType: string;
  description?: string;
}

export function ChartPanel({ title, data, chartType, description }: ChartPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('ZAR', 'R');
  };

  const renderChart = () => {
    switch (chartType) {
      case 'gauge':
        return <GaugeChart data={data} title={title} />;
      case 'bar':
        return <div className="flex items-center justify-center h-64 text-gray-500">Bar Chart - Coming Soon</div>;
      case 'line':
        return <div className="flex items-center justify-center h-64 text-gray-500">Line Chart - Coming Soon</div>;
      case 'pie':
        return <div className="flex items-center justify-center h-64 text-gray-500">Pie Chart - Coming Soon</div>;
      case 'area':
        return <div className="flex items-center justify-center h-64 text-gray-500">Area Chart - Coming Soon</div>;
      default:
        return <GaugeChart data={data} title={title} />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          {renderChart()}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Provided</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(data.provided)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Required</div>
            <div className="text-lg font-bold text-gray-700">{formatCurrency(data.required)}</div>
          </div>
        </div>

        {/* Surplus/Deficit */}
        <div className={`p-4 rounded-lg text-center ${
          data.surplus >= 0 ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="text-sm text-gray-600 mb-1">
            {data.surplus >= 0 ? 'Surplus' : 'Deficit'}
          </div>
          <div className={`text-xl font-bold ${
            data.surplus >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatCurrency(Math.abs(data.surplus))}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {data.percentage.toFixed(1)}% Coverage
          </div>
        </div>
      </CardContent>
    </Card>
  );
}