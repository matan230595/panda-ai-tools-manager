import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  activeFiltersCount,
  categories,
  tags 
}) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      categories: [],
      pricing: [],
      subscriptionTypes: [],
      ratingRange: [0, 5],
      popularityRange: [1, 5],
      hasTags: [],
      hasSubscription: null,
      isFavorite: null,
      aiGenerated: null,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const toggleArrayFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const pricingOptions = ['חינם', 'בתשלום', 'פרימיום', 'פרימיום_מוגבל'];
  const subscriptionTypes = ['חינמי', 'פרימיום', 'גולד'];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="w-4 h-4 ml-2" />
          סינון מתקדם
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-indigo-500">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>סינון מתקדם</SheetTitle>
          <SheetDescription>
            התאם אישית את תוצאות החיפוש
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* קטגוריות */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">קטגוריות</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleArrayFilter('categories', cat)}
                  className={`
                    p-2 rounded-lg border-2 text-sm text-right transition-all
                    ${localFilters.categories.includes(cat)
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }
                  `}
                >
                  {localFilters.categories.includes(cat) && (
                    <Check className="w-3 h-3 inline ml-1" />
                  )}
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* תמחור */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">תמחור</Label>
            <div className="space-y-2">
              {pricingOptions.map(pricing => (
                <label key={pricing} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={localFilters.pricing.includes(pricing)}
                    onCheckedChange={() => toggleArrayFilter('pricing', pricing)}
                  />
                  <span className="text-sm">{pricing.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* סוג מנוי */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">סוג מנוי</Label>
            <div className="space-y-2">
              {subscriptionTypes.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={localFilters.subscriptionTypes.includes(type)}
                    onCheckedChange={() => toggleArrayFilter('subscriptionTypes', type)}
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* טווח דירוג */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              דירוג: {localFilters.ratingRange[0]} - {localFilters.ratingRange[1]} ⭐
            </Label>
            <Slider
              value={localFilters.ratingRange}
              onValueChange={(val) => setLocalFilters(prev => ({ ...prev, ratingRange: val }))}
              min={0}
              max={5}
              step={0.5}
              className="py-4"
            />
          </div>

          {/* טווח פופולריות */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              פופולריות: {localFilters.popularityRange[0]} - {localFilters.popularityRange[1]}
            </Label>
            <Slider
              value={localFilters.popularityRange}
              onValueChange={(val) => setLocalFilters(prev => ({ ...prev, popularityRange: val }))}
              min={1}
              max={5}
              step={1}
              className="py-4"
            />
          </div>

          {/* תגיות פופולריות */}
          {tags.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">תגיות</Label>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 10).map(tag => (
                  <Badge
                    key={tag}
                    variant={localFilters.hasTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('hasTags', tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* סינון מהיר */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-semibold">סינון מהיר</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={localFilters.isFavorite === true}
                  onCheckedChange={(checked) => 
                    setLocalFilters(prev => ({ ...prev, isFavorite: checked ? true : null }))
                  }
                />
                <span className="text-sm">מועדפים בלבד</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={localFilters.hasSubscription === true}
                  onCheckedChange={(checked) => 
                    setLocalFilters(prev => ({ ...prev, hasSubscription: checked ? true : null }))
                  }
                />
                <span className="text-sm">יש לי מנוי</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={localFilters.aiGenerated === true}
                  onCheckedChange={(checked) => 
                    setLocalFilters(prev => ({ ...prev, aiGenerated: checked ? true : null }))
                  }
                />
                <span className="text-sm">נוצר בעזרת AI</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-950">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <X className="w-4 h-4 ml-2" />
            איפוס
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600">
            <Check className="w-4 h-4 ml-2" />
            החל סינון
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}