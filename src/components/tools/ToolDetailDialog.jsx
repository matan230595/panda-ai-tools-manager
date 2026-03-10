import React, { Suspense } from 'react';
import { X, ExternalLink, Star, Edit, Trash2, Key, Calendar, TrendingUp, Users, Globe, Zap, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolLogo from '@/components/ToolLogo';
import SimilarTools from '@/components/tools/SimilarTools';
import UserCredentialsTab from '@/components/tools/UserCredentialsTab';
import ToolTasksPanel from '@/components/tools/ToolTasksPanel';
import ToolLearningPlanPanel from '@/components/tools/ToolLearningPlanPanel';

export default function ToolDetailDialog({ tool, onClose, onEdit, onDelete, onToggleFavorite, onManageSubscription, onQuickUpdate }) {
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 ml-12">
             {tool.logo ? (
               <img src={tool.logo} alt={tool.name} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-contain shadow-md flex-shrink-0" />
             ) : (
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                 <span className="text-2xl md:text-3xl font-bold text-white">{tool.name.charAt(0)}</span>
               </div>
             )}
             <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{tool.name}</h2>
                <button
                  onClick={() => onToggleFavorite(tool)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      tool.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={categoryColors[tool.category] || 'bg-gray-100'}>
                  {tool.category?.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline">{tool.subscriptionType || tool.pricing}</Badge>
                {tool.priceILS > 0 && (
                  <Badge variant="secondary">₪{tool.priceILS.toFixed(0)}/חודש</Badge>
                )}
                {tool.roiPercentage !== undefined && (
                  <Badge className="bg-green-100 text-green-800">ROI {tool.roiPercentage || 0}%</Badge>
                )}
                {tool.rating > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 ml-1 fill-yellow-400" />
                    {tool.rating}
                  </Badge>
                )}
              </div>

              {tool.description && (
                <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => window.open(tool.url, '_blank')}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              בקר באתר
            </Button>
            {tool.hasSubscription && (
              <Button
                variant="outline"
                onClick={() => onManageSubscription(tool)}
                className="border-green-500 text-green-600"
              >
                <Key className="w-4 h-4 ml-2" />
                נהל מנוי
              </Button>
            )}
            <Button variant="outline" onClick={() => onEdit(tool)}>
              <Edit className="w-4 h-4 ml-2" />
              ערוך
            </Button>
            <Button variant="outline" onClick={() => onDelete(tool)} className="text-red-600">
              <Trash2 className="w-4 h-4 ml-2" />
              מחק
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">סקירה</TabsTrigger>
              <TabsTrigger value="details">פרטים</TabsTrigger>
              <TabsTrigger value="pricing">מחירים</TabsTrigger>
              <TabsTrigger value="credentials">👤 גישה</TabsTrigger>
              <TabsTrigger value="tasks">משימות</TabsTrigger>
              <TabsTrigger value="learning">למידה</TabsTrigger>
              <TabsTrigger value="notes">הערות</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Detailed Description */}
              {tool.detailedDescription && (
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-500" />
                    אודות הכלי
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {tool.detailedDescription}
                  </p>
                </div>
              )}

              {/* Features */}
              {tool.features?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    תכונות עיקריות
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Use Cases */}
              {tool.useCases?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">דוגמאות שימוש</h3>
                  <div className="space-y-3">
                    {tool.useCases.map((useCase, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                        <h4 className="font-semibold mb-1">{useCase.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{useCase.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pros & Cons */}
              {(tool.prosAndCons?.pros?.length > 0 || tool.prosAndCons?.cons?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.prosAndCons.pros?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        יתרונות
                      </h3>
                      <ul className="space-y-2">
                        {tool.prosAndCons.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tool.prosAndCons.cons?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-red-600">
                        <XCircle className="w-5 h-5" />
                        חסרונות
                      </h3>
                      <ul className="space-y-2">
                        {tool.prosAndCons.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-red-500">✗</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="font-semibold mb-1">חיסכון זמן</div>
                  <div className="text-2xl font-bold text-indigo-600">{tool.timeSavingsHours || 0} שעות</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="font-semibold mb-1">הכנסה ישירה</div>
                  <div className="text-2xl font-bold text-green-600">₪{tool.directRevenue || 0}</div>
                </div>
                {/* Target Audience */}
                {tool.targetAudience && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-semibold">קהל יעד</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tool.targetAudience}</p>
                  </div>
                )}

                {/* Popularity */}
                {tool.popularity && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold">פופולריות</h3>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < tool.popularity ? 'fill-orange-400 text-orange-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {tool.languagesSupported?.length > 0 && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">שפות נתמכות</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tool.languagesSupported.map((lang, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platforms */}
                {tool.platforms?.length > 0 && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-purple-500" />
                      <h3 className="font-semibold">פלטפורמות</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tool.platforms.map((platform, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{platform}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Integrations */}
              {tool.integrations?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">אינטגרציות</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.integrations.map((integration, idx) => (
                      <Badge key={idx} variant="outline">{integration}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tool.tags?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">תגיות</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag, idx) => (
                      <Badge key={idx} className="bg-indigo-100 text-indigo-800">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    תאריך יצירה
                  </div>
                  <div className="font-medium">{new Date(tool.created_date).toLocaleDateString('he-IL')}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    עדכון אחרון
                  </div>
                  <div className="font-medium">{new Date(tool.updated_date).toLocaleDateString('he-IL')}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6 mt-6">
              {/* Basic Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-1">תמחור</h4>
                  <p className="text-2xl font-bold text-indigo-600">{tool.pricing}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold mb-1">סוג מנוי</h4>
                  <p className="text-2xl font-bold text-green-600">{tool.subscriptionType}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold mb-1">מחיר חודשי</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {tool.priceILS > 0 ? `₪${tool.priceILS}` : 'חינם'}
                  </p>
                </div>
              </div>

              {/* Subscription Plans */}
              {tool.subscriptionPlans?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4">תוכניות מנוי</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tool.subscriptionPlans.map((plan, idx) => (
                      <div key={idx} className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                        <h4 className="font-bold text-xl mb-2">{plan.name}</h4>
                        <div className="text-3xl font-bold text-indigo-600 mb-3">
                          ${plan.priceUSD}
                          <span className="text-sm font-normal text-gray-500">/חודש</span>
                        </div>
                        {plan.limits && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{plan.limits}</p>
                        )}
                        {plan.features?.length > 0 && (
                          <ul className="space-y-2">
                            {plan.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4 mt-6">
              <UserCredentialsTab 
                tool={tool} 
                onSave={(patch) => onQuickUpdate?.(tool.id, { userCredentials: patch.userCredentials })}
              />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-6">
              <ToolTasksPanel tool={tool} />
            </TabsContent>

            <TabsContent value="learning" className="space-y-4 mt-6">
              <ToolLearningPlanPanel tool={tool} />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-6">
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold mb-2">הערות פרטיות</h3>
                <textarea
                  defaultValue={tool.notes || tool.personalNotes || ''}
                  onBlur={(e) => onQuickUpdate?.(tool.id, { notes: e.target.value, personalNotes: e.target.value })}
                  placeholder="כתוב כאן הערות חופשיות על הכלי..."
                  className="w-full min-h-[140px] rounded-lg border bg-white dark:bg-gray-900 p-3 text-sm"
                />
                <div className="text-xs text-gray-500 mt-2">השמירה מתבצעת כשיוצאים מהשדה.</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* כלים דומים */}
        <details className="border-t border-gray-200 dark:border-gray-700">
          <summary className="p-6 font-bold text-lg cursor-pointer flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Sparkles className="w-5 h-5 text-purple-500" />
            כלים דומים והמלצות
          </summary>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <SimilarTools 
              currentTool={tool}
              onSelectTool={(selectedTool) => {
                onClose();
              }}
            />
          </div>
        </details>
      </div>
    </div>
  );
}