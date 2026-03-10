import { base44 } from '@/api/base44Client';

export async function getCurrentUser() {
  return base44.auth.me();
}

export async function listMine(entityName, sort, limit) {
  const user = await getCurrentUser();
  return base44.entities[entityName].filter({ created_by: user.email }, sort, limit);
}

export async function filterMine(entityName, filter = {}, sort, limit) {
  const user = await getCurrentUser();
  return base44.entities[entityName].filter({ ...filter, created_by: user.email }, sort, limit);
}