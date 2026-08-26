import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CONNECTOR_ID = '6a8ea70f39dbfd8eb27f4dbc';
const TASKS_URL = 'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    if (body.action === 'status') {
      const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=1', { headers });
      if (!response.ok) return Response.json({ error: 'Google Tasks connection unavailable' }, { status: 502 });
      return Response.json({ connected: true });
    }

    const tasks = Array.isArray(body.tasks) ? body.tasks : [];
    if (!tasks.length) return Response.json({ error: 'No tasks to sync' }, { status: 400 });

    const synced = [];
    for (const task of tasks) {
      const payload = {
        title: `${task.toolName ? `${task.toolName}: ` : ''}${task.title}`,
        notes: [task.description, task.priority ? `עדיפות: ${task.priority}` : null].filter(Boolean).join('\n'),
        due: task.dueDate ? `${task.dueDate}T00:00:00.000Z` : undefined,
        status: task.isCompleted || task.status === 'done' ? 'completed' : 'needsAction',
      };
      const endpoint = task.googleTaskId ? `${TASKS_URL}/${task.googleTaskId}` : TASKS_URL;
      const response = await fetch(endpoint, {
        method: task.googleTaskId ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) return Response.json({ error: await response.text() || 'Failed to sync task' }, { status: 502 });
      const googleTask = await response.json();
      if (task.id && googleTask.id && task.googleTaskId !== googleTask.id) {
        await base44.entities.ToolTask.update(task.id, { googleTaskId: googleTask.id });
      }
      synced.push(task.id);
    }

    return Response.json({ success: true, synced: synced.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}