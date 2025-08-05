import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  title: string;
}

export function BarChart({ data, title }: BarChartProps) {
  const chartData = [
    {
      name: 'Capital',
      Provided: data.provided,
      Required: data.required,
      Surplus: Math.max(data.surplus, 0),
      Deficit: Math.max(-data.surplus, 0)
    }
  ];

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
          <p className="font-medium mb-2">{title}</p>
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
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis 
            stroke="#6b7280"
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="Provided" fill="#016991" name="Provided" />
          <Bar dataKey="Required" fill="#6b7280" name="Required" />
          {data.surplus >= 0 ? (
            <Bar dataKey="Surplus" fill="#10b981" name="Surplus" />
          ) : (
            <Bar dataKey="Deficit" fill="#ef4444" name="Deficit" />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}