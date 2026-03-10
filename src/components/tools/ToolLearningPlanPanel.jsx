import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function ToolLearningPlanPanel({ tool }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('תוכנית למידה');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [steps, setSteps] = useState([
    { title: 'סרטון הדרכה', description: '', dueDate: '', isCompleted: false },
    { title: 'ניסוי ראשוני', description: '', dueDate: '', isCompleted: false },
    { title: 'פרויקט עצמאי', description: '', dueDate: '', isCompleted: false },
  ]);

  const { data: plans = [] } = useQuery({
    queryKey: ['learningPlans', tool.id],
    queryFn: () => base44.entities.ToolLearningPlan.filter({ toolId: tool.id }),
    initialData: [],
  });

  const currentPlan = plans[0];

  const savePlan = useMutation({
    mutationFn: async (payload) => {
      if (currentPlan?.id) {
        return base44.entities.ToolLearningPlan.update(currentPlan.id, payload);
      }
      return base44.entities.ToolLearningPlan.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPlans', tool.id] });
      toast.success('תוכנית הלמידה נשמרה');
    },
  });

  const deletePlan = useMutation({
    mutationFn: () => base44.entities.ToolLearningPlan.delete(currentPlan.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPlans', tool.id] });
      toast.success('תוכנית הלמידה נמחקה');
    },
  });

  const effectiveSteps = currentPlan?.steps || steps;
  const completedSteps = effectiveSteps.filter((step) => step.isCompleted).length;
  const progress = effectiveSteps.length ? Math.round((completedSteps / effectiveSteps.length) * 100) : 0;

  const draftSteps = currentPlan?.id ? currentPlan.steps : steps;

  const updateExistingStep = async (index, patch) => {
    if (!currentPlan?.id) return;
    const updatedSteps = currentPlan.steps.map((step, stepIndex) => (
      stepIndex === index ? { ...step, ...patch } : step
    ));
    const updatedProgress = updatedSteps.length ? Math.round((updatedSteps.filter((step) => step.isCompleted).length / updatedSteps.length) * 100) : 0;
    await base44.entities.ToolLearningPlan.update(currentPlan.id, { ...currentPlan, steps: updatedSteps, progress: updatedProgress });
    queryClient.invalidateQueries({ queryKey: ['learningPlans', tool.id] });
  };

  const saveDraftPlan = () => {
    const normalizedSteps = steps.filter((step) => step.title.trim());
    if (!title.trim()) {
      toast.error('יש להזין כותרת לתוכנית');
      return;
    }

    const nextProgress = normalizedSteps.length ? Math.round((normalizedSteps.filter((step) => step.isCompleted).length / normalizedSteps.length) * 100) : 0;
    savePlan.mutate({
      toolId: tool.id,
      toolName: tool.name,
      title,
      description,
      targetDate,
      steps: normalizedSteps,
      progress: nextProgress,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-4 space-y-4">
        <div className="space-y-2">
          <Label>שם תוכנית הלמידה</Label>
          <Input value={currentPlan?.title || title} onChange={(e) => currentPlan ? null : setTitle(e.target.value)} disabled={!!currentPlan} />
        </div>
        <div className="space-y-2">
          <Label>תיאור</Label>
          <Textarea value={currentPlan?.description || description} onChange={(e) => currentPlan ? null : setDescription(e.target.value)} disabled={!!currentPlan} rows={3} />
        </div>
        <div className="space-y-2">
          <Label>תאריך יעד כללי</Label>
          <Input type="date" value={currentPlan?.targetDate || targetDate} onChange={(e) => currentPlan ? null : setTargetDate(e.target.value)} disabled={!!currentPlan} />
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold">התקדמות בלמידה</div>
            <div className="text-sm text-gray-500">{progress}% הושלם</div>
          </div>
          <div className="w-40">
            <Progress value={progress} />
          </div>
        </div>

        <div className="space-y-3">
          {draftSteps.map((step, index) => (
            <div key={index} className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3 space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={step.isCompleted}
                  onCheckedChange={(checked) => {
                    if (currentPlan) {
                      updateExistingStep(index, { isCompleted: !!checked });
                    } else {
                      setSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, isCompleted: !!checked } : item));
                    }
                  }}
                />
                <Input
                  value={step.title}
                  onChange={(e) => {
                    if (currentPlan) return;
                    setSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item));
                  }}
                  disabled={!!currentPlan}
                  placeholder="שם השלב"
                />
                {!currentPlan && (
                  <Button variant="ghost" size="icon" onClick={() => setSteps((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
              <Textarea
                value={step.description || ''}
                onChange={(e) => {
                  if (currentPlan) return;
                  setSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, description: e.target.value } : item));
                }}
                disabled={!!currentPlan}
                placeholder="מה עושים בשלב הזה?"
                rows={2}
              />
              <Input
                type="date"
                value={step.dueDate || ''}
                onChange={(e) => {
                  if (currentPlan) return;
                  setSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, dueDate: e.target.value } : item));
                }}
                disabled={!!currentPlan}
              />
            </div>
          ))}
        </div>

        {!currentPlan && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setSteps((prev) => [...prev, { title: '', description: '', dueDate: '', isCompleted: false }])}>
              <Plus className="w-4 h-4 ml-2" />
              הוסף שלב
            </Button>
            <Button onClick={saveDraftPlan}>שמור תוכנית</Button>
          </div>
        )}

        {currentPlan && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="text-red-600" onClick={() => deletePlan.mutate()}>
              <Trash2 className="w-4 h-4 ml-2" />
              מחק תוכנית
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}