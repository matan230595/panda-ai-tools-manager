import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AIModelMetrics({ settings, tools }) {
  const models = [
    { id: 'gemini', name: 'Gemini', costPer1kTokens: 0.00075, usage: 2500, color: '#4285F4' },
    { id: 'groq', name: 'Groq', costPer1kTokens: 0.0001, usage: 5000, color: '#FF6B35' },
    { id: 'mistral', name: 'Mistral', costPer1kTokens: 0.00015, usage: 1800, color: '#FFB81C' },
    { id: 'claude', name: 'Claude 3', costPer1kTokens: 0.001, usage: 1200, color: '#662E9B' },
    { id: 'cohere', name: 'Cohere', costPer1kTokens: 0.0005, usage: 800, color: '#FF4500' }
  ];

  const modelCosts = models.map(m => ({
    name: m.name,
    cost: (m.usage * m.costPer1kTokens).toFixed(2),
    usage: m.usage,
    efficiency: (m.usage / m.costPer1kTokens).toFixed(0)
  }));

  const totalAPISpend = modelCosts.reduce((sum, m) => sum + parseFloat(m.cost), 0);
  const costDistribution = models.map(m => ({
    name: m.name,
    value: parseFloat((m.usage * m.costPer1kTokens).toFixed(2))
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              סה"כ שימוש ב-API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{models.reduce((sum, m) => sum + m.usage, 0).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">tokens בחודש</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              הוצאה חודשית
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₪{(totalAPISpend * 3.5).toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">~${totalAPISpend.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              דגם פעיל
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{settings?.preferredModel || 'Groq'}</div>
            <p className="text-xs text-gray-500 mt-1">ברירת מחדל</p>
          </CardContent>
        </Card>
      </div>

      {/* Model Costs Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>התפלגות עלויות דגמים</CardTitle>
          <CardDescription>עלות רכיבים ליחידה לפי דגם</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={costDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {models.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Usage by Model */}
      <Card>
        <CardHeader>
          <CardTitle>שימוש לפי דגם</CardTitle>
          <CardDescription>tokens וביעילות</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelCosts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="usage" fill="#8884d8" name="שימוש (tokens)" />
              <Bar yAxisId="right" dataKey="cost" fill="#82ca9d" name="עלות ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Details */}
      <Card>
        <CardHeader>
          <CardTitle>פרטי דגמים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {models.map(model => (
              <div key={model.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: model.color }}
                    />
                    <span className="font-semibold">{model.name}</span>
                  </div>
                  <Badge variant="outline">
                    ${(model.usage * model.costPer1kTokens).toFixed(2)}/חודש
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">שימוש</div>
                    <div className="font-semibold">{model.usage.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">עלות/1K tokens</div>
                    <div className="font-semibold">${model.costPer1kTokens}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">יעילות</div>
                    <div className="font-semibold">{(model.usage / model.costPer1kTokens).toFixed(0)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Tips */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
            <AlertCircle className="w-5 h-5" />
            טיפים לאופטימיזציה
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-800 dark:text-yellow-300 space-y-2">
          <p>✓ Groq הוא הטוב ביותר ליחס עלות-ביצועים</p>
          <p>✓ Claude מומלץ לכלים עם דרישות גבוהות</p>
          <p>✓ Mistral מצוין ליישומים עם תקציב מוגבל</p>
          <p>✓ שקול batch processing לעומסים גבוהים</p>
        </CardContent>
      </Card>
    </div>
  );
}