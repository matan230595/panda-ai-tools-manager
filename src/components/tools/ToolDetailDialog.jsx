import React, { useState } from 'react';
import { X, ExternalLink, Star, Edit, Trash2, Key, Calendar, TrendingUp, Users, Globe, Zap, CheckCircle, XCircle, Sparkles, Plus, StickyNote, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimilarTools from '@/components/tools/SimilarTools';
import ShareLinkDialog from '@/components/sharing/ShareLinkDialog';
import UserCredentialsTab from '@/components/tools/UserCredentialsTab';
import ToolTasksPanel from '@/components/tools/ToolTasksPanel';
import ToolLearningPlanPanel from '@/components/tools/ToolLearningPlanPanel';
import ToolRatingPanel from '@/components/tools/ToolRatingPanel';
import ToolUsageActivity from '@/components/tools/ToolUsageActivity';
import DriveDocsPanel from '@/components/tools/DriveDocsPanel';
import LearningReportExport from '@/components/tools/LearningReportExport';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const MASTERY_CONFIG = {
  'מתחיל': { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'מתחיל' },
  'בינוני': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', label: 'בינוני' },
  'מומחה': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'מומחה' },
};

export default function ToolDetailDialog({ tool, onClose, onEdit, onDelete, onToggleFavorite, onManageSubscription, onQuickUpdate }) {
  const queryClient = useQueryClient();
  const [quickNoteText, setQuickNoteText] = useState('');

  React.useEffect(() => {
    if (!tool?.id) return;
    (async () => {
      try {
        const user = await base44.auth.me();
        await base44.entities.UserToolRating.create({
          toolId: tool.id,
          toolName: tool.name,
          rating: 1,
          interactionType: 'click',
          userEmail: user.email,
        });
        queryClient.invalidateQueries({ queryKey: ['toolInteractions', tool.id] });
      } catch { /* התעלם משגיאות מעקב */ }
    })();
  }, [tool?.id]);

  const addQuickNote = () => {
    if (!quickNoteText.trim()) return;
    const existingNotes = tool.quickNotes || [];
    const newNote = {
      text: quickNoteText.trim(),
      timestamp: new Date().toISOString(),
    };
    onQuickUpdate?.(tool.id, { quickNotes: [...existingNotes, newNote] });
    setQuickNoteText('');
    toast.success('ההערה נשמרה');
  };

  const deleteQuickNote = (index) => {
    const existingNotes = tool.quickNotes || [];
    const updated = existingNotes.filter((_, i) => i !== index);
    onQuickUpdate?.(tool.id, { quickNotes: updated });
    toast.success('ההערה נמחקה');
  };

  const masteryConfig = MASTERY_CONFIG[tool?.masteryLevel] || MASTERY_CONFIG['מתחיל'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div
        className="bg-[#0f1318] border border-cyan-400/15 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="relative p-4 md:p-6 border-b border-cyan-400/10 bg-[#1a202d]/40">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
            aria-label="סגור חלון">
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start gap-4 ml-12 text-right">
            {tool.logo ?
              <img src={tool.logo} alt={tool.name} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-contain shadow-[0_0_20px_-4px_rgba(0,212,255,0.3)] ring-1 ring-cyan-400/20 flex-shrink-0 bg-white/5" /> :
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-blue-600/20 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl md:text-3xl font-bold text-cyan-300">{tool.name.charAt(0)}</span>
              </div>
            }
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{tool.name}</h2>
                <button
                  onClick={() => onToggleFavorite(tool)}
                  className="p-1 hover:scale-110 transition-transform"
                  aria-label={tool.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}>
                  <Star className={`w-6 h-6 ${tool.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                  {tool.category?.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  {(tool.subscriptionType || tool.pricing)?.replace(/_/g, ' ')}
                </Badge>
                {tool.priceILS > 0 &&
                  <Badge className="bg-blue-500/15 text-blue-300 border border-blue-500/20">₪{tool.priceILS.toFixed(0)}/חודש</Badge>
                }
                {tool.roiPercentage !== undefined &&
                  <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">ROI {tool.roiPercentage || 0}%</Badge>
                }
                {tool.rating > 0 &&
                  <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/20">
                    <Star className="w-3 h-3 ml-1 fill-amber-400" />
                    {tool.rating}
                  </Badge>
                }
                <Badge className={`${masteryConfig.bg} ${masteryConfig.text} border ${masteryConfig.border}`}>
                  {masteryConfig.label}
                </Badge>
              </div>

              {tool.description &&
                <p className="text-slate-400 text-sm">{tool.description}</p>
              }
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              onClick={() => window.open(tool.url, '_blank')}
              className="flex-1 bg-blue-600 hover:bg-blue-500 border border-cyan-400/20">
              <ExternalLink className="w-4 h-4 ml-2" />
              בקר באתר
            </Button>
            {tool.hasSubscription &&
              <Button variant="outline" onClick={() => onManageSubscription(tool)} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <Key className="w-4 h-4 ml-2" />
                נהל מנוי
              </Button>
            }
            <ShareLinkDialog tool={tool} />
            <Button variant="outline" onClick={() => onEdit(tool)} className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10">
              <Edit className="w-4 h-4 ml-2" />
              ערוך
            </Button>
            <Button variant="outline" onClick={() => onDelete(tool)} className="text-red-400 border-red-500/20 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4 ml-2" />
              מחק
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 xl:grid-cols-12 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger value="overview" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">סקירה</TabsTrigger>
              <TabsTrigger value="notes" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">הערות מהירות</TabsTrigger>
              <TabsTrigger value="rating" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">דירוג</TabsTrigger>
              <TabsTrigger value="use-cases" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">שימוש</TabsTrigger>
              <TabsTrigger value="pros-cons" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">יתרונות/חסרונות</TabsTrigger>
              <TabsTrigger value="integrations-links" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">אינטגרציות</TabsTrigger>
              <TabsTrigger value="details" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">פרטים</TabsTrigger>
              <TabsTrigger value="pricing" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">מחירים</TabsTrigger>
              <TabsTrigger value="credentials" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">גישה</TabsTrigger>
              <TabsTrigger value="tasks" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">משימות</TabsTrigger>
              <TabsTrigger value="learning" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">למידה</TabsTrigger>
              <TabsTrigger value="docs" className="text-slate-400 data-[state=active]:text-cyan-300 data-[state=active]:bg-cyan-400/10">Drive</TabsTrigger>
            </TabsList>

            {/* סקירה */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {tool.detailedDescription &&
                <div>
                  <h3 className="font-bold text-lg mb-3 text-white">אודות הכלי</h3>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-right">
                    {tool.detailedDescription}
                  </p>
                </div>
              }
              {tool.features?.length > 0 &&
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    תכונות עיקריות
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tool.features.map((feature, idx) =>
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-cyan-400/10 text-right">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300 leading-6">{feature}</span>
                      </div>
                    )}
                  </div>
                </div>
              }
            </TabsContent>

            {/* הערות מהירות */}
            <TabsContent value="notes" className="space-y-4 mt-6">
              <div className="rounded-xl border border-cyan-400/15 bg-[#1a202d]/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-cyan-300" />
                  <h3 className="font-semibold text-white">הערות מהירות ותובנות</h3>
                </div>
                <p className="text-xs text-slate-500">כתוב תובנות אישיות, טיפים לשימוש ורעיונות תוך כדי שאתה לומד להשתמש בכלי.</p>

                {/* הוספת הערה חדשה */}
                <div className="flex gap-2">
                  <textarea
                    value={quickNoteText}
                    onChange={(e) => setQuickNoteText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) addQuickNote(); }}
                    placeholder="כתוב הערה מהירה... (Ctrl+Enter לשמירה)"
                    className="flex-1 min-h-[60px] max-h-[120px] rounded-lg bg-white/5 border border-cyan-400/15 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 resize-none"
                  />
                  <Button
                    onClick={addQuickNote}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 border border-cyan-400/20 self-end">
                    <Plus className="w-4 h-4 ml-1" />
                    הוסף
                  </Button>
                </div>

                {/* רשימת הערות */}
                {(tool.quickNotes?.length || 0) > 0 && (
                  <div className="space-y-2 mt-3">
                    {tool.quickNotes.map((note, idx) => (
                      <div key={idx} className="group relative rounded-lg bg-white/5 border border-cyan-400/10 p-3">
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{note.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span className="text-[11px] text-slate-500">
                            {new Date(note.timestamp).toLocaleString('he-IL')}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteQuickNote(idx)}
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/15 text-slate-500 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* הערות פרטיות כלליות */}
                <div className="pt-3 border-t border-cyan-400/10">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">הערות כלליות</h4>
                  <textarea
                    defaultValue={tool.notes || tool.personalNotes || ''}
                    onBlur={(e) => onQuickUpdate?.(tool.id, { notes: e.target.value, personalNotes: e.target.value })}
                    placeholder="כתוב כאן הערות חופשיות על הכלי..."
                    className="w-full min-h-[100px] rounded-lg bg-white/5 border border-cyan-400/15 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
                  />
                  <div className="text-xs text-slate-500 mt-1">השמירה מתבצעת כשיוצאים מהשדה.</div>
                </div>
              </div>
            </TabsContent>

            {/* דירוג */}
            <TabsContent value="rating" className="space-y-4 mt-6">
              <ToolRatingPanel tool={tool} />
            </TabsContent>

            {/* שימוש */}
            <TabsContent value="use-cases" className="space-y-6 mt-6">
              <ToolUsageActivity tool={tool} />
              <div className="pt-2 border-t border-cyan-400/10">
                <h3 className="font-bold text-lg mb-3 text-white">דוגמאות שימוש</h3>
              </div>
              {tool.useCases?.length > 0 ?
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.useCases.map((useCase, idx) =>
                    <div key={idx} className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/40 p-4 md:p-5">
                      <h3 className="font-bold text-base md:text-lg mb-2 text-white">{useCase.title}</h3>
                      <p className="text-sm md:text-base text-slate-400 leading-7">{useCase.description}</p>
                    </div>
                  )}
                </div> :
                <div className="rounded-2xl border border-cyan-400/10 p-6 text-sm text-slate-500">אין דוגמאות שימוש זמינות לכלי זה.</div>
              }
            </TabsContent>

            {/* יתרונות/חסרונות */}
            <TabsContent value="pros-cons" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 md:p-5">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    יתרונות
                  </h3>
                  {tool.prosAndCons?.pros?.length > 0 ?
                    <ul className="space-y-3">
                      {tool.prosAndCons.pros.map((pro, idx) =>
                        <li key={idx} className="flex items-start gap-2 text-sm md:text-base text-slate-200">
                          <span className="text-emerald-400">✓</span>
                          <span>{pro}</span>
                        </li>
                      )}
                    </ul> :
                    <div className="text-sm text-slate-500">אין יתרונות שמורים.</div>}
                </div>
                <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-4 md:p-5">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    חסרונות
                  </h3>
                  {tool.prosAndCons?.cons?.length > 0 ?
                    <ul className="space-y-3">
                      {tool.prosAndCons.cons.map((con, idx) =>
                        <li key={idx} className="flex items-start gap-2 text-sm md:text-base text-slate-200">
                          <span className="text-red-400">✗</span>
                          <span>{con}</span>
                        </li>
                      )}
                    </ul> :
                    <div className="text-sm text-slate-500">אין חסרונות שמורים.</div>}
                </div>
              </div>
            </TabsContent>

            {/* אינטגרציות */}
            <TabsContent value="integrations-links" className="space-y-4 mt-6">
              {tool.integrations?.length > 0 ?
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.integrations.map((integration, idx) =>
                    <div key={idx} className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/40 p-4 md:p-5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{integration}</div>
                        <div className="text-sm text-slate-500">קישור ישיר לחיפוש או שימוש באינטגרציה</div>
                      </div>
                      <Button variant="outline" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${tool.name} ${integration} integration`)}`, '_blank')} className="border-cyan-400/20 text-cyan-300">
                        <ExternalLink className="w-4 h-4 ml-2" />
                        פתח
                      </Button>
                    </div>
                  )}
                </div> :
                <div className="rounded-2xl border border-cyan-400/10 p-6 text-sm text-slate-500">אין אינטגרציות שמורות לכלי זה.</div>
              }
            </TabsContent>

            {/* פרטים */}
            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-cyan-400/10">
                  <div className="font-semibold mb-1 text-white">חיסכון זמן</div>
                  <div className="text-2xl font-bold text-cyan-300">{tool.timeSavingsHours || 0} שעות</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-cyan-400/10">
                  <div className="font-semibold mb-1 text-white">הכנסה ישירה</div>
                  <div className="text-2xl font-bold text-emerald-400">₪{tool.directRevenue || 0}</div>
                </div>
                {tool.targetAudience &&
                  <div className="p-4 rounded-lg bg-white/5 border border-cyan-400/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">קהל יעד</h3>
                    </div>
                    <p className="text-sm text-slate-400">{tool.targetAudience}</p>
                  </div>
                }
                {tool.popularity &&
                  <div className="p-4 rounded-lg bg-white/5 border border-cyan-400/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                      <h3 className="font-semibold text-white">פופולריות</h3>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) =>
                        <Star key={i} className={`w-4 h-4 ${i < tool.popularity ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      )}
                    </div>
                  </div>
                }
                {tool.languagesSupported?.length > 0 &&
                  <div className="p-4 rounded-lg bg-white/5 border border-cyan-400/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">שפות נתמכות</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tool.languagesSupported.map((lang, idx) => <Badge key={idx} variant="secondary" className="text-xs bg-white/5 text-slate-300">{lang}</Badge>)}
                    </div>
                  </div>
                }
                {tool.platforms?.length > 0 &&
                  <div className="p-4 rounded-lg bg-white/5 border border-cyan-400/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-semibold text-white">פלטפורמות</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tool.platforms.map((platform, idx) => <Badge key={idx} variant="outline" className="text-xs text-slate-300 border-slate-600">{platform}</Badge>)}
                    </div>
                  </div>
                }
              </div>

              {tool.integrations?.length > 0 &&
                <div>
                  <h3 className="font-bold text-lg mb-3 text-white">אינטגרציות</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.integrations.map((integration, idx) => <Badge key={idx} variant="outline" className="text-slate-300 border-slate-600">{integration}</Badge>)}
                  </div>
                </div>
              }
              {tool.tags?.length > 0 &&
                <div>
                  <h3 className="font-bold text-lg mb-3 text-white">תגיות</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag, idx) => <Badge key={idx} className="bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">{tag}</Badge>)}
                  </div>
                </div>
              }

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cyan-400/10">
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    תאריך יצירה
                  </div>
                  <div className="font-medium text-slate-300">{new Date(tool.created_date).toLocaleDateString('he-IL')}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    עדכון אחרון
                  </div>
                  <div className="font-medium text-slate-300">{new Date(tool.updated_date).toLocaleDateString('he-IL')}</div>
                </div>
              </div>
            </TabsContent>

            {/* מחירים */}
            <TabsContent value="pricing" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/15">
                  <h4 className="font-semibold mb-1 text-white">תמחור</h4>
                  <p className="text-2xl font-bold text-cyan-300">{tool.pricing?.replace(/_/g, ' ')}</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                  <h4 className="font-semibold mb-1 text-white">סוג מנוי</h4>
                  <p className="text-2xl font-bold text-emerald-400">{tool.subscriptionType?.replace(/_/g, ' ')}</p>
                </div>
                <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
                  <h4 className="font-semibold mb-1 text-white">מחיר חודשי</h4>
                  <p className="text-2xl font-bold text-cyan-300">{tool.priceILS > 0 ? `₪${tool.priceILS}` : 'חינם'}</p>
                </div>
              </div>
              {tool.subscriptionPlans?.length > 0 &&
                <div>
                  <h3 className="font-bold text-lg mb-4 text-white">תוכניות מנוי</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tool.subscriptionPlans.map((plan, idx) =>
                      <div key={idx} className="p-5 rounded-xl border border-cyan-400/15 bg-[#1a202d]/40 hover:border-cyan-400/30 transition-colors">
                        <h4 className="font-bold text-xl mb-2 text-white">{plan.name}</h4>
                        <div className="text-3xl font-bold text-cyan-300 mb-3">
                          ${plan.priceUSD}<span className="text-sm font-normal text-slate-500">/חודש</span>
                        </div>
                        {plan.limits && <p className="text-sm text-slate-400 mb-3">{plan.limits}</p>}
                        {plan.features?.length > 0 &&
                          <ul className="space-y-2">
                            {plan.features.map((feature, fIdx) =>
                              <li key={fIdx} className="flex items-start gap-2 text-sm text-slate-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            )}
                          </ul>
                        }
                      </div>
                    )}
                  </div>
                </div>
              }
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4 mt-6">
              <UserCredentialsTab tool={tool} onSave={(patch) => onQuickUpdate?.(tool.id, { userCredentials: patch.userCredentials })} />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-6">
              <ToolTasksPanel tool={tool} />
            </TabsContent>

            <TabsContent value="learning" className="space-y-4 mt-6">
              <ToolLearningPlanPanel tool={tool} />
            </TabsContent>

            <TabsContent value="docs" className="space-y-4 mt-6">
              <DriveDocsPanel tool={tool} />
            </TabsContent>
          </Tabs>

          {/* כלים דומים */}
          <div className="mt-8 rounded-3xl border border-cyan-400/15 bg-[#1a202d]/40 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-cyan-400/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight text-white">כלים דומים והמלצות</h3>
                <p className="text-xs text-slate-500">גלה כלים דומים מהמערכת שלך או מהרשת</p>
              </div>
            </div>
            <SimilarTools currentTool={tool} onSelectTool={() => onClose()} />
          </div>
        </div>
      </div>
    </div>
  );
}