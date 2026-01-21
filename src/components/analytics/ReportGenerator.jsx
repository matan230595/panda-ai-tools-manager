import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportGenerator({ tools, settings }) {
  const [reportConfig, setReportConfig] = useState({
    type: 'monthly',
    includeComparison: true,
    includeTrends: true,
    includeMetrics: true,
    includeRecommendations: true,
    format: 'pdf'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateMonthlyReport = () => {
    const now = new Date();
    return {
      title: `דוח חודשי - ${now.toLocaleDateString('he-IL')}`,
      month: now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }),
      generated: now.toISOString(),
      summary: {
        totalTools: tools.length,
        activeSubscriptions: tools.filter(t => t.hasSubscription).length,
        monthlySpending: tools.reduce((sum, t) => sum + (t.priceILS || 0), 0),
        topCategory: [...tools].sort((a, b) => 
          tools.filter(t => t.category === b.category).length - 
          tools.filter(t => t.category === a.category).length
        )[0]?.category || 'N/A'
      },
      toolsDetails: tools.map(t => ({
        name: t.name,
        category: t.category,
        price: t.priceILS,
        rating: t.rating,
        popularity: t.popularity,
        hasSubscription: t.hasSubscription,
        isFavorite: t.isFavorite
      })),
      metrics: {
        averageRating: (tools.reduce((sum, t) => sum + (t.rating || 0), 0) / tools.length).toFixed(2),
        averagePrice: (tools.reduce((sum, t) => sum + (t.priceILS || 0), 0) / tools.length).toFixed(2),
        freeTools: tools.filter(t => t.priceILS === 0).length
      }
    };
  };

  const exportToJSON = (data) => {
    setIsGenerating(true);
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `דוח-כלי-AI-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success('דוח JSON יוצא בהצלחה! 📄');
    } catch (error) {
      toast.error('שגיאה בייצוא דוח');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = () => {
    const reportData = generateMonthlyReport();
    exportToJSON(reportData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          יצרן דוחות אוטומטי
        </CardTitle>
        <CardDescription>צור ויצא דוחות מותאמים אישית</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">סוג דוח</label>
            <Select value={reportConfig.type} onValueChange={(val) => 
              setReportConfig({ ...reportConfig, type: val })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">חודשי</SelectItem>
                <SelectItem value="quarterly">רבעוני</SelectItem>
                <SelectItem value="annual">שנתי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">פורמט</label>
            <Select value={reportConfig.format} onValueChange={(val) => 
              setReportConfig({ ...reportConfig, format: val })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={reportConfig.includeComparison}
              onCheckedChange={(val) => 
                setReportConfig({ ...reportConfig, includeComparison: val })
              }
            />
            <span className="text-sm">הוסף ניתוח השוואתי</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={reportConfig.includeTrends}
              onCheckedChange={(val) => 
                setReportConfig({ ...reportConfig, includeTrends: val })
              }
            />
            <span className="text-sm">הוסף מגמות שימוש</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={reportConfig.includeMetrics}
              onCheckedChange={(val) => 
                setReportConfig({ ...reportConfig, includeMetrics: val })
              }
            />
            <span className="text-sm">הוסף מטריקות API</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={reportConfig.includeRecommendations}
              onCheckedChange={(val) => 
                setReportConfig({ ...reportConfig, includeRecommendations: val })
              }
            />
            <span className="text-sm">הוסף המלצות</span>
          </label>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              יוצר דוח...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 ml-2" />
              צור וייצא דוח
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}