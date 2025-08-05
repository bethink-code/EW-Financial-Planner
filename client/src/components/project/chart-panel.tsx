import { GaugeChart } from './charts/gauge-chart';
import { UnifiedSummary } from './unified-summary';

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      {/* Chart and Summary - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Chart */}
        <div className="h-64 flex items-center justify-center">
          {renderChart()}
        </div>

        {/* Unified Summary Statistics */}
        <div className="-mt-4">
          <UnifiedSummary data={data} />
        </div>
      </div>
    </div>
  );
}