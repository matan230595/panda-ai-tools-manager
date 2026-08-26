import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Plus, Trash2, GitCompare, Sparkles, SlidersHorizontal, LayoutGrid, List, Rows3, Table2, Kanban, Copy, CheckSquare, Wand2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useUrlFilters from '@/components/hooks/useUrlFilters';
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
import ShareLinkDialog from '@/components/sharing/ShareLinkDialog';
import BulkActionsBar from '@/components/tools/BulkActionsBar';
import CardFieldsCustomizer from '@/components/tools/CardFieldsCustomizer';
import TaskTemplatesDialog from '@/components/tools/TaskTemplatesDialog';
import { useCardFieldConfig } from '@/components/hooks/useCardFieldConfig';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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

export default function ToolsTab({ settings, initialFilter, quickAddTool, onQuickAddDone }) {
  const queryClient = useQueryClient();
  const userLogo = settings?.userLogo || '';
  const appName = settings?.appName || 'AI Tools Manager';
  
  // State management — סינון/חיפוש/תצוגה נשמרים ב-URL (שמירה ברענון ובשיתוף קישור)
  const [urlFilters, setUrlFilter] = useUrlFilters({
    q: '',
    category: 'all',
    pricing: 'all',
    rating: 0,
    favorites: false,
    view: settings?.viewMode || 'grid',
    sort: settings?.sortBy || 'updated',
  });
  const searchTerm = urlFilters.q;
  const setSearchTerm = (v) => setUrlFilter('q', v);
  const selectedCategory = urlFilters.category;
  const setSelectedCategory = (v) => setUrlFilter('category', v);
  const selectedPricing = urlFilters.pricing;
  const setSelectedPricing = (v) => setUrlFilter('pricing', v);
  const selectedRating = urlFilters.rating;
  const setSelectedRating = (v) => setUrlFilter('rating', v);
  const showFavoritesOnly = urlFilters.favorites;
  const setShowFavoritesOnly = (v) => setUrlFilter('favorites', v);
  const viewMode = urlFilters.view;
  const setViewMode = (v) => setUrlFilter('view', v);
  const sortBy = urlFilters.sort;
  const setSortBy = (v) => setUrlFilter('sort', v);

  const [aiAutoCompleteOpen, setAiAutoCompleteOpen] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [deletingTool, setDeletingTool] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [managingSubscription, setManagingSubscription] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState([]);

  useEffect(() => {
    if (quickAddTool) {
      setEditingTool(null);
      setShowForm(true);
      onQuickAddDone?.();
    }
  }, [quickAddTool]);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [showTaskTemplates, setShowTaskTemplates] = useState(false);
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
  const [masteryFilter, setMasteryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // איפוס עמוד כשמשתנים הפילטרים
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedCategory, selectedPricing, selectedRating, showFavoritesOnly, sortBy, advancedFilters, masteryFilter, priorityFilter]);

  // הגדרות תצוגת שדות בכרטיס
  const { visibility: cardFieldVisibility } = useCardFieldConfig();

  // טעינת כלים
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  // בדוק התראות חכמות
  useEffect(() => {
    if (!settings?.enableNotifications || !tools || tools.length === 0) return;

    // התראה על כלים פופולריים חדשים
    const popularNew = tools
      .filter(t => t.popularity >= 4 && new Date(t.created_date) > new Date(Date.now() - 7*24*60*60*1000))
      .slice(0, 1);
    
    if (popularNew.length > 0 && !sessionStorage.getItem(`notified-popular-${popularNew[0].id}`)) {
      toast.success(`🌟 כלי פופולרי חדש: ${popularNew[0].name}`);
      sessionStorage.setItem(`notified-popular-${popularNew[0].id}`, 'true');
    }
  }, [tools, settings?.enableNotifications]);

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
    onError: (error) => toast.error(error?.message || 'שגיאה בהוספת הכלי'),
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
        tool.personalNotes?.toLowerCase().includes(search) ||
        tool.notes?.toLowerCase().includes(search) ||
        tool.targetAudience?.toLowerCase().includes(search) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(search)) ||
        tool.features?.some(f => f.toLowerCase().includes(search)) ||
        tool.useCases?.some(useCase => `${useCase?.title || ''} ${useCase?.description || ''}`.toLowerCase().includes(search)) ||
        tool.prosAndCons?.pros?.some(pro => pro.toLowerCase().includes(search)) ||
        tool.prosAndCons?.cons?.some(con => con.toLowerCase().includes(search)) ||
        tool.category?.toLowerCase().includes(search) ||
        tool.customCategory?.toLowerCase().includes(search) ||
        tool.integrations?.some(i => i.toLowerCase().includes(search)) ||
        tool.platforms?.some(p => p.toLowerCase().includes(search))
      );
    }

    // קטגוריה בסיסית
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => (tool.customCategory || tool.category) === selectedCategory);
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
      filtered = filtered.filter(tool => advancedFilters.categories.includes(tool.customCategory || tool.category));
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

    // סינון לפי רמת שליטה
    if (masteryFilter && masteryFilter !== 'all') {
      filtered = filtered.filter(tool => (tool.masteryLevel || 'מתחיל') === masteryFilter);
    }

    // סינון לפי עדיפות למידה
    if (priorityFilter && priorityFilter !== 'all') {
      filtered = filtered.filter(tool => (tool.learningPriority || 'רגיל שלי') === priorityFilter);
    }

    // כלים בעלי דירוג גבוה תמיד מופיעים קודם.
    filtered.sort((a, b) => {
      const ratingDifference = (b.rating || 0) - (a.rating || 0);
      if (ratingDifference) return ratingDifference;
      switch(sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'custom':
          return (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) || new Date(a.created_date) - new Date(b.created_date);
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
        case 'mastery': {
          const order = { 'מתחיל': 0, 'בינוני': 1, 'מומחה': 2 };
          return (order[b.masteryLevel || 'מתחיל'] || 0) - (order[a.masteryLevel || 'מתחיל'] || 0);
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [tools, searchTerm, selectedCategory, selectedPricing, selectedRating, showFavoritesOnly, sortBy, advancedFilters, masteryFilter, priorityFilter]);

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
      data: { isFavorite: !tool.isFavorite }
    });
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedTools = JSON.parse(event.target.result);
        const cleanedTools = importedTools.map((tool) => {
          const { id, created_date, updated_date, created_by, created_by_id, ...toolData } = tool;
          return toolData;
        });

        await base44.entities.AiTool.bulkCreate(cleanedTools);
        queryClient.invalidateQueries(['tools']);
        toast.success(`${importedTools.length} כלים יובאו בהצלחה! 📤`);
      } catch (error) {
        toast.error('שגיאה בייבוא הקובץ');
      }
    };
    reader.readAsText(file);
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

  // כל התגיות והקטגוריות — ממומנז
  const allCategories = useMemo(() => [...new Set(tools.map(t => t.customCategory || t.category).filter(Boolean))].sort(), [tools]);
  const allTags = useMemo(() => [...new Set(tools.flatMap(t => t.tags || []))].sort(), [tools]);

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

  const toggleBulkSelection = (tool) => {
    setSelectedForBulk(prev => {
      const exists = prev.includes(tool.id);
      if (exists) {
        return prev.filter(id => id !== tool.id);
      }
      return [...prev, tool.id];
    });
  };

  const handleSelectAllBulk = () => {
    if (selectedForBulk.length === filteredAndSortedTools.length) {
      setSelectedForBulk([]);
    } else {
      setSelectedForBulk(filteredAndSortedTools.map(t => t.id));
    }
  };

  const handleQuickUpdate = async (toolId, patch) => {
    await base44.entities.AiTool.update(toolId, patch);
    queryClient.invalidateQueries(['tools']);
    toast.success('הכלי עודכן');
  };

  const handleKanbanStatusChange = async (toolId, masteryLevel) => {
    try {
      await base44.entities.AiTool.update(toolId, { masteryLevel });
      queryClient.invalidateQueries(['tools']);
      toast.success('שלב הלמידה עודכן');
    } catch {
      toast.error('שגיאה בעדכון הסטטוס');
      queryClient.invalidateQueries(['tools']);
    }
  };

  const handleToolReorder = async ({ source, destination }) => {
    if (!destination || source.index === destination.index) return;
    const reordered = [...filteredAndSortedTools];
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    await base44.entities.AiTool.bulkUpdate(reordered.map((tool, index) => ({ id: tool.id, sortOrder: index })));
    queryClient.invalidateQueries(['tools']);
    toast.success('סדר הכלים נשמר');
  };

  const handleMergeTools = async (primaryTool, duplicateTool, resolvedDescription) => {
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

    const mergedDetailed = [primaryTool.detailedDescription, duplicateTool.detailedDescription]
      .filter(Boolean).join('\n\n');

    await base44.entities.AiTool.update(primaryTool.id, {
      ...primaryTool,
      description: resolvedDescription ?? (primaryTool.description || duplicateTool.description),
      detailedDescription: mergedDetailed || primaryTool.detailedDescription || duplicateTool.detailedDescription,
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
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-4 lg:gap-6',
    list: 'flex flex-col gap-3 sm:gap-4',
    compact: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4',
    table: '',
    kanban: '',
  };

  const visibleTools = filteredAndSortedTools.slice(0, visibleCount);
  const canReorder = sortBy === 'custom' && !compareMode && !bulkMode;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* באנר ראש עמוד — הולוגרפי */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-3.5 sm:p-6 md:p-8">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3 text-right" dir="rtl">
          {userLogo && (
            <img src={userLogo} alt={appName} className="w-10 h-10 sm:w-14 md:w-16 sm:h-14 md:h-16 object-contain rounded-xl bg-white/5 backdrop-blur p-1.5 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white mb-0.5 break-words">
              כלי AI שלי
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-400">
              נהל את כל כלי ה-AI שלך במקום אחד
            </p>
          </div>
          <div className="flex gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="rounded-lg sm:rounded-xl bg-white/5 border border-cyan-400/10 px-2 sm:px-4 py-1 sm:py-2.5 text-center min-w-[44px] sm:min-w-[70px]">
              <div className="text-base sm:text-2xl font-bold text-cyan-300 leading-tight">{tools.length}</div>
              <div className="text-[9px] sm:text-[11px] text-slate-500">כלים</div>
            </div>
            <div className="rounded-lg sm:rounded-xl bg-white/5 border border-cyan-400/10 px-2 sm:px-4 py-1 sm:py-2.5 text-center min-w-[44px] sm:min-w-[70px]">
              <div className="text-base sm:text-2xl font-bold text-cyan-300 leading-tight">{tools.filter(t => t.isFavorite).length}</div>
              <div className="text-[9px] sm:text-[11px] text-slate-500">מועדפים</div>
            </div>
            <div className="rounded-lg sm:rounded-xl bg-white/5 border border-cyan-400/10 px-2 sm:px-4 py-1 sm:py-2.5 text-center min-w-[44px] sm:min-w-[70px] hidden sm:block">
              <div className="text-base sm:text-2xl font-bold text-cyan-300 leading-tight">{allCategories.length}</div>
              <div className="text-[9px] sm:text-[11px] text-slate-500">קטגוריות</div>
            </div>
          </div>
        </div>
      </div>

      {/* סרגל פעולות */}
      <div className="text-right">
        {compareMode ? (
          <div className="flex items-center gap-2 rounded-2xl border border-green-200 dark:border-green-900 bg-green-50/60 dark:bg-green-950/30 p-2">
            <span className="text-xs font-medium text-green-700 dark:text-green-300 flex-1 pr-1">
              בחר עד 4 כלים להשוואה ({selectedForCompare.length}/4)
            </span>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setCompareMode(false); setSelectedForCompare([]); }}>
              ביטול
            </Button>
            <Button
              size="sm"
              onClick={() => setCompareMode(false)}
              disabled={selectedForCompare.length < 2}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-xs"
            >
              <GitCompare className="w-3.5 h-3.5 ml-1" />
              השווה
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
            <Button
              onClick={() => { setEditingTool(null); setShowForm(true); }}
              className="bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_16px_-4px_rgba(37,99,235,0.5)] flex-shrink-0 border border-cyan-400/20"
              size="sm"
            >
              <Plus className="w-4 h-4 ml-1.5" />
              <span className="hidden sm:inline">הוסף כלי</span>
            </Button>

            <Button
              variant={showRecommendations ? 'secondary' : 'outline'}
              onClick={() => setShowRecommendations(prev => !prev)}
              size="sm"
              className="flex-shrink-0"
            >
              <Sparkles className="w-4 h-4 ml-1.5" />
              <span className="hidden sm:inline">המלצות</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowTaskTemplates(true)} className="flex-shrink-0">
              <Wand2 className="w-4 h-4 ml-1.5" />
              <span className="hidden sm:inline">תבניות עבודה</span>
            </Button>

            <div className="flex-1 min-w-[20px]" />

            <div className="flex-shrink-0">
              <AdvancedFilters
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
                activeFiltersCount={activeAdvancedFiltersCount}
                categories={allCategories}
                tags={allTags}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <SlidersHorizontal className="w-4 h-4 ml-1.5" />
                  פעולות
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52" dir="rtl">
                <DropdownMenuLabel>תצוגה</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-accent' : ''}>
                  <LayoutGrid className="w-4 h-4 ml-2" /> <span className="text-sm">רשת</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-accent' : ''}>
                  <List className="w-4 h-4 ml-2" /> <span className="text-sm">רשימה</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('compact')} className={viewMode === 'compact' ? 'bg-accent' : ''}>
                  <Rows3 className="w-4 h-4 ml-2" /> <span className="text-sm">צפוף</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'bg-accent' : ''}>
                  <Table2 className="w-4 h-4 ml-2" /> <span className="text-sm">טבלה</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('kanban')} className={viewMode === 'kanban' ? 'bg-accent' : ''}>
                  <Kanban className="w-4 h-4 ml-2" /> <span className="text-sm">קאנבן</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>כלים</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setCompareMode(true)} disabled={tools.length < 2}>
                  <GitCompare className="w-4 h-4 ml-2" /> השוואת כלים
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setBulkMode(true); setSelectedForBulk([]); }}>
                  <CheckSquare className="w-4 h-4 ml-2" /> בחירה מרובה ופעולות גורפות
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDuplicatesDialog(true)}>
                  <Copy className="w-4 h-4 ml-2" /> ניקוי כפילויות
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {['grid', 'list', 'compact'].includes(viewMode) && <div className="flex-shrink-0"><CardFieldsCustomizer /></div>}

            <div className="flex-shrink-0"><ShareLinkDialog tools={filteredAndSortedTools} /></div>

            <div className="flex-shrink-0">
              <ExportImportDialog
                tools={tools}
                onImportComplete={() => queryClient.invalidateQueries(['tools'])}
              />
            </div>

            <input id="import-file" type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
        )}
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

      {/* פעולות גורפות */}
      {bulkMode && (
        <BulkActionsBar
          selectedIds={selectedForBulk}
          tools={tools}
          onClear={() => { setSelectedForBulk([]); setBulkMode(false); }}
          onSelectAll={handleSelectAllBulk}
          totalTools={filteredAndSortedTools.length}
        />
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
        masteryFilter={masteryFilter}
        onMasteryFilterChange={setMasteryFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
      />

      {/* רשימת כלים */}
      {filteredAndSortedTools.length === 0 ? (
        <EmptyState
          title={tools.length === 0 ? 'אין כלים עדיין' : 'לא נמצאו תוצאות'}
          description={tools.length === 0 ? 'התחל בהוספת כלי AI ראשון שלך, או ייבא רשימה קיימת' : 'נסה לשנות את הפילטרים או לאפס אותם'}
          actionLabel={tools.length === 0 ? 'הוסף כלי ראשון' : 'אפס פילטרים'}
          onAction={tools.length === 0 ? () => { setEditingTool(null); setShowForm(true); } : () => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedPricing('all');
            setSelectedRating(0);
            setShowFavoritesOnly(false);
            setAdvancedFilters({
              categories: [], pricing: [], subscriptionTypes: [],
              ratingRange: [0, 5], popularityRange: [1, 5], hasTags: [],
              hasSubscription: null, isFavorite: null, aiGenerated: null,
            });
          }}
          secondaryActionLabel={tools.length === 0 ? 'ייבא רשימה' : undefined}
          onSecondaryAction={tools.length === 0 ? () => document.getElementById('import-file')?.click() : undefined}
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
          onStatusChange={handleKanbanStatusChange}
        />
      ) : (
        <DragDropContext onDragEnd={handleToolReorder}>
          <Droppable droppableId="tools-collection" isDropDisabled={!canReorder}>
            {(dropProvided) => (
              <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className={gridClasses[viewMode]}>
                {visibleTools.map((tool, index) => (
                  <Draggable key={tool.id} draggableId={tool.id} index={index} isDragDisabled={!canReorder}>
                    {(dragProvided, dragSnapshot) => (
                      <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} style={dragProvided.draggableProps.style}>
                        <ToolCard
                          tool={tool}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleFavorite={handleToggleFavorite}
                          onManageSubscription={setManagingSubscription}
                          onClick={setSelectedTool}
                          isDragging={dragSnapshot.isDragging}
                          dragHandleProps={dragProvided.dragHandleProps}
                          isReorderable={canReorder}
                          isSelected={bulkMode ? selectedForBulk.includes(tool.id) : selectedForCompare.some(t => t.id === tool.id)}
                          onToggleSelect={bulkMode ? toggleBulkSelection : (compareMode ? toggleCompareSelection : null)}
                          fieldVisibility={cardFieldVisibility}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
                {filteredAndSortedTools.length > visibleCount && (
                  <div className="col-span-full flex justify-center pt-2 pb-4">
                    <Button variant="outline" size="sm" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                      טען עוד {Math.min(PAGE_SIZE, filteredAndSortedTools.length - visibleCount)} כלים
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <TaskTemplatesDialog open={showTaskTemplates} onOpenChange={setShowTaskTemplates} tools={tools} />

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
          tool={editingTool ? { ...editingTool, availableCustomCategories: allCategories } : { availableCustomCategories: allCategories }}
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