import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  data: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  title: string;
  compact?: boolean;
}

export function GaugeChart({ data, title, compact = false }: GaugeChartProps) {
  // Calculate the percentage for the gauge (capped at 200% for visual purposes)
  const percentage = Math.min(data.percentage, 200);
  
  // Create data for the gauge chart using Elite Wealth brand colors
  const chartData = [
    { name: 'Covered', value: percentage, fill: 'hsl(198, 99%, 29%)' }, // Primary brand blue
    { name: 'Remaining', value: 200 - percentage, fill: 'hsl(220, 13%, 91%)' } // Neutral 200
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('ZAR', 'R');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className={compact ? "w-32 h-32" : "w-64 h-64"} style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={compact ? "60%" : "70%"}
              outerRadius={compact ? "90%" : "90%"}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: '20%' }}
        >
          <div className={`font-bold ${compact ? 'text-lg' : 'text-2xl'}`} style={{ color: 'hsl(220, 13%, 18%)' }}>
            {data.percentage.toFixed(1)}%
          </div>
          {!compact && (
            <>
              <div className="text-sm font-medium mt-1" style={{ color: 'hsl(198, 99%, 29%)' }}>
                Provided: {formatCurrency(data.provided)}
              </div>
              <div className="text-sm" style={{ color: 'hsl(215, 14%, 34%)' }}>
                Required: {formatCurrency(data.required)}
              </div>
              <div className={`text-sm font-medium mt-2`} style={{ 
                color: data.surplus >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'
              }}>
                {data.surplus >= 0 ? 'Surplus' : 'Deficit'}: {formatCurrency(Math.abs(data.surplus))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {compact && (
        <div className="text-center mt-2">
          <div className="text-xs text-gray-600">
            Allocated to dependants: {formatCurrency(data.surplus)}
          </div>
        </div>
      )}
    </div>
  );
}