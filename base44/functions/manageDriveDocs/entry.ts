import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const MAIN_FOLDER_NAME = 'AI Tools Manager';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DOCS_URL = 'https://docs.googleapis.com/v1/documents';

async function getOrCreateFolder(authHeader, name, parentId) {
  let q = `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) q += ` and '${parentId}' in parents`;
  const folderRes = await fetch(`${DRIVE_FILES_URL}?q=${encodeURIComponent(q)}`, { headers: authHeader });
  const folderData = await folderRes.json();
  if (folderData.files && folderData.files.length > 0) return folderData.files[0].id;

  const metadata = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) metadata.parents = [parentId];
  const createRes = await fetch(DRIVE_FILES_URL, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify(metadata),
  });
  const folder = await createRes.json();
  return folder.id;
}

async function getMainFolderId(authHeader) {
  return getOrCreateFolder(authHeader, MAIN_FOLDER_NAME);
}

async function getToolFolderId(authHeader, toolName) {
  const mainId = await getMainFolderId(authHeader);
  const safeName = (toolName || 'כלי כללי').replace(/[/\\]/g, '-');
  return getOrCreateFolder(authHeader, safeName, mainId);
}

// Convert Google Docs API document to plain text
function docToText(doc) {
  if (!doc.body || !doc.body.content) return '';
  return doc.body.content
    .filter((el) => el.paragraph)
    .map((el) => {
      const text = (el.paragraph.elements || [])
        .map((e) => e.textRun?.content || '')
        .join('');
      return text;
    })
    .join('\n');
}

// Convert plain text to Google Docs batchUpdate requests
function textToBatchUpdateRequests(text) {
  return [
    {
      insertText: {
        location: { index: 1 },
        text,
      },
    },
  ];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const authHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // List files from a tool's folder (or global search)
    if (action === 'list') {
      const query = body.query || '';
      const pageSize = body.pageSize || 20;
      let url = `${DRIVE_FILES_URL}?pageSize=${pageSize}&fields=files(id,name,mimeType,iconLink,webViewLink,modifiedTime)&orderBy=modifiedTime desc&q=trashed=false`;
      if (query) {
        const escaped = query.replace(/'/g, "\\'");
        url += ` and name contains '${escaped}'`;
      }
      const res = await fetch(url, { headers: authHeader });
      const data = await res.json();
      return Response.json({ files: data.files || [] });
    }

    // List files inside a specific tool folder
    if (action === 'listToolDocs') {
      const folderId = await getToolFolderId(authHeader, body.toolName);
      const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
      const res = await fetch(`${DRIVE_FILES_URL}?pageSize=50&q=${q}&fields=files(id,name,mimeType,iconLink,webViewLink,modifiedTime)&orderBy=modifiedTime desc`, { headers: authHeader });
      const data = await res.json();
      return Response.json({ files: data.files || [] });
    }

    // Create a new Google Doc (editable) inside the tool's folder
    if (action === 'createDoc') {
      const { toolName, docName, content } = body;
      if (!docName) return Response.json({ error: 'Missing docName' }, { status: 400 });

      const folderId = await getToolFolderId(authHeader, toolName);

      // Create the Google Doc file
      const createRes = await fetch(DRIVE_FILES_URL, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          name: docName,
          mimeType: 'application/vnd.google-apps.document',
          parents: [folderId],
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok) return Response.json({ error: created.error?.message || 'Create failed' }, { status: 400 });

      // If content provided, insert it via Docs API
      if (content) {
        const docsAuthHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
        const batchRes = await fetch(`${DOCS_URL}/${created.id}:batchUpdate`, {
          method: 'POST',
          headers: docsAuthHeader,
          body: JSON.stringify({ requests: textToBatchUpdateRequests(content) }),
        });
        if (!batchRes.ok) {
          const batchErr = await batchRes.json();
          return Response.json({ error: batchErr.error?.message || 'Content insert failed' }, { status: 400 });
        }
      }

      // Fetch full file metadata to return
      const fileRes = await fetch(`${DRIVE_FILES_URL}/${created.id}?fields=id,name,mimeType,iconLink,webViewLink`, { headers: authHeader });
      const file = await fileRes.json();
      return Response.json({ file });
    }

    // Get the content of a Google Doc
    if (action === 'getDocContent') {
      const { fileId } = body;
      if (!fileId) return Response.json({ error: 'Missing fileId' }, { status: 400 });
      const res = await fetch(`${DOCS_URL}/${fileId}`, { headers: authHeader });
      const doc = await res.json();
      if (!res.ok) return Response.json({ error: doc.error?.message || 'Failed to fetch content' }, { status: 400 });
      return Response.json({ content: docToText(doc), title: doc.title });
    }

    // Update the content of a Google Doc (replace all text)
    if (action === 'updateDocContent') {
      const { fileId, content } = body;
      if (!fileId) return Response.json({ error: 'Missing fileId' }, { status: 400 });

      // First, get the current document to find its end index
      const docRes = await fetch(`${DOCS_URL}/${fileId}`, { headers: authHeader });
      const doc = await docRes.json();
      if (!docRes.ok) return Response.json({ error: doc.error?.message || 'Failed to fetch doc' }, { status: 400 });

      // Calculate total length of existing content
      const existingText = docToText(doc);
      const requests = [];

      // Delete existing content (if any)
      if (existingText.length > 0) {
        requests.push({
          deleteContentRange: {
            range: { startIndex: 1, endIndex: existingText.length + 1 },
          },
        });
      }

      // Insert new content
      if (content) {
        requests.push({
          insertText: {
            location: { index: 1 },
            text: content,
          },
        });
      }

      if (requests.length > 0) {
        const batchRes = await fetch(`${DOCS_URL}/${fileId}:batchUpdate`, {
          method: 'POST',
          headers: authHeader,
          body: JSON.stringify({ requests }),
        });
        const batchData = await batchRes.json();
        if (!batchRes.ok) return Response.json({ error: batchData.error?.message || 'Update failed' }, { status: 400 });
      }

      return Response.json({ success: true });
    }

    // Upload a raw file (binary/text) to a tool's folder
    if (action === 'upload') {
      const { fileName, mimeType, content, toolName } = body;
      if (!fileName || !content) return Response.json({ error: 'Missing fileName or content' }, { status: 400 });

      let folderId = null;
      if (toolName) {
        folderId = await getToolFolderId(authHeader, toolName);
      }

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