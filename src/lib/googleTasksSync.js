import { base44 } from '@/api/base44Client';

export async function syncToolTasks(tasks) {
  if (!tasks?.length) return null;
  try {
    return await base44.functions.invoke('syncGoogleTasks', { tasks });
  } catch {
    return null;
  }
}