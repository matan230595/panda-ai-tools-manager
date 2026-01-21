import React from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function ComparativeAnalysis({ tools }) {
  const priceVsRating = tools
    .filter(t => t.priceILS > 0 && t.rating > 0)
    .map(t => ({
      name: t.name,
      price: t.priceILS,
      rating: t.rating,
      popularity: t.popularity || 0
    }));

  const categoryComparison = tools.reduce((acc, tool) => {
    const existing = acc.find(c => c.category === tool.category);
    if (existing) {
      existing.tools += 1;
      existing.avgRating = (existing.avgRating + (tool.rating || 0)) / 2;
      existing.totalPrice += tool.priceILS || 0;
    } else {
      acc.push({
        category: tool.category,
        tools: 1,
        avgRating: tool.rating || 0,
        totalPrice: tool.priceILS || 0
      });
    }
    return acc;
  }, []);

  const priceDistribution = [
    { range: 'חינם', count: tools.filter(t => t.priceILS === 0).length },
    { range: '₪0-100', count: tools.filter(t => t.priceILS > 0 && t.priceILS <= 100).length },
    { range: '₪100-500', count: tools.filter(t => t.priceILS > 100 && t.priceILS <= 500).length },
    { range: '₪500+', count: tools.filter(t => t.priceILS > 500).length }
  ];

  return (
    <div className="space-y-6">
      {/* Price vs Rating Scatter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            ניתוח מחיר מול דירוג
          </CardTitle>
          <CardDescription>התפלגות כלים לפי עלות וקיבולת</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price" name="מחיר חודשי (₪)" />
              <YAxis dataKey="rating" name="דירוג" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter
                name="כלים"
                data={priceVsRating}
                fill="#8884d8"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ניתוח לפי קטגוריה</CardTitle>
          <CardDescription>השוואת דירוג ועלות בקטגוריות</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="tools" fill="#8884d8" name="מספר כלים" />
              <Bar yAxisId="right" dataKey="avgRating" fill="#82ca9d" name="דירוג ממוצע" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Price Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>התפלגות מחירים</CardTitle>
          <CardDescription>כלים לפי טווח מחיר</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc658" name="מספר כלים" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Value Score Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>מטריצת ערך (Value Score)</CardTitle>
          <CardDescription>דירוג ÷ מחיר = ערך הטוב ביותר</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tools
              .filter(t => t.priceILS > 0 && t.rating > 0)
              .map(tool => {
                const valueScore = (tool.rating / tool.priceILS) * 100;
                return (
                  <div key={tool.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{tool.name}</span>
                      <span className={`text-sm font-bold ${valueScore > 50 ? 'text-green-600' : valueScore > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {valueScore.toFixed(1)} ⭐
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min(valueScore / 100 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}