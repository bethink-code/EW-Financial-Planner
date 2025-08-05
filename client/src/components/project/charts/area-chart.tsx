import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AreaChartProps {
  data: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  title: string;
}

export function AreaChart({ data, title }: AreaChartProps) {
  // Generate cumulative projection data
  const generateCumulativeData = () => {
    const years = [];
    const growthRate = 0.06; // 6% annual growth
    const inflationRate = 0.04; // 4% annual inflation
    
    for (let year = 0; year <= 15; year++) {
      const providedProjected = data.provided * Math.pow(1 + growthRate, year);
      const requiredProjected = data.required * Math.pow(1 + inflationRate, year);
      const surplusProjected = providedProjected - requiredProjected;
      
      years.push({
        year: year,
        'Provided Capital': providedProjected,
        'Required Capital': requiredProjected,
        'Surplus': Math.max(surplusProjected, 0),
        'Total Coverage': providedProjected
      });
    }
    
    return years;
  };

  const chartData = generateCumulativeData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('ZAR', 'R');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium text-gray-900">{title} - Cumulative Coverage</h3>
        <p className="text-sm text-gray-600">15-year projection showing capital adequacy over time</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <RechartsAreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="year" 
            stroke="#6b7280"
            label={{ value: 'Years from now', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            stroke="#6b7280"
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Base required capital area */}
          <Area
            type="monotone"
            dataKey="Required Capital"
            stackId="1"
            stroke="#6b7280"
            fill="#9ca3af"
            fillOpacity={0.6}
          />
          
          {/* Surplus area on top */}
          <Area
            type="monotone"
            dataKey="Surplus"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.8}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}