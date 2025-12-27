import React, { useMemo } from 'react';
import { AlertTriangle, Merge, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ToolLogo from '@/components/ToolLogo';

export default function DuplicateDetector({ tools, onMerge, onDelete, onClose }) {
  // זיהוי כפילויות לפי שם דומה או URL זהה
  const duplicates = useMemo(() => {
    const groups = [];
    const processed = new Set();

    tools.forEach((tool, idx) => {
      if (processed.has(tool.id)) return;

      const similarTools = tools.filter((other, otherIdx) => {
        if (idx === otherIdx || processed.has(other.id)) return false;

        // בדיקת URL זהה
        if (tool.url && other.url && tool.url.toLowerCase() === other.url.toLowerCase()) {
          return true;
        }

        // בדיקת שם דומה (Levenshtein distance מפושט)
        const name1 = tool.name.toLowerCase().trim();
        const name2 = other.name.toLowerCase().trim();
        
        if (name1 === name2) return true;
        
        // בדיקה אם אחד מכיל את השני
        if (name1.includes(name2) || name2.includes(name1)) return true;

        // דמיון של 80%+
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

  if (duplicates.length === 0) {
    return null;
  }

  return (
    <div className="glass-effect rounded-2xl p-6 mb-6 border-2 border-orange-200 dark:border-orange-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <div>
            <h3 className="font-bold text-lg">נמצאו כפילויות</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              זוהו {duplicates.length} קבוצות של כלים דומים או כפולים
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {duplicates.map((group, groupIdx) => (
          <div key={groupIdx} className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary">
                {group.length} כלים דומים
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {group.map((tool) => (
                <div key={tool.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <ToolLogo tool={tool} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{tool.name}</div>
                    <div className="text-xs text-gray-500 truncate">{tool.url}</div>
                    {tool.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {tool.description}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(tool)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>המלצה</AlertTitle>
              <AlertDescription>
                בדוק את הכלים ומחק את הכפילויות המיותרות. שמור את הכלי עם המידע המלא ביותר.
              </AlertDescription>
            </Alert>
          </div>
        ))}
      </div>
    </div>
  );
}