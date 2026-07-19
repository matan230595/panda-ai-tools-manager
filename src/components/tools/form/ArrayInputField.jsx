import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

/**
 * שדה קלט לרשימת ערכים (תכונות / אינטגרציות / תגיות).
 * מנהל את שדה הקלט הזמני פנימית ומחזיר החוצה רק את הרשימה.
 */
export default function ArrayInputField({ label, placeholder, items = [], onAdd, onRemove, badgeVariant = 'secondary', badgeClassName = '' }) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, index) => (
          <Badge key={index} variant={badgeVariant} className={`pr-1 ${badgeClassName}`}>
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="mr-1 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}