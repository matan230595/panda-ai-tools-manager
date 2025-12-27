import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Download, Upload, Trash2, GitCompare, Key, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SearchAndFilters from '@/components/tools/SearchAndFilters';
import ToolCard from '@/components/tools/ToolCard';
import ToolForm from '@/components/tools/ToolForm';
import CompareTools from '@/components/tools/CompareTools';
import TableView from '@/components/tools/TableView';
import KanbanView from '@/components/tools/KanbanView';
import SubscriptionDialog from '@/components/subscription/SubscriptionDialog';
import SmartRecommendations from '@/components/recommendations/SmartRecommendations';
import EmptyState from '@/components/EmptyState';
import ToolDetailDialog from '@/components/tools/ToolDetailDialog';
import DuplicateDetectorDialog from '@/components/tools/DuplicateDetectorDialog';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ToolsTab({ settings, initialFilter }) {
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState(settings?.viewMode || 'grid');
  const [sortBy, setSortBy] = useState(settings?.sortBy || 'updated');
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [deletingTool, setDeletingTool] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [managingSubscription, setManagingSubscription] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);

  // טעינת כלים
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  // החל פילטר ראשוני
  React.useEffect(() => {
    if (initialFilter) {
      if (initialFilter.filter === 'favorites') {
        setShowFavoritesOnly(true);
      } else if (initialFilter.filter === 'highRated') {
        setSelectedRating(4);
      }
    }
  }, [initialFilter]);

  // מוטציות
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AiTool.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tools']);
      toast.success('הכלי נוסף בהצלחה! 🎉');
      setShowForm(false);
      setEditingTool(null);
    },
    onError: () => toast.error('שגיאה בהוספת הכלי'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AiTool.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tools']);
      toast.success('הכלי עודכן בהצלחה! ✅');
      setShowForm(false);
      setEditingTool(null);
    },
    onError: () => toast.error('שגיאה בעדכון הכלי'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AiTool.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tools']);
      toast.success('הכלי נמחק בהצלחה');
      setDeletingTool(null);
    },
    onError: () => toast.error('שגיאה במחיקת הכלי'),
  });

  // סינון ומיון
  const filteredAndSortedTools = useMemo(() => {
    let filtered = [...tools];

    // חיפוש טקסט
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name?.toLowerCase().includes(search) ||
        tool.description?.toLowerCase().includes(search) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // קטגוריה
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // תמחור
    if (selectedPricing !== 'all') {
      filtered = filtered.filter(tool => tool.pricing === selectedPricing);
    }

    // דירוג
    if (selectedRating > 0) {
      filtered = filtered.filter(tool => (tool.rating || 0) >= selectedRating);
    }

    // מועדפים
    if (showFavoritesOnly) {
      filtered = filtered.filter(tool => tool.isFavorite);
    }

    // מיון
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'created':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'updated':
          return new Date(b.updated_date) - new Date(a.updated_date);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tools, searchTerm, selectedCategory, selectedPricing, selectedRating, showFavoritesOnly, sortBy]);

  // פעולות
  const handleSave = (data) => {
    if (editingTool) {
      updateMutation.mutate({ id: editingTool.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (tool) => {
    setEditingTool(tool);
    setShowForm(true);
  };

  const handleDelete = (tool) => {
    setDeletingTool(tool);
  };

  const handleToggleFavorite = (tool) => {
    updateMutation.mutate({
      id: tool.id,
      data: { ...tool, isFavorite: !tool.isFavorite }
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(tools, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-tools-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('הנתונים יוצאו בהצלחה 📥');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedTools = JSON.parse(event.target.result);
        
        for (const tool of importedTools) {
          const { id, created_date, updated_date, created_by, ...toolData } = tool;
          await base44.entities.AiTool.create(toolData);
        }
        
        queryClient.invalidateQueries(['tools']);
        toast.success(`${importedTools.length} כלים יובאו בהצלחה! 📤`);
      } catch (error) {
        toast.error('שגיאה בייבוא הקובץ');
      }
    };
    reader.readAsText(file);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedPricing('all');
    setSelectedRating(0);
    setShowFavoritesOnly(false);
  };

  const toggleCompareSelection = (tool) => {
    setSelectedForCompare(prev => {
      const exists = prev.find(t => t.id === tool.id);
      if (exists) {
        return prev.filter(t => t.id !== tool.id);
      }
      if (prev.length >= 4) {
        toast.error('ניתן להשוות עד 4 כלים בו זמנית');
        return prev;
      }
      return [...prev, tool];
    });
  };

  // Grid classes
  const gridClasses = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    list: 'flex flex-col gap-3 md:gap-4',
    compact: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4',
    table: '',
    kanban: '',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* כותרת וכפתורים */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            כלי AI שלי
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            נהל את כל כלי ה-AI שלך במקום אחד
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {compareMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setCompareMode(false);
                  setSelectedForCompare([]);
                }}
              >
                ביטול
              </Button>
              <Button
                onClick={() => setCompareMode(false)}
                disabled={selectedForCompare.length < 2}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <GitCompare className="w-4 h-4 ml-2" />
                השווה ({selectedForCompare.length})
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setCompareMode(true)}
                disabled={tools.length < 2}
              >
                <GitCompare className="w-4 h-4 ml-2" />
                השווה כלים
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={tools.length === 0}
              >
                <Download className="w-4 h-4 ml-2" />
                ייצא
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-file').click()}
              >
                <Upload className="w-4 h-4 ml-2" />
                ייבא
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <Sparkles className="w-4 h-4 ml-2" />
                המלצות
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDuplicatesDialog(true)}
              >
                🔍 בדוק כפילויות
              </Button>
              <Button
                onClick={() => {
                  setEditingTool(null);
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Plus className="w-5 h-5 ml-2" />
                הוסף כלי
              </Button>
            </>
          )}
        </div>
      </div>

      {/* המלצות חכמות */}
      {showRecommendations && (
        <div className="glass-effect rounded-2xl p-6">
          <SmartRecommendations onSelectTool={(tool) => {
            setShowRecommendations(false);
            handleEdit(tool);
          }} />
        </div>
      )}

      {/* חיפוש וסינון */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPricing={selectedPricing}
        onPricingChange={setSelectedPricing}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultsCount={filteredAndSortedTools.length}
        onClearFilters={clearFilters}
      />

      {/* רשימת כלים */}
      {filteredAndSortedTools.length === 0 ? (
        <EmptyState
          title={tools.length === 0 ? 'אין כלים עדיין' : 'לא נמצאו תוצאות'}
          description={tools.length === 0 ? 'התחל בהוספת כלי AI ראשון שלך' : 'נסה לשנות את הפילטרים'}
          actionLabel={tools.length === 0 ? 'הוסף כלי ראשון' : undefined}
          onAction={tools.length === 0 ? () => setShowForm(true) : undefined}
        />
      ) : viewMode === 'table' ? (
        <TableView
          tools={filteredAndSortedTools}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          onManageSubscription={setManagingSubscription}
          onToolClick={setSelectedTool}
        />
      ) : viewMode === 'kanban' ? (
        <KanbanView
          tools={filteredAndSortedTools}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          onManageSubscription={setManagingSubscription}
          onToolClick={setSelectedTool}
        />
      ) : (
        <div className={gridClasses[viewMode]}>
          {filteredAndSortedTools.map((tool) => (
            <div key={tool.id} className="relative">
              {compareMode && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedForCompare.some(t => t.id === tool.id)}
                    onCheckedChange={() => toggleCompareSelection(tool)}
                    className="w-6 h-6 bg-white dark:bg-gray-800 border-2"
                  />
                </div>
              )}
              <ToolCard
                tool={tool}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onManageSubscription={setManagingSubscription}
                onClick={setSelectedTool}
              />
            </div>
          ))}
        </div>
      )}

      {/* זיהוי כפילויות */}
      {showDuplicatesDialog && (
        <DuplicateDetectorDialog
          tools={tools}
          onDelete={handleDelete}
          onClose={() => setShowDuplicatesDialog(false)}
        />
      )}

      {/* פרטי כלי */}
      {selectedTool && (
        <ToolDetailDialog
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          onManageSubscription={setManagingSubscription}
        />
      )}

      {/* מודל השוואה */}
      {!compareMode && selectedForCompare.length >= 2 && (
        <CompareTools 
          tools={selectedForCompare}
          onClose={() => setSelectedForCompare([])}
        />
      )}

      {/* ניהול מנוי */}
      {managingSubscription && (
        <SubscriptionDialog
          tool={managingSubscription}
          onClose={() => setManagingSubscription(null)}
        />
      )}

      {/* טופס */}
      {showForm && (
        <ToolForm
          tool={editingTool}
          onClose={() => {
            setShowForm(false);
            setEditingTool(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* דיאלוג מחיקה */}
      <AlertDialog open={!!deletingTool} onOpenChange={() => setDeletingTool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הכלי "{deletingTool?.name}" לצמיתות. לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deletingTool.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}