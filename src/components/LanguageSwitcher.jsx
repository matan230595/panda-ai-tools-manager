import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const user = await getCurrentUser();
      const list = await base44.entities.Settings.filter({ created_by: user.email });
      return list[0] || null;
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: async (language) => {
      if (settings?.id) {
        return base44.entities.Settings.update(settings.id, { language });
      } else {
        return base44.entities.Settings.create({ language });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      document.documentElement.lang = settings?.language === 'en' ? 'en' : 'he';
    }
  });

  const currentLanguage = settings?.language || 'he';

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={currentLanguage === 'he' ? 'default' : 'outline'}
        size="sm"
        onClick={() => updateLanguageMutation.mutate('he')}
        disabled={updateLanguageMutation.isPending}
        className="text-xs sm:text-sm"
      >
        עברית
      </Button>
      <Button
        variant={currentLanguage === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => updateLanguageMutation.mutate('en')}
        disabled={updateLanguageMutation.isPending}
        className="text-xs sm:text-sm"
      >
        English
      </Button>
    </div>
  );
}