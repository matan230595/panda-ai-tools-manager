import { createClientFromRequest } from 'npm:@base44/sdk@0.8.39';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const tools = await base44.asServiceRole.entities.AiTool.filter({ created_by_id: user.id });

    if (!tools || tools.length === 0) {
      return Response.json({ error: 'אין כלים לייצוא' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');

    const headers = [
      'שם',
      'קטגוריה',
      'סטטוס תפעולי',
      'מספר שימושים',
      'שימוש אחרון',
      'דירוג',
      'תדירות שימוש',
      'עלות חודשית (₪)',
      'מנוי פעיל',
    ];

    const rows = tools.map((tool) => [
      tool.name || '',
      tool.customCategory || tool.category || '',
      tool.operationalStatus || '',
      tool.usageStats?.timesUsed ?? 0,
      tool.usageStats?.lastUsedDate
        ? new Date(tool.usageStats.lastUsedDate).toLocaleDateString('he-IL')
        : (tool.lastUsed ? new Date(tool.lastUsed).toLocaleDateString('he-IL') : ''),
      tool.rating ?? 0,
      tool.usageStats?.usageFrequency || '',
      tool.usageStats?.totalCostPerMonth ?? tool.priceILS ?? 0,
      tool.hasSubscription ? 'כן' : 'לא',
    ]);

    const title = `כלי AI - נתוני שימוש ${new Date().toLocaleDateString('he-IL')}`;

    // 1. Create a new spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [{ properties: { title: 'כלים', rightToLeft: true } }],
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      return Response.json({ error: err || 'שגיאה ביצירת הגיליון' }, { status: 500 });
    }

    const spreadsheet = await createRes.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const spreadsheetUrl = spreadsheet.spreadsheetUrl;

    // 2. Write header + rows
    const values = [headers, ...rows];
    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!writeRes.ok) {
      const err = await writeRes.text();
      return Response.json({ error: err || 'שגיאה בכתיבת הנתונים' }, { status: 500 });
    }

    // 3. Bold the header row
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
        ],
      }),
    });

    return Response.json({
      success: true,
      spreadsheetUrl,
      count: tools.length,
      message: `יוצאו ${tools.length} כלים לגיליון חדש`,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});