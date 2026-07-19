import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // List files from Drive
    if (action === 'list') {
      const query = body.query || '';
      const pageSize = body.pageSize || 20;
      let url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,iconLink,webViewLink,modifiedTime)&orderBy=modifiedTime desc&q=trashed=false`;
      if (query) {
        const escaped = query.replace(/'/g, "\\'");
        url += ` and name contains '${escaped}'`;
      }
      const res = await fetch(url, { headers: authHeader });
      const data = await res.json();
      return Response.json({ files: data.files || [] });
    }

    // Upload a file to Drive
    if (action === 'upload') {
      const { fileName, mimeType, content, folderName } = body;
      if (!fileName || !content) return Response.json({ error: 'Missing fileName or content' }, { status: 400 });

      // Find or create a folder
      let folderId = null;
      if (folderName) {
        const folderQuery = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
        const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${folderQuery}`, { headers: authHeader });
        const folderData = await folderRes.json();
        if (folderData.files && folderData.files.length > 0) {
          folderId = folderData.files[0].id;
        } else {
          const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify({ name: folderName, mimeType: 'application/vnd.google-apps.folder' }),
          });
          const folder = await createFolderRes.json();
          folderId = folder.id;
        }
      }

      // Upload file using multipart upload
      const metadata = { name: fileName };
      if (folderId) metadata.parents = [folderId];

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType || 'application/octet-stream'}\r\n\r\n` +
        content +
        closeDelimiter;

      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,iconLink,webViewLink', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary="${boundary}"` },
        body: multipartBody,
      });
      const uploaded = await uploadRes.json();
      if (!uploadRes.ok) return Response.json({ error: uploaded.error?.message || 'Upload failed' }, { status: 400 });
      return Response.json({ file: uploaded });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});