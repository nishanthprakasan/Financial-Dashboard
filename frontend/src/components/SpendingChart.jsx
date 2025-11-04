import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

const ALL_CATEGORIES = [
  "Food & Dining",
  "Transportation", 
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Other"
];

export function SpendingChart({ data }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data) {
      const existingDataMap = {};
      data.forEach(item => {
        existingDataMap[item.category] = item;
      });

      const mergedData = ALL_CATEGORIES.map(category => {
        const existingItem = existingDataMap[category];
        if (existingItem) {
          return {
            category: existingItem.category,
            amount: Math.abs(existingItem.amount),
            percentage: existingItem.percentage
          };
        } else {
          return {
            category: category,
            amount: 0,
            percentage: 0
          };
        }
      });

      setChartData(mergedData);
    }
  }, [data]);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading spending data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="category" 
              stroke="#6b7280" 
              angle={-45} 
              textAnchor="end" 
              height={100} 
            />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              formatter={(value) => `$${value.toLocaleString()}`}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Bar 
              dataKey="amount" 
              fill="#6366f1" 
              radius={[8, 8, 0, 0]} 
              name="Amount"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}