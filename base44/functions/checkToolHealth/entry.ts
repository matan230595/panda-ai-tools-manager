import { createClientFromRequest } from 'npm:@base44/sdk';

function getSafeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    const host = url.hostname.toLowerCase().replace(/\\.$/, '');
    const privateHost = host === 'localhost' || host === '::1' || host.endsWith('.localhost') || host.endsWith('.local') || /^(0|10|127)\\./.test(host) || /^169\\.254\\./.test(host) || /^192\\.168\\./.test(host) || /^172\\.(1[6-9]|2\\d|3[01])\\./.test(host);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || privateHost) return null;
    if (url.port && !['80', '443'].includes(url.port)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const tools = await base44.asServiceRole.entities.AiTool.filter({ created_by_id: user.id }, 'name', 100);

    const results = [];
    for (const tool of tools) {
      const safeUrl = getSafeUrl(tool.url);
      if (!tool.url) {
        results.push({ toolId: tool.id, toolName: tool.name, url: null, status: 'no_url' });
        continue;
      }
      if (!safeUrl) {
        results.push({ toolId: tool.id, toolName: tool.name, url: tool.url, status: 'invalid_url' });
        continue;
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(safeUrl, {
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
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to check tool health' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});