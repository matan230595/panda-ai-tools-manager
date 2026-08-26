import { createClientFromRequest } from 'npm:@base44/sdk';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const tools = await base44.asServiceRole.entities.AiTool.filter({ created_by_id: user.id }, 'name', 100);

    const results = [];
    for (const tool of tools) {
      if (!tool.url) {
        results.push({ toolId: tool.id, toolName: tool.name, url: null, status: 'no_url' });
        continue;
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(tool.url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeoutId);
        results.push({
          toolId: tool.id,
          toolName: tool.name,
          url: tool.url,
          status: res.ok ? 'active' : 'warning',
          statusCode: res.status,
        });
      } catch (e) {
        results.push({
          toolId: tool.id,
          toolName: tool.name,
          url: tool.url,
          status: 'down',
          error: e.message,
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});