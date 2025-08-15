import { GaugeChart } from './charts/gauge-chart';
import { ProjectBarChart } from './charts/bar-chart';
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
        return <ProjectBarChart data={data} title={title} />;
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
    <div className="flex flex-col p-6">
      {/* Chart and Summary - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Chart */}
        <div className="h-80 flex items-center justify-center mt-20">
          {renderChart()}
        </div>

        {/* Unified Summary Statistics */}
        <div className="-mt-20 border-2 border-green-500">
          <UnifiedSummary data={data} />
        </div>
      </div>
    </div>
  );
}