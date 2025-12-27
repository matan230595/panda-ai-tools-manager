import React, { useState } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, X, Check, AlertCircle } from 'lucide-react';
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

export default function ExportImportDialog({ tools, onImportComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeDescription: true,
    includeFeatures: true,
    includePricing: true,
    includeNotes: true,
    format: 'json'
  });
  const [isImporting, setIsImporting] = useState(false);

  const handleExportJSON = () => {
    const exportData = tools.map(tool => {
      const data = { ...tool };
      if (!exportOptions.includeDescription) delete data.description;
      if (!exportOptions.includeFeatures) delete data.features;
      if (!exportOptions.includePricing) {
        delete data.pricing;
        delete data.priceUSD;
        delete data.priceILS;
      }
      if (!exportOptions.includeNotes) delete data.notes;
      
      // מחיקת שדות מערכת
      delete data.id;
      delete data.created_date;
      delete data.updated_date;
      delete data.created_by;
      
      return data;
    });

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-tools-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success(`${tools.length} כלים יוצאו בהצלחה! 📥`);
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['שם', 'URL', 'קטגוריה', 'תמחור', 'דירוג', 'פופולריות'];
    if (exportOptions.includeDescription) headers.push('תיאור');
    if (exportOptions.includePricing) headers.push('מחיר USD', 'מחיר ILS');
    if (exportOptions.includeFeatures) headers.push('תכונות');
    
    const rows = tools.map(tool => {
      const row = [
        tool.name,
        tool.url,
        tool.category,
        tool.pricing,
        tool.rating || 0,
        tool.popularity || 0
      ];
      if (exportOptions.includeDescription) row.push(tool.description || '');
      if (exportOptions.includePricing) row.push(tool.priceUSD || 0, tool.priceILS || 0);
      if (exportOptions.includeFeatures) row.push((tool.features || []).join('; '));
      
      return row;
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF'; // UTF-8 BOM for Excel
    const dataBlob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-tools-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(`${tools.length} כלים יוצאו ל-CSV! 📊`);
    setIsOpen(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const importedTools = JSON.parse(event.target.result);
        
        if (!Array.isArray(importedTools)) {
          throw new Error('הקובץ אינו מכיל מערך של כלים');
        }

        let successCount = 0;
        let errorCount = 0;

        for (const tool of importedTools) {
          try {
            // הסרת שדות מערכת אם קיימים
            const { id, created_date, updated_date, created_by, ...toolData } = tool;
            
            // ודא שהשדות הנדרשים קיימים
            if (!toolData.name || !toolData.url || !toolData.category) {
              errorCount++;
              continue;
            }

            await base44.entities.AiTool.create(toolData);
            successCount++;
          } catch (error) {
            console.error('שגיאה בייבוא כלי:', tool.name, error);
            errorCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`✅ ${successCount} כלים יובאו בהצלחה!`);
          onImportComplete?.();
        }
        
        if (errorCount > 0) {
          toast.warning(`⚠️ ${errorCount} כלים נכשלו בייבוא`);
        }
        
        setIsOpen(false);
      } catch (error) {
        console.error('שגיאה בייבוא:', error);
        toast.error('שגיאה בקריאת הקובץ. ודא שהפורמט תקין.');
      } finally {
        setIsImporting(false);
        e.target.value = ''; // איפוס input
      }
    };

    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 ml-2" />
          ייצוא/ייבוא
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ייצוא וייבוא כלים</DialogTitle>
          <DialogDescription>
            ייצא את הכלים שלך או ייבא כלים מקובץ
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
                  <Checkbox
                    checked={exportOptions.includeDescription}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeDescription: checked }))
                    }
                  />
                  <span className="text-sm">תיאור</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={exportOptions.includeFeatures}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeFeatures: checked }))
                    }
                  />
                  <span className="text-sm">תכונות</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={exportOptions.includePricing}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includePricing: checked }))
                    }
                  />
                  <span className="text-sm">מחירים</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={exportOptions.includeNotes}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeNotes: checked }))
                    }
                  />
                  <span className="text-sm">הערות פרטיות</span>
                </label>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                onClick={handleExportJSON} 
                className="w-full"
                disabled={tools.length === 0}
              >
                <FileJson className="w-4 h-4 ml-2" />
                ייצא כ-JSON ({tools.length} כלים)
              </Button>
              <Button 
                onClick={handleExportCSV} 
                variant="outline"
                className="w-full"
                disabled={tools.length === 0}
              >
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                ייצא כ-CSV (Excel)
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                בחר קובץ JSON לייבוא
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button 
                  asChild
                  disabled={isImporting}
                  className="cursor-pointer"
                >
                  <span>
                    {isImporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
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
                  <p className="font-semibold mb-1">הערות חשובות:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>הכלים המיובאים יתווספו לרשימה הקיימת</li>
                    <li>כלים כפולים לא יימחקו אוטומטית</li>
                    <li>הקובץ חייב להיות בפורמט JSON תקין</li>
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