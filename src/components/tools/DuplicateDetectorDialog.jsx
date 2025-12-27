import React, { useMemo } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ToolLogo from '@/components/ToolLogo';

export default function DuplicateDetectorDialog({ tools, onDelete, onClose }) {
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }
    
    const distance = costs[shorter.length];
    return (longer.length - distance) / longer.length;
  };

  const duplicates = useMemo(() => {
    const groups = [];
    const processed = new Set();

    tools.forEach((tool, idx) => {
      if (processed.has(tool.id)) return;

      const similarTools = tools.filter((other, otherIdx) => {
        if (idx === otherIdx || processed.has(other.id)) return false;

        if (tool.url && other.url && tool.url.toLowerCase() === other.url.toLowerCase()) {
          return true;
        }

        const name1 = tool.name.toLowerCase().trim();
        const name2 = other.name.toLowerCase().trim();
        
        if (name1 === name2) return true;
        if (name1.includes(name2) || name2.includes(name1)) return true;

        const similarity = calculateSimilarity(name1, name2);
        return similarity > 0.8;
      });

      if (similarTools.length > 0) {
        const group = [tool, ...similarTools];
        group.forEach(t => processed.add(t.id));
        groups.push(group);
      }
    });

    return groups;
  }, [tools]);

  if (duplicates.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">מצוין!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">לא נמצאו כפילויות במערכת</p>
            <Button onClick={onClose} className="w-full">סגור</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">נמצאו כפילויות</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  זוהו {duplicates.length} קבוצות של כלים דומים
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {duplicates.map((group, groupIdx) => (
            <div key={groupIdx} className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-2 border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-orange-500 text-white">
                  קבוצה {groupIdx + 1}: {group.length} כלים
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {group.map((tool) => (
                  <div key={tool.id} className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <ToolLogo tool={tool} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{tool.name}</div>
                      <div className="text-xs text-gray-500 truncate">{tool.url}</div>
                      {tool.description && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                          {tool.description}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(tool)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Alert className="bg-white dark:bg-gray-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>המלצה</AlertTitle>
                <AlertDescription>
                  בחן את הכלים ומחק את הכפילויות. שמור את הכלי עם המידע המלא ביותר.
                </AlertDescription>
              </Alert>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}