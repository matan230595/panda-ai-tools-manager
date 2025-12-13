import React from 'react';
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

export default function TableView({ tools, onEdit, onDelete, onToggleFavorite, onManageSubscription }) {
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

  return (
    <div className="glass-effect rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-right">שם הכלי</TableHead>
              <TableHead className="text-right">קטגוריה</TableHead>
              <TableHead className="text-right">תמחור</TableHead>
              <TableHead className="text-right">מחיר (₪)</TableHead>
              <TableHead className="text-right">דירוג</TableHead>
              <TableHead className="text-right">מנוי</TableHead>
              <TableHead className="text-right w-32">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool) => (
              <TableRow key={tool.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell>
                  <button
                    onClick={() => onToggleFavorite(tool)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        tool.isFavorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {tool.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{tool.name}</div>
                      {tool.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                          {tool.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={categoryColors[tool.category] || 'bg-gray-100'}>
                    {tool.category?.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{tool.subscriptionType || tool.pricing}</Badge>
                </TableCell>
                <TableCell>
                  {tool.priceILS ? (
                    <span className="font-medium">₪{tool.priceILS.toFixed(0)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{tool.rating || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {tool.hasSubscription ? (
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
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.open(tool.url, '_blank')}
                      title="בקר באתר"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(tool)}
                      title="ערוך"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(tool)}
                      title="מחק"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}