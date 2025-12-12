import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CategoryChart({ tools }) {
  const categoryCount = tools.reduce((acc, tool) => {
    const cat = tool.category || 'אחר';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(categoryCount)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
    '#06b6d4', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'
  ];

  return (
    <div className="glass-effect rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">
        כלים לפי קטגוריה
      </h3>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis tick={{ fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                direction: 'rtl'
              }}
              labelStyle={{ color: '#111827', fontWeight: 'bold' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          אין נתונים להצגה
        </div>
      )}
    </div>
  );
}