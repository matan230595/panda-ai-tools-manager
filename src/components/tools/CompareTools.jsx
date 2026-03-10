import React from 'react';
import { X, Star, Check, Minus, ExternalLink, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';

export default function CompareTools({ tools, onClose, isMobile = false }) {
  const getColorForValue = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  if (!tools || tools.length === 0) return null;

  const compareRows = [
    { key: 'category', label: 'קטגוריה', render: (t) => t.category?.replace(/_/g, ' ') },
    { key: 'pricing', label: 'תמחור', icon: DollarSign, render: (t) => t.pricing },
    { key: 'rating', label: 'דירוג', icon: Star, render: (t) => t.rating ? `${t.rating} ⭐` : 'ללא דירוג' },
    { key: 'popularity', label: 'פופולריות', icon: TrendingUp, render: (t) => t.popularity ? `${t.popularity}/5` : '-' },
    { key: 'features', label: 'תכונות', render: (t) => t.features?.length || 0 },
    { key: 'integrations', label: 'אינטגרציות', render: (t) => t.integrations?.length || 0 },
    { key: 'tags', label: 'תגיות', render: (t) => t.tags?.length || 0 },
  ];

  const ComparisonContent = () => (
    <ScrollArea className="h-auto md:h-[calc(90vh-8rem)]">
      <div className="p-3 md:p-6">
        {/* Desktop Grid */}
        <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `180px repeat(${tools.length}, 1fr)` }}>
              {/* Header Row */}
              <div className="font-bold text-gray-600 dark:text-gray-400"></div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-xl p-4 text-center">
                  {tool.logo ? (
                    <img src={tool.logo} alt={tool.name} className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-lg mb-2" />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2">
                      <span className="text-white font-bold text-sm md:text-xl">{tool.name.charAt(0)}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-base md:text-lg mb-1">{tool.name}</h3>
                  {tool.isFavorite && <Star className="w-4 md:w-5 h-4 md:h-5 fill-yellow-400 text-yellow-400 mx-auto" />}
                </div>
              ))}

              {/* Description */}
              <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">תיאור</div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {tool.description || 'אין תיאור'}
                  </p>
                </div>
              ))}

              {/* Comparison Rows */}
              {compareRows.map((row) => (
                <React.Fragment key={row.key}>
                  <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {row.icon && <row.icon className="w-4 h-4" />}
                    {row.label}
                  </div>
                  {tools.map((tool) => (
                    <div key={tool.id} className="glass-effect rounded-lg p-4 flex items-center justify-center">
                      <span className="text-sm font-medium">{row.render(tool)}</span>
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {/* Features Detail */}
              <div className="font-semibold text-gray-700 dark:text-gray-300">תכונות מפורטות</div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-lg p-4">
                  {tool.features?.length > 0 ? (
                    <ul className="space-y-1">
                      {tool.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-2">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {tool.features.length > 5 && (
                        <li className="text-xs text-gray-500">+{tool.features.length - 5} נוספות</li>
                      )}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Minus className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}

              {/* Integrations Detail */}
              <div className="font-semibold text-gray-700 dark:text-gray-300">אינטגרציות</div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-lg p-4">
                  {tool.integrations?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {tool.integrations.map((integration, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Minus className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}

              {/* Actions */}
              <div className="font-semibold text-gray-700 dark:text-gray-300">פעולות</div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-lg p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(tool.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    בקר באתר
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t flex justify-end">
          <Button onClick={onClose}>סגור השוואה</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}