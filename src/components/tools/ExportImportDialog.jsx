import React, { useState } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle, Loader2, Sheet, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const toolExtractionSchema = {
  type: 'object',
  properties: {
    tools: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          pricing: { type: 'string' },
          subscriptionType: { type: 'string' },
          priceUSD: { type: 'number' },
          priceILS: { type: 'number' },
          timeSavingsHours: { type: 'number' },
          directRevenue: { type: 'number' },
          rating: { type: 'number' },
          popularity: { type: 'number' },
          notes: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
          integrations: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (!value) return [];
  return String(value)
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeImportedTool = (tool) => {
  const priceILS = Number(tool.priceILS || 0);
  const directRevenue = Number(tool.directRevenue || 0);
  const timeSavingsHours = Number(tool.timeSavingsHours || 0);
  const monthlyValue = directRevenue + (timeSavingsHours * 100);
  const roiPercentage = priceILS > 0 ? Math.round(((monthlyValue - priceILS) / priceILS) * 100) : (monthlyValue > 0 ? 100 : 0);
  const normalizedUrl = String(tool.url || '').trim();

  return {
    name: String(tool.name || '').trim(),
    url: normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`,
    description: String(tool.description || ''),
    detailedDescription: String(tool.detailedDescription || ''),
    category: String(tool.category || 'אחר').trim() || 'אחר',
    customCategory: '',
    pricing: String(tool.pricing || (priceILS > 0 ? 'בתשלום' : 'חינם')),
    subscriptionType: String(tool.subscriptionType || (priceILS > 0 ? 'פרימיום' : 'חינמי')),
    priceUSD: Number(tool.priceUSD || 0),
    priceILS,
    timeSavingsHours,
    directRevenue,
    roiPercentage,
    roiDisplay: `ערך חודשי משוער ₪${monthlyValue} מול עלות ₪${priceILS}`,
    features: toArray(tool.features),
    tags: toArray(tool.tags),
    integrations: toArray(tool.integrations),
    rating: Number(tool.rating || 0),
    popularity: Math.max(1, Math.min(5, Math.round(Number(tool.popularity || 3)))),
    notes: String(tool.notes || ''),
    personalNotes: String(tool.notes || ''),
    hasSubscription: priceILS > 0,
    isFavorite: false,
    aiGenerated: false,
    usageStats: {
      totalCostPerMonth: priceILS,
      roi: `ROI משוער: ${roiPercentage}%`,
    },
  };
};

export default function ExportImportDialog({ tools, onImportComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeDescription: true,
    includeFeatures: true,
    includePricing: true,
    includeNotes: true,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isExportingSheet, setIsExportingSheet] = useState(false);

  const handleExportGoogleSheet = async () => {
    setIsExportingSheet(true);
    try {
      const res = await base44.functions.invoke('exportToGoogleSheet', {});
      const url = res.data?.spreadsheetUrl;
      if (url) {
        toast.success(res.data.message || 'הגיליון נוצר בהצלחה', {
          action: {
            label: 'פתח גיליון',
            onClick: () => window.open(url, '_blank'),
          },
          duration: 10000,
        });
        window.open(url, '_blank');
        setIsOpen(false);
      } else {
        throw new Error(res.data?.error || 'שגיאה ביצירת הגיליון');
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || 'שגיאה בייצוא לגיליון Google');
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleExportJSON = () => {
    const exportData = tools.map((tool) => {
      const data = { ...tool };
      if (!exportOptions.includeDescription) delete data.description;
      if (!exportOptions.includeFeatures) delete data.features;
      if (!exportOptions.includePricing) {
        delete data.pricing;
        delete data.priceUSD;
        delete data.priceILS;
      }
      if (!exportOptions.includeNotes) delete data.notes;

      delete data.id;
      delete data.created_date;
      delete data.updated_date;
      delete data.created_by;
      delete data.created_by_id;

      return data;
    });

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-tools-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success(`${tools.length} כלים יוצאו בהצלחה`);
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['שם', 'URL', 'קטגוריה', 'תמחור', 'דירוג', 'פופולריות'];
    if (exportOptions.includeDescription) headers.push('תיאור');
    if (exportOptions.includePricing) headers.push('מחיר USD', 'מחיר ILS');
    if (exportOptions.includeFeatures) headers.push('תכונות');

    const rows = tools.map((tool) => {
      const row = [tool.name, tool.url, tool.category, tool.pricing, tool.rating || 0, tool.popularity || 0];
      if (exportOptions.includeDescription) row.push(tool.description || '');
      if (exportOptions.includePricing) row.push(tool.priceUSD || 0, tool.priceILS || 0);
      if (exportOptions.includeFeatures) row.push((tool.features || []).join('; '));
      return row;
    });

    const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const dataBlob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-tools-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(`${tools.length} כלים יוצאו ל-CSV`);
    setIsOpen(false);
  };

  const importJsonTools = async (file) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('הקובץ אינו מכיל רשימת כלים תקינה');
    return parsed;
  };

  const importSpreadsheetTools = async (file) => {
    const upload = await base44.integrations.Core.UploadFile({ file });
    const extraction = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: upload.file_url,
      json_schema: toolExtractionSchema,
    });

    if (extraction.status !== 'success') {
      throw new Error(extraction.details || 'לא הצלחתי לקרוא את הקובץ');
    }

    if (Array.isArray(extraction.output)) return extraction.output;
    return extraction.output?.tools || [];
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const lowerName = file.name.toLowerCase();
      const rawTools = lowerName.endsWith('.json')
        ? await importJsonTools(file)
        : await importSpreadsheetTools(file);

      const cleanedTools = rawTools
        .map((tool) => normalizeImportedTool(tool))
        .filter((tool) => tool.name && tool.url && tool.category);

      if (cleanedTools.length === 0) {
        throw new Error('לא נמצאו שורות תקינות לייבוא');
      }

      await base44.entities.AiTool.bulkCreate(cleanedTools);
      toast.success(`יובאו ${cleanedTools.length} כלים בהצלחה`);
      onImportComplete?.();
      setIsOpen(false);
    } catch (error) {
      toast.error(error.message || 'שגיאה בייבוא הקובץ');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs md:text-sm min-h-[44px]">
          <Download className="w-4 h-4 ml-1 md:ml-2" />
          <span className="hidden sm:inline">ייצוא/ייבוא</span>
          <span className="sm:hidden">קבצים</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ייבוא וייצוא כלים</DialogTitle>
          <DialogDescription>
            אפשר לייצא את הנתונים שלך או לייבא רשימה שלמה מ-JSON, CSV או Excel.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">ייצוא</TabsTrigger>
            <TabsTrigger value="import">ייבוא</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">בחר מה לייצא:</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={exportOptions.includeDescription} onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, includeDescription: checked }))} />
                  <span className="text-sm">תיאור</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={exportOptions.includeFeatures} onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, includeFeatures: checked }))} />
                  <span className="text-sm">תכונות</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={exportOptions.includePricing} onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, includePricing: checked }))} />
                  <span className="text-sm">מחירים</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={exportOptions.includeNotes} onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, includeNotes: checked }))} />
                  <span className="text-sm">הערות</span>
                </label>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button onClick={handleExportJSON} className="w-full" disabled={tools.length === 0}>
                <FileJson className="w-4 h-4 ml-2" />
                ייצא כ-JSON ({tools.length} כלים)
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="w-full" disabled={tools.length === 0}>
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                ייצא כ-CSV
              </Button>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 mb-2">ייצוא ישיר לגיליון Google Sheets חדש עם נתוני שימוש, דירוגים וסטטוס:</p>
              <Button
                onClick={handleExportGoogleSheet}
                disabled={tools.length === 0 || isExportingSheet}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isExportingSheet ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    יוצר גיליון...
                  </>
                ) : (
                  <>
                    <Sheet className="w-4 h-4 ml-2" />
                    ייצא לגיליון Google Sheets
                    <ExternalLink className="w-3.5 h-3.5 mr-2 opacity-70" />
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                בחר קובץ JSON, CSV או Excel לייבוא מרוכז של כלים
              </p>
              <input
                type="file"
                accept=".json,.csv,.xlsx,.xls"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button asChild disabled={isImporting} className="cursor-pointer">
                  <span>
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        מייבא...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 ml-2" />
                        בחר קובץ
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-semibold mb-1">מה נתמך בייבוא?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>JSON, CSV, XLSX ו-XLS</li>
                    <li>עמודות נפוצות כמו שם, URL, קטגוריה, מחיר, ROI, תגיות והערות</li>
                    <li>הקובץ מתווסף לרשימה הקיימת שלך ולא מוחק נתונים קיימים</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}