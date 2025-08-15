interface BarChartProps {
  data: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  title: string;
}

export function ProjectBarChart({ data, title }: BarChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('ZAR', 'R');
  };

  const maxValue = Math.max(data.provided, data.required, Math.abs(data.surplus));
  const scale = 180 / maxValue; // 180px max bar height

  const bars = [
    { name: 'Provided', value: data.provided, color: 'var(--chart-primary-blue)' },
    { name: 'Required', value: data.required, color: 'var(--chart-primary-orange)' },
    { name: 'Surplus', value: Math.abs(data.surplus), color: data.surplus >= 0 ? 'var(--chart-primary-green)' : 'var(--chart-primary-pink)' }
  ];

  return (
    <div className="flex items-end justify-center space-x-8">
      {bars.map((bar, index) => (
        <div key={index} className="flex flex-col items-center bar-chart-item">
          <div 
            className="text-xs text-gray-600 mb-2 text-center bar-chart-label"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {formatCurrency(bar.value)}
          </div>
          <div 
            className="w-16 rounded-t-sm bar-chart-bar"
            style={{ 
              height: `${Math.max(bar.value * scale, 10)}px`,
              backgroundColor: bar.color,
              minHeight: '10px',
              animationDelay: `${index * 0.1}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}