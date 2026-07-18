import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
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
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ toolId: tool.id, created_by_id: user.id });
    },
    initialData: [],
  });

  const currentPlan = plans[0];

  useEffect(() => {
    if (!currentPlan) return;
    setTitle(currentPlan.title || 'תוכנית למידה');
    setDescription(currentPlan.description || '');
    setTargetDate(currentPlan.targetDate || '');
    setSteps(currentPlan.steps || []);
  }, [currentPlan]);

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

  const effectiveSteps = steps;
  const completedSteps = effectiveSteps.filter((step) => step.isCompleted).length;
  const progress = effectiveSteps.length ? Math.round((completedSteps / effectiveSteps.length) * 100) : 0;

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
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>תיאור</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="space-y-2">
          <Label>תאריך יעד כללי</Label>
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
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
          {steps.map((step, index) => (
            <div key={index} className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3 space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={step.isCompleted}
                  onCheckedChange={(checked) => {
                    setSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, isCompleted: !!checked } : item));
                  }}
                />
                <Input
                  value={step.title}
                  onChange={(e) => {
                    setSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item));
                  }}
                  placeholder="שם השלב"
                />
                <Button variant="ghost" size="icon" onClick={() => setSteps((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <Textarea
                value={step.description || ''}
                onChange={(e) => {
                  setSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, description: e.target.value } : item));
                }}
                placeholder="מה עושים בשלב הזה?"
                rows={2}
              />
              <Input
                type="date"
                value={step.dueDate || ''}
                onChange={(e) => {
                  setSteps((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, dueDate: e.target.value } : item));
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button variant="outline" onClick={() => setSteps((prev) => [...prev, { title: '', description: '', dueDate: '', isCompleted: false }])}>
            <Plus className="w-4 h-4 ml-2" />
            הוסף שלב
          </Button>
          <Button onClick={saveDraftPlan}>שמור תוכנית</Button>
          {currentPlan && (
            <Button variant="outline" className="text-red-600" onClick={() => deletePlan.mutate()}>
              <Trash2 className="w-4 h-4 ml-2" />
              מחק תוכנית
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}