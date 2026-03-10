import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Plus, Download, Upload, Trash2, GitCompare, Key, Sparkles, Menu, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
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
import AdvancedFilters from '@/components/tools/AdvancedFilters';
import ExportImportDialog from '@/components/tools/ExportImportDialog';
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
  const [userLogo, setUserLogo] = useState('');
  const [appName, setAppName] = useState('AI Tools Manager');

  const { data: appSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        const list = await base44.entities.Settings.filter({ created_by: user.email });
        return list[0] || null;
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    if (appSettings?.userLogo) {
      setUserLogo(appSettings.userLogo);
    }
    if (appSettings?.appName) {
      setAppName(appSettings.appName);
    }
  }, [appSettings]);
  
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
  const [advancedFilters, setAdvancedFilters] = useState({
    categories: [],
    pricing: [],
    subscriptionTypes: [],
    ratingRange: [0, 5],
    popularityRange: [1, 5],
    hasTags: [],
    hasSubscription: null,
    isFavorite: null,
    aiGenerated: null,
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // טעינת כלים
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by: user.email });
    },
  });

  // בדוק התראות חכמות
  useEffect(() => {
    if (!appSettings?.enableNotifications || !tools || tools.length === 0) return;

    // התראה על כלים פופולריים חדשים
    const popularNew = tools
      .filter(t => t.popularity >= 4 && new Date(t.created_date) > new Date(Date.now() - 7*24*60*60*1000))
      .slice(0, 1);
    
    if (popularNew.length > 0 && !sessionStorage.getItem(`notified-popular-${popularNew[0].id}`)) {
      toast.success(`🌟 כלי פופולרי חדש: ${popularNew[0].name}`);
      sessionStorage.setItem(`notified-popular-${popularNew[0].id}`, 'true');
    }

    // התראה על כלים חדשים בקטגוריה שאתה משתמש בה
    const toolsByCategory = {};
    tools.forEach(t => {
      if (!toolsByCategory[t.category]) toolsByCategory[t.category] = [];
      toolsByCategory[t.category].push(t);
    });
    
    const categoriesWithTools = Object.keys(toolsByCategory).filter(cat => toolsByCategory[cat].length > 3);
    if (categoriesWithTools.length > 0 && !sessionStorage.getItem('notified-category')) {
      toast.info(`📊 יש לך ${categoriesWithTools.length} קטגוריות עם כלים רבים`);
      sessionStorage.setItem('notified-category', 'true');
    }
  }, [tools, appSettings?.enableNotifications]);

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

  // סינון ומיון מתקדם
  const filteredAndSortedTools = useMemo(() => {
    let filtered = [...tools];

    // חיפוש טקסט מתקדם
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name?.toLowerCase().includes(search) ||
        tool.description?.toLowerCase().includes(search) ||
        tool.detailedDescription?.toLowerCase().includes(search) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(search)) ||
        tool.features?.some(f => f.toLowerCase().includes(search)) ||
        tool.category?.toLowerCase().includes(search) ||
        tool.integrations?.some(i => i.toLowerCase().includes(search)) ||
        tool.platforms?.some(p => p.toLowerCase().includes(search))
      );
    }

    // קטגוריה בסיסית
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // תמחור בסיסי
    if (selectedPricing !== 'all') {
      filtered = filtered.filter(tool => tool.pricing === selectedPricing);
    }

    // דירוג בסיסי
    if (selectedRating > 0) {
      filtered = filtered.filter(tool => (tool.rating || 0) >= selectedRating);
    }

    // מועדפים בסיסי
    if (showFavoritesOnly) {
      filtered = filtered.filter(tool => tool.isFavorite);
    }

    // סינון מתקדם - קטגוריות
    if (advancedFilters.categories.length > 0) {
      filtered = filtered.filter(tool => advancedFilters.categories.includes(tool.category));
    }

    // סינון מתקדם - תמחור
    if (advancedFilters.pricing.length > 0) {
      filtered = filtered.filter(tool => advancedFilters.pricing.includes(tool.pricing));
    }

    // סינון מתקדם - סוג מנוי
    if (advancedFilters.subscriptionTypes.length > 0) {
      filtered = filtered.filter(tool => advancedFilters.subscriptionTypes.includes(tool.subscriptionType));
    }

    // סינון מתקדם - טווח דירוג
    filtered = filtered.filter(tool => {
      const rating = tool.rating || 0;
      return rating >= advancedFilters.ratingRange[0] && rating <= advancedFilters.ratingRange[1];
    });

    // סינון מתקדם - טווח פופולריות
    filtered = filtered.filter(tool => {
      const popularity = tool.popularity || 1;
      return popularity >= advancedFilters.popularityRange[0] && popularity <= advancedFilters.popularityRange[1];
    });

    // סינון מתקדם - תגיות
    if (advancedFilters.hasTags.length > 0) {
      filtered = filtered.filter(tool => 
        tool.tags?.some(tag => advancedFilters.hasTags.includes(tag))
      );
    }

    // סינון מתקדם - יש מנוי
    if (advancedFilters.hasSubscription !== null) {
      filtered = filtered.filter(tool => tool.hasSubscription === advancedFilters.hasSubscription);
    }

    // סינון מתקדם - מועדפים
    if (advancedFilters.isFavorite !== null) {
      filtered = filtered.filter(tool => tool.isFavorite === advancedFilters.isFavorite);
    }

    // סינון מתקדם - נוצר ב-AI
    if (advancedFilters.aiGenerated !== null) {
      filtered = filtered.filter(tool => tool.aiGenerated === advancedFilters.aiGenerated);
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
        case 'usage':
          return (b.usageStats?.timesUsed || 0) - (a.usageStats?.timesUsed || 0);
        case 'cost':
          return (b.usageStats?.totalCostPerMonth || 0) - (a.usageStats?.totalCostPerMonth || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tools, searchTerm, selectedCategory, selectedPricing, selectedRating, showFavoritesOnly, sortBy, advancedFilters]);

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
    setAdvancedFilters({
      categories: [],
      pricing: [],
      subscriptionTypes: [],
      ratingRange: [0, 5],
      popularityRange: [1, 5],
      hasTags: [],
      hasSubscription: null,
      isFavorite: null,
      aiGenerated: null,
    });
  };

  // חישוב פילטרים פעילים
  const activeAdvancedFiltersCount = 
    advancedFilters.categories.length +
    advancedFilters.pricing.length +
    advancedFilters.subscriptionTypes.length +
    advancedFilters.hasTags.length +
    (advancedFilters.hasSubscription !== null ? 1 : 0) +
    (advancedFilters.isFavorite !== null ? 1 : 0) +
    (advancedFilters.aiGenerated !== null ? 1 : 0) +
    (advancedFilters.ratingRange[0] > 0 || advancedFilters.ratingRange[1] < 5 ? 1 : 0) +
    (advancedFilters.popularityRange[0] > 1 || advancedFilters.popularityRange[1] < 5 ? 1 : 0);

  // כל התגיות והקטגוריות
  const allCategories = [...new Set(tools.map(t => t.category))].sort();
  const allTags = [...new Set(tools.flatMap(t => t.tags || []))].sort();

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

  const handleQuickUpdate = async (toolId, patch) => {
    await base44.entities.AiTool.update(toolId, patch);
    queryClient.invalidateQueries(['tools']);
    toast.success('הכלי עודכן');
  };

  const handleMergeTools = async (primaryTool, duplicateTool) => {
    const mergedFeatures = [...new Set([...(primaryTool.features || []), ...(duplicateTool.features || [])])];
    const mergedTags = [...new Set([...(primaryTool.tags || []), ...(duplicateTool.tags || [])])];
    const mergedIntegrations = [...new Set([...(primaryTool.integrations || []), ...(duplicateTool.integrations || [])])];
    const mergedNotes = [primaryTool.notes, duplicateTool.notes, primaryTool.personalNotes, duplicateTool.personalNotes].filter(Boolean).join('\n\n');
    const mergedRevenue = (primaryTool.directRevenue || 0) + (duplicateTool.directRevenue || 0);
    const mergedTimeSavings = (primaryTool.timeSavingsHours || 0) + (duplicateTool.timeSavingsHours || 0);
    const mergedUsageStats = {
      ...(primaryTool.usageStats || {}),
      timesUsed: (primaryTool.usageStats?.timesUsed || 0) + (duplicateTool.usageStats?.timesUsed || 0),
      totalCostPerMonth: Math.max(primaryTool.usageStats?.totalCostPerMonth || 0, duplicateTool.usageStats?.totalCostPerMonth || 0),
      averageSessionDuration: Math.max(primaryTool.usageStats?.averageSessionDuration || 0, duplicateTool.usageStats?.averageSessionDuration || 0),
      lastUsedDate: primaryTool.usageStats?.lastUsedDate || duplicateTool.usageStats?.lastUsedDate,
    };

    await base44.entities.AiTool.update(primaryTool.id, {
      ...primaryTool,
      description: primaryTool.description || duplicateTool.description,
      detailedDescription: primaryTool.detailedDescription || duplicateTool.detailedDescription,
      features: mergedFeatures,
      tags: mergedTags,
      integrations: mergedIntegrations,
      notes: mergedNotes,
      personalNotes: mergedNotes,
      directRevenue: mergedRevenue,
      timeSavingsHours: mergedTimeSavings,
      usageStats: mergedUsageStats,
    });

    await base44.entities.AiTool.delete(duplicateTool.id);
    queryClient.invalidateQueries(['tools']);
    toast.success(`בוצע מיזוג של ${duplicateTool.name} לתוך ${primaryTool.name}`);
  };

  // Grid classes
  const gridClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6',
    list: 'flex flex-col gap-2 sm:gap-3 md:gap-4',
    compact: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4',
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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* כותרת ראשית */}
      <div className="text-right px-1 sm:px-0">
         <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2 md:mb-3">
           {userLogo && (
             <img src={userLogo} alt={appName} className="w-8 sm:w-10 md:w-12 lg:w-14 h-8 sm:h-10 md:h-12 lg:h-14 object-contain flex-shrink-0" />
           )}
           <div className="min-w-0 flex-1">
             <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-0.5 md:mb-1 break-words">
               כלי AI שלי
             </h1>
           </div>
         </div>
         <p className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 md:mb-4">
           נהל את כל כלי ה-AI שלך במקום אחד
         </p>
        
        {/* כפתורי פעולה - מסודרים: כפתור הוספה | export/import | advanced filters | (mobile menu) */}
         <div className="flex gap-1.5 items-center flex-wrap">
            {/* כפתור הוספה - ימין */}
            <Button
              onClick={() => {
                setEditingTool(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg text-xs"
              size="sm"
            >
              <Plus className="w-4 h-4 ml-1" />
              <span className="hidden sm:inline">הוסף</span>
            </Button>

            <Button
              variant={showRecommendations ? 'secondary' : 'outline'}
              onClick={() => setShowRecommendations(prev => !prev)}
              size="sm"
              className="text-xs"
            >
              <Sparkles className="w-4 h-4 ml-1" />
              המלצות
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDuplicatesDialog(true)}
              size="sm"
              className="text-xs"
            >
              נקה כפילויות
            </Button>

            {/* export/import - אמצע-ימין */}
            <div className="hidden md:block">
              <ExportImportDialog
                tools={tools}
                onImportComplete={() => queryClient.invalidateQueries(['tools'])}
              />
            </div>

            {/* advanced filters - אמצע-שמאל */}
            <div className="hidden md:block">
              <AdvancedFilters
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
                activeFiltersCount={activeAdvancedFiltersCount}
                categories={allCategories}
                tags={allTags}
              />
            </div>

            {/* תפריט מובייל - שמאל */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-white dark:bg-gray-900">
                <DrawerHeader>
                  <DrawerTitle>אפשרויות</DrawerTitle>
                </DrawerHeader>
                <div className="grid grid-cols-2 gap-2 p-4 pb-8">
                  <Button variant="outline" onClick={() => { handleExport(); setIsDrawerOpen(false); }} className="text-xs" size="sm">
                    <Download className="w-3 h-3 ml-1" />
                    ייצא
                  </Button>
                  <Button variant="outline" onClick={() => document.getElementById('import-file').click()} className="text-xs" size="sm">
                    <Upload className="w-3 h-3 ml-1" />
                    ייבא
                  </Button>
                  <input id="import-file" type="file" accept=".json" onChange={handleImport} className="hidden" />
                  <Button variant="outline" onClick={() => { setCompareMode(true); setIsDrawerOpen(false); }} disabled={tools.length < 2} className="text-xs col-span-2" size="sm">
                    <GitCompare className="w-3 h-3 ml-1" />
                    השווה
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>

            {compareMode && (
              <div className="flex gap-1.5">
                <Button variant="outline" onClick={() => { setCompareMode(false); setSelectedForCompare([]); }} size="sm" className="text-xs">ביטול</Button>
                <Button onClick={() => setCompareMode(false)} disabled={selectedForCompare.length < 2} className="bg-gradient-to-r from-green-500 to-emerald-600 text-xs" size="sm">
                  <GitCompare className="w-3 h-3 ml-1" />
                  <span className="hidden sm:inline">השווה ({selectedForCompare.length}/4)</span>
                </Button>
              </div>
            )}
         </div>
      </div>

      {/* המלצות חכמות */}
      {showRecommendations && (
        <div className="glass-effect rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-lg md:shadow-xl border border-indigo-100 dark:border-indigo-900">
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultsCount={filteredAndSortedTools.length}
        tools={tools}
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
            <ToolCard
                key={tool.id}
                tool={tool}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onManageSubscription={setManagingSubscription}
                onClick={setSelectedTool}
                isSelected={selectedForCompare.some(t => t.id === tool.id)}
                onToggleSelect={compareMode ? toggleCompareSelection : null}
                />
                ))}
        </div>
      )}

      {/* זיהוי כפילויות */}
      {showDuplicatesDialog && (
        <DuplicateDetectorDialog
          tools={tools}
          onDelete={handleDelete}
          onMerge={handleMergeTools}
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
          onQuickUpdate={handleQuickUpdate}
        />
      )}

      {/* מודל השוואה */}
      {!compareMode && selectedForCompare.length >= 2 && (
        <CompareTools 
          tools={selectedForCompare}
          onClose={() => setSelectedForCompare([])}
          isMobile={window.innerWidth < 768}
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