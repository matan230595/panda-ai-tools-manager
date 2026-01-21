import React, { useState } from 'react';
import { Star, ExternalLink, Edit, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableColumnSelector from './TableColumnSelector';
import ToolLogo from '@/components/ToolLogo';

export default function TableView({ tools, onEdit, onDelete, onToggleFavorite, onManageSubscription, onToolClick }) {
  const [selectedColumns, setSelectedColumns] = useState([
    { id: 'name', label: 'שם הכלי' },
    { id: 'category', label: 'קטגוריה' },
    { id: 'pricing', label: 'תמחור' },
    { id: 'priceILS', label: 'מחיר (₪)' },
    { id: 'rating', label: 'דירוג' },
    { id: 'hasSubscription', label: 'מנוי' },
  ]);
  const categoryColors = {
    'עיבוד_שפה': 'bg-blue-100 text-blue-800',
    'יצירת_תמונות': 'bg-purple-100 text-purple-800',
    'וידאו': 'bg-pink-100 text-pink-800',
    'קוד': 'bg-green-100 text-green-800',
    'עיצוב': 'bg-yellow-100 text-yellow-800',
    'מחקר': 'bg-indigo-100 text-indigo-800',
    'פרודוקטיביות': 'bg-orange-100 text-orange-800',
    'אוטומציה': 'bg-red-100 text-red-800',
    'אנליטיקה': 'bg-teal-100 text-teal-800',
    'שיווק': 'bg-cyan-100 text-cyan-800',
  };

  const renderCell = (tool, columnId) => {
    switch (columnId) {
      case 'name':
        return (
          <div className="flex items-center gap-3">
            <ToolLogo tool={tool} size="sm" />
            <div>
              <div className="font-semibold">{tool.name}</div>
              {tool.description && (
                <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                  {tool.description}
                </div>
              )}
            </div>
          </div>
        );
      case 'category':
        return (
          <Badge className={categoryColors[tool.category] || 'bg-gray-100'}>
            {tool.category?.replace(/_/g, ' ')}
          </Badge>
        );
      case 'pricing':
        return <Badge variant="outline">{tool.subscriptionType || tool.pricing}</Badge>;
      case 'priceILS':
        return tool.priceILS ? (
          <span className="font-medium">₪{tool.priceILS.toFixed(0)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{tool.rating || 0}</span>
          </div>
        );
      case 'popularity':
        return <span className="text-sm">{tool.popularity || '-'}/5</span>;
      case 'hasSubscription':
        return tool.hasSubscription ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManageSubscription(tool)}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            <Key className="w-3 h-3 ml-1" />
            פעיל
          </Button>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        );
      case 'targetAudience':
        return <span className="text-sm">{tool.targetAudience || '-'}</span>;
      case 'platforms':
        return tool.platforms?.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
            {tool.platforms.slice(0, 2).map((p, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
            ))}
            {tool.platforms.length > 2 && (
              <span className="text-xs text-gray-500">+{tool.platforms.length - 2}</span>
            )}
          </div>
        ) : <span className="text-gray-400">-</span>;
      case 'integrations':
        return tool.integrations?.length > 0 ? (
          <span className="text-sm">{tool.integrations.length} אינטגרציות</span>
        ) : <span className="text-gray-400">-</span>;
      case 'created':
        return <span className="text-sm">{new Date(tool.created_date).toLocaleDateString('he-IL')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex justify-end px-2 sm:px-0">
        <TableColumnSelector
          selectedColumns={selectedColumns}
          onColumnsChange={setSelectedColumns}
        />
      </div>

      <div className="glass-effect rounded-lg sm:rounded-2xl overflow-hidden">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full sm:w-full">
            <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="w-12"></TableHead>
                {selectedColumns.map((col) => (
                  <TableHead key={col.id} className="text-right">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-right w-32">פעולות</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {tools.map((tool) => (
              <TableRow 
                key={tool.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer text-xs sm:text-sm"
                onClick={() => onToolClick?.(tool)}
              >
                <TableCell className="w-10 sm:w-12">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(tool);
                    }}
                    className="p-1.5 sm:p-2 hover:scale-110 transition-transform touch-target"
                    aria-label="toggle favorite"
                  >
                    <Star
                      className={`w-4 sm:w-5 h-4 sm:h-5 ${
                        tool.isFavorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </TableCell>
                {selectedColumns.map((col) => (
                  <TableCell key={col.id} className={`${col.id === 'name' ? 'font-medium' : ''} p-2 sm:p-3`}>
                    {renderCell(tool, col.id)}
                  </TableCell>
                ))}
                <TableCell className="w-28 sm:w-32 p-2 sm:p-3">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(tool.url, '_blank');
                      }}
                      title="בקר באתר"
                      className="h-8 sm:h-9 w-8 sm:w-9 p-0 touch-target"
                    >
                      <ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(tool);
                      }}
                      title="ערוך"
                      className="h-8 sm:h-9 w-8 sm:w-9 p-0 touch-target"
                    >
                      <Edit className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tool);
                      }}
                      title="מחק"
                      className="text-red-500 hover:text-red-700 h-8 sm:h-9 w-8 sm:w-9 p-0 touch-target"
                    >
                      <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         </div>
        </div>
        </div>
        </div>
        );
        }