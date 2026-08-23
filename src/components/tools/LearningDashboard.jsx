import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { GraduationCap, Target, Clock, CheckCircle2, AlertCircle, Loader2, ChevronLeft, ArrowLeft, LayoutGrid, KanbanSquare, GalleryHorizontalEnd } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ToolLogo from '@/components/ToolLogo';
import moment from 'moment';
import MasteryKanban from '@/components/tools/MasteryKanban';
import MasteryGallery from '@/components/tools/MasteryGallery';
import GamificationPanel from '@/components/learning/GamificationPanel';

const VIEW_MODES = [
  { id: 'list', label: 'רשימה', icon: LayoutGrid },
  { id: 'kanban', label: 'קאנבן', icon: KanbanSquare },
  { id: 'gallery', label: 'גלריה', icon: GalleryHorizontalEnd },
];

export default function LearningDashboard({ onToolClick }) {
  const [viewMode, setViewMode] = useState('list');
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['learningPlansDashboard'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ created_by_id: user.id }, '-updated_date');
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const activePlans = plans.filter((p) => (p.progress || 0) < 100);
  const completedPlans = plans.filter((p) => (p.progress || 0) >= 100);
  const avgProgress = plans.length ? Math.round(plans.reduce((sum, p) => sum + (p.progress || 0), 0) / plans.length) : 0;

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'text-green-600';
    if (progress >= 40) return 'text-blue-600';
    if (progress > 0) return 'text-amber-600';
    return 'text-gray-400';
  };

  const getProgressBg = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 40) return 'bg-blue-500';
    if (progress > 0) return 'bg-amber-500';
    return 'bg-gray-300';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl p-4 sm:p-6">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-cyan-400/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-cyan-300" />
            </div>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-white">לוח בקרת למידה</h1>
              <p className="text-sm text-slate-400">מעקב התקדמות למידה לכל הכלים</p>
            </div>
          </div>
          {/* מתג תצוגה */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
            {VIEW_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === mode.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {viewMode === 'kanban' && <MasteryKanban onToolClick={onToolClick} />}
      {viewMode === 'gallery' && <MasteryGallery onToolClick={onToolClick} />}

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <GraduationCap className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold">{activePlans.length}</div>
            <div className="text-xs text-gray-500">בתהליך למידה</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <div className="text-2xl font-bold text-green-600">{completedPlans.length}</div>
            <div className="text-xs text-gray-500">הושלמו</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Target className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <div className="text-2xl font-bold text-purple-600">{avgProgress}%</div>
            <div className="text-xs text-gray-500">התקדמות ממוצעת</div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'list' && <GamificationPanel />}

      {viewMode !== 'list' ? null : plans.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-center">עדיין אין תוכניות למידה. פתח כלי וצור תוכנית למידה כדי להתחיל לעקוב אחר ההתקדמות.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">כלים בתהליך למידה פעיל</h3>
          {activePlans.map((plan) => {
            const tool = tools.find((t) => t.id === plan.toolId);
            const steps = plan.steps || [];
            const completedSteps = steps.filter((s) => s.isCompleted).length;
            const progress = plan.progress || 0;
            const isOverdue = plan.targetDate && new Date(plan.targetDate) < new Date() && progress < 100;

            return (
              <Card key={plan.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {tool ? <ToolLogo tool={tool} size="sm" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-gray-400" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{plan.toolName}</h4>
                        <span className={`text-lg font-bold ${getProgressColor(progress)}`}>{progress}%</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{plan.title}</p>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${getProgressBg(progress)}`} style={{ width: `${progress}%` }} />
                      </div>

                      <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {completedSteps}/{steps.length} שלבים
                        </span>
                        {plan.targetDate && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                            {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {isOverdue ? 'באיחור' : ''} {moment(plan.targetDate).format('DD/MM/YYYY')}
                          </span>
                        )}
                      </div>

                      {(() => {
                        const nextStep = steps.find((s) => !s.isCompleted);
                        if (!nextStep) return null;
                        const stepIdx = steps.indexOf(nextStep);
                        return (
                          <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/20 p-2.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                              <ArrowLeft className="w-3 h-3" />
                              השלב הבא
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-500 text-white text-[10px] font-bold">
                                {stepIdx + 1}
                              </div>
                              <span className="text-gray-700 dark:text-gray-200 font-medium truncate">{nextStep.title}</span>
                            </div>
                            {nextStep.dueDate && (
                              <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500 pr-7">
                                <Clock className="w-3 h-3" />
                                יעד: {moment(nextStep.dueDate).format('DD/MM/YYYY')}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {steps.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {steps.slice(0, 3).map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${step.isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                {step.isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[9px]">{i + 1}</span>}
                              </div>
                              <span className={`${step.isCompleted ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-300'} truncate`}>{step.title}</span>
                            </div>
                          ))}
                          {steps.length > 3 && <span className="text-xs text-gray-400 pr-6">+{steps.length - 3} שלבים נוספים</span>}
                        </div>
                      )}

                      {tool && onToolClick && (
                        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" onClick={() => onToolClick(tool)}>
                          פתח פרטי כלי
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {completedPlans.length > 0 && (
            <>
              <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 pt-2">השלמת למידה</h3>
              {completedPlans.map((plan) => (
                <Card key={plan.id} className="opacity-75">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{plan.toolName}</span>
                        <span className="text-xs text-gray-500 mr-2">— {plan.title}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">100%</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}