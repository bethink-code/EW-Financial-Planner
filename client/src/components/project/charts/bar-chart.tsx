import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Debug log to check data
  console.log('Bar chart data:', data);

  const chartData = [
    {
      name: 'Provided',
      value: Math.abs(data.provided || 0),
      fill: '#3B82F6' // Blue
    },
    {
      name: 'Required',
      value: Math.abs(data.required || 0),
      fill: '#EF4444' // Red
    },
    {
      name: 'Surplus',
      value: Math.abs(data.surplus || 0),
      fill: data.surplus >= 0 ? '#10B981' : '#EF4444' // Green for positive, Red for negative
    }
  ];

  console.log('Chart data:', chartData);

  return (
    <div className="w-full" style={{ width: '100%', height: '320px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 80,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), '']}
          />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}