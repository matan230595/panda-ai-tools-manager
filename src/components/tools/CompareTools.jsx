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
              <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center">תיאור</div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 md:line-clamp-3">
                    {tool.description || 'אין תיאור'}
                  </p>
                </div>
              ))}

              {/* Comparison Rows */}
              {compareRows.map((row) => (
                <React.Fragment key={row.key}>
                  <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {row.icon && <row.icon className="w-3 md:w-4 h-3 md:h-4" />}
                    {row.label}
                  </div>
                  {tools.map((tool) => (
                    <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4 flex items-center justify-center">
                      <span className="text-xs md:text-sm font-medium">{row.render(tool)}</span>
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {/* Features Detail */}
              <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300">תכונות</div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4">
                  {tool.features?.length > 0 ? (
                    <ul className="space-y-0.5 md:space-y-1">
                      {tool.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-xs flex items-start gap-1 md:gap-2">
                          <Check className="w-2 md:w-3 h-2 md:h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {tool.features.length > 3 && (
                        <li className="text-xs text-gray-500">+{tool.features.length - 3}</li>
                      )}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Minus className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}

              {/* Actions */}
              <div className="font-semibold text-xs md:text-sm text-gray-700 dark:text-gray-300">פעולות</div>
              {tools.map((tool) => (
                <div key={tool.id} className="glass-effect rounded-lg p-2 md:p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs md:text-sm"
                    onClick={() => window.open(tool.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 ml-1 md:w-4 md:h-4 md:ml-2" />
                    בקר
                  </Button>
                </div>
              ))}
        </div>

        {/* Mobile Stack View */}
        <div className="md:hidden space-y-4 px-3 py-4">
          {tools.map((tool) => (
            <div key={tool.id} className="glass-effect rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                {tool.logo ? (
                  <img src={tool.logo} alt={tool.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold">{tool.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{tool.name}</h3>
                  {tool.isFavorite && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 inline ml-1" />}
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{tool.description}</p>
              <div className="space-y-2 border-t pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">תמחור:</span>
                  <span className="font-medium">{tool.pricing}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">דירוג:</span>
                  <span className="font-medium">{tool.rating ? `${tool.rating} ⭐` : 'ללא'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">תכונות:</span>
                  <span className="font-medium">{tool.features?.length || 0}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => window.open(tool.url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 ml-1" />
                בקר באתר
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );

  if (isMobile) {
    return (
      <Drawer open={true} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>השוואת כלים</DrawerTitle>
            <DrawerClose>✕</DrawerClose>
          </DrawerHeader>
          <ComparisonContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4 border-b">
          <DialogTitle className="text-xl md:text-2xl font-bold">השוואת כלים</DialogTitle>
        </DialogHeader>
        <ComparisonContent />
        <div className="p-3 md:p-4 border-t flex justify-end">
          <Button onClick={onClose} size="sm">סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}