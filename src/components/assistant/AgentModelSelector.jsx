import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const PROVIDERS = [
  { id: 'groq', name: 'Groq', tier: 'free' },
  { id: 'gemini', name: 'Google Gemini', tier: 'free' },
  { id: 'mistral', name: 'Mistral AI', tier: 'free' },
  { id: 'cohere', name: 'Cohere', tier: 'free' },
  { id: 'huggingface', name: 'Hugging Face', tier: 'free' },
  { id: 'together', name: 'Together AI', tier: 'free' },
  { id: 'ollama', name: 'Ollama (מקומי)', tier: 'free' },
  { id: 'localaib', name: 'LocalAI (מקומי)', tier: 'free' },
  { id: 'anthropic', name: 'Anthropic Claude', tier: 'paid' },
  { id: 'openai', name: 'OpenAI GPT-4o', tier: 'paid' },
];

export default function AgentModelSelector() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        const list = await base44.entities.Settings.filter({ created_by_id: user.id });
        return list[0] || null;
      } catch {
        return null;
      }
    },
  });

  const updateModel = useMutation({
    mutationFn: async (modelId) => {
      const user = await getCurrentUser();
      if (settings?.id) {
        return base44.entities.Settings.update(settings.id, { preferredModel: modelId });
      }
      return base44.entities.Settings.create({ preferredModel: modelId, created_by_id: user.id });
    },
    onSuccess: (_data, modelId) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      const provider = PROVIDERS.find((p) => p.id === modelId);
      toast.success(`מודל השפה הוחלף ל-${provider?.name || modelId}`);
    },
    onError: () => toast.error('שגיאה בהחלפת המודל'),
  });

  const current = PROVIDERS.find((p) => p.id === settings?.preferredModel) || PROVIDERS[0];
  const freeModels = PROVIDERS.filter((p) => p.tier === 'free');
  const paidModels = PROVIDERS.filter((p) => p.tier === 'paid');

  const renderItem = (provider) => (
    <DropdownMenuItem
      key={provider.id}
      onClick={() => updateModel.mutate(provider.id)}
      className="flex items-center justify-between gap-2"
    >
      <span>{provider.name}</span>
      {provider.id === current.id && <Check className="w-4 h-4 text-indigo-600" />}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 text-xs md:text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          מודל: {current.name}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" dir="rtl" className="w-56">
        <DropdownMenuLabel>בחר מודל שפה</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-green-600 text-xs font-semibold">🆓 חינמיים</DropdownMenuLabel>
        {freeModels.map(renderItem)}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-orange-600 text-xs font-semibold">💳 בתשלום</DropdownMenuLabel>
        {paidModels.map(renderItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}