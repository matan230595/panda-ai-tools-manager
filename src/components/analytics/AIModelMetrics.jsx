import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AIModelMetrics({ settings, tools }) {
  const models = [
    // חינמיים (מומלץ!)
    { id: 'ollama', name: 'Ollama (חינמי)', costPer1kTokens: 0, usage: 0, color: '#10b981', category: 'free' },
    { id: 'localaib', name: 'LocalAI (חינמי)', costPer1kTokens: 0, usage: 0, color: '#059669', category: 'free' },
    // בתשלום
    { id: 'groq', name: 'Groq', costPer1kTokens: 0.0001, usage: 5000, color: '#FF6B35', category: 'paid' },
    { id: 'gemini', name: 'Gemini', costPer1kTokens: 0.00075, usage: 2500, color: '#4285F4', category: 'paid' },
    { id: 'mistral', name: 'Mistral', costPer1kTokens: 0.00015, usage: 1800, color: '#FFB81C', category: 'paid' },
    { id: 'claude', name: 'Claude 3.5 Sonnet', costPer1kTokens: 0.003, usage: 1200, color: '#662E9B', category: 'paid' },
    { id: 'openai', name: 'GPT-4o', costPer1kTokens: 0.005, usage: 800, color: '#00D084', category: 'paid' },
    { id: 'cohere', name: 'Cohere Command R+', costPer1kTokens: 0.0005, usage: 600, color: '#FF4500', category: 'paid' }
  ];

  const modelCosts = models.map(m => ({
    name: m.name,
    cost: (m.usage * m.costPer1kTokens).toFixed(2),
    usage: m.usage,
    efficiency: m.costPer1kTokens === 0 ? '∞' : (m.usage / m.costPer1kTokens).toFixed(0),
    category: m.category
  }));

  const totalAPISpend = modelCosts.reduce((sum, m) => sum + parseFloat(m.cost), 0);
  const freeModelsUsage = models.filter(m => m.category === 'free').reduce((sum, m) => sum + m.usage, 0);
  const costDistribution = models.filter(m => m.costPer1kTokens > 0).map(m => ({
    name: m.name,
    value: parseFloat((m.usage * m.costPer1kTokens).toFixed(2))
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
              <Zap className="w-4 h-4" />
              שימוש חינמי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{freeModelsUsage.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">tokens בחודש (0₪)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              סה"כ שימוש
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
              <DollarSign className="w-4 h-4 text-orange-500" />
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
            <div className="text-3xl font-bold">{settings?.preferredModel || 'groq'}</div>
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

      {/* Model Details - Separated by Category */}
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">🆓 דגמים חינמיים (מומלץ!)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {models.filter(m => m.category === 'free').map(model => (
                <div key={model.id} className="p-4 rounded-lg border border-green-300 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }} />
                      <span className="font-semibold">{model.name}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      0₪/חודש
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">רץ מקומית - אפס עלויות</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💳 דגמים בתשלום</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {models.filter(m => m.category === 'paid').map(model => (
                <div key={model.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }} />
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
                      <div className="text-gray-600 dark:text-gray-400">עלות/1K</div>
                      <div className="font-semibold">${model.costPer1kTokens}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">יעילות</div>
                      <div className="font-semibold">{model.usage > 0 ? (model.usage / model.costPer1kTokens).toFixed(0) : '∞'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Optimization Tips */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <AlertCircle className="w-5 h-5" />
            טיפים לחיסכון קרדיטים
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-emerald-800 dark:text-emerald-300 space-y-3">
          <p>✅ <strong>Ollama + LocalAI</strong> - חינמי 100%, אפס עלויות!</p>
          <p>✓ Groq הוא הטוב ביותר ליחס עלות-ביצועים בין הבתשלום</p>
          <p>✓ Claude 3.5 Sonnet מומלץ לכלים עם דרישות גבוהות</p>
          <p>✓ GPT-4o טוב לראיית חזון והשוואה עם מודלים אחרים</p>
          <p>✓ Mistral מצוין ליישומים בתקציב מוגבל</p>
          <p>✓ הפעל מודלים מקומיים בשעות שיא לחיסכון!</p>
        </CardContent>
      </Card>
    </div>
  );
}