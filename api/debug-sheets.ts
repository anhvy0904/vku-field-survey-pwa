import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req: any, res: any) {
  // Only allow GET for simple browser debugging
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET /api/debug-sheets to run the debug test.' });
  }

  try {
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME;

    if (!serviceEmail || !privateKey || !sheetId) {
      return res.status(500).json({ 
        success: false,
        error: 'Missing credentials. Check Vercel Environment Variables.' 
      });
    }

    const serviceAccountAuth = new JWT({
      email: serviceEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    
    let sheet;
    if (sheetName) {
      sheet = doc.sheetsByTitle[sheetName];
      if (!sheet) {
        return res.status(404).json({ success: false, error: `Tab "${sheetName}" not found.` });
      }
    } else {
      sheet = doc.sheetsByIndex[0];
    }

    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    if (!headers || headers.length === 0) {
      return res.status(400).json({ success: false, error: 'Spreadsheet has no headers on Row 1.' });
    }

    // Attempt to write the DEBUG-TEST-001 survey
    const newRow: Record<string, string | number> = {};
    let mappedKeys = 0;
    
    headers.forEach(header => {
      const h = header.trim().toLowerCase();
      if (h === 'id' || h === 'inspection id' || h === 'survey id') {
        newRow[header] = 'DEBUG-TEST-001';
        mappedKeys++;
      } else if (h === 'timestamp' || h === 'date') {
        newRow[header] = new Date().toISOString();
        mappedKeys++;
      } else if (h === 'building') {
        newRow[header] = 'A';
        mappedKeys++;
      } else if (h === 'floor') {
        newRow[header] = '3';
        mappedKeys++;
      } else if (h === 'room' || h === 'room #') {
        newRow[header] = '302';
        mappedKeys++;
      } else if (h === 'category') {
        newRow[header] = 'Projector';
        mappedKeys++;
      } else if (h === 'rating' || h === 'condition rating') {
        newRow[header] = 2;
        mappedKeys++;
      } else if (h === 'defect notes' || h === 'notes') {
        newRow[header] = 'Projector has no signal';
        mappedKeys++;
      }
    });

    if (mappedKeys === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Headers found, but none match required fields (ID, Building, etc).',
        foundHeaders: headers
      });
    }

    await sheet.addRow(newRow);

    return res.status(200).json({ 
      success: true, 
      message: 'DEBUG-TEST-001 successfully written to Google Sheets.',
      mappedRow: newRow
    });

  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    return res.status(statusCode).json({ 
      success: false,
      error: { 
        type: 'GOOGLE_SHEETS_API_ERROR', 
        message: error.message 
      } 
    });
  }
}
