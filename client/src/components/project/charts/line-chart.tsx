import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  title: string;
}

export function LineChart({ data, title }: LineChartProps) {
  // Generate projection data over time
  const generateProjectionData = () => {
    const years = [];
    const growthRate = 0.06; // 6% annual growth
    const inflationRate = 0.04; // 4% annual inflation
    
    for (let year = 0; year <= 20; year++) {
      const providedProjected = data.provided * Math.pow(1 + growthRate, year);
      const requiredProjected = data.required * Math.pow(1 + inflationRate, year);
      
      years.push({
        year: year,
        Provided: providedProjected,
        Required: requiredProjected,
        Surplus: providedProjected - requiredProjected
      });
    }
    
    return years;
  };

  const chartData = generateProjectionData();

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
        <h3 className="text-lg font-medium text-gray-900">{title} - 20 Year Projection</h3>
        <p className="text-sm text-gray-600">Assuming 6% growth on provided capital and 4% inflation on requirements</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <RechartsLineChart
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
          <Line 
            type="monotone" 
            dataKey="Provided" 
            stroke="#016991" 
            strokeWidth={3}
            name="Provided Capital"
            dot={{ fill: '#016991', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="Required" 
            stroke="#6b7280" 
            strokeWidth={3}
            name="Required Capital"
            dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="Surplus" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Surplus"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}