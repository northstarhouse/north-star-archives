/**
 * Google Apps Script for North Star House Archives
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet (or use an existing one)
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click "Deploy"
 * 9. Copy the Web App URL
 * 10. Paste the URL into GOOGLE_SCRIPT_URL in src/app.jsx
 *
 * OPTIONAL:
 * - If you want to target a specific spreadsheet (not the bound sheet),
 *   set SHEET_ID below to the Google Sheet ID.
 *
 * SHEET STRUCTURE:
 * The script will automatically create the header row on first use.
 * Columns: id, title, aboutText, images, from, designer, maker, makerRole,
 *          portfolioTitle, mediumMaterials, measurements, keywords,
 *          collection, objectType, objectNumber, createdAt, updatedAt
 */

const SHEET_ID = '1qO5ZmBWJb0DqPRN_S2h7-7W9MhLdFg7ZGXluwvFWDYk';
const USE_BOUND_SPREADSHEET = true;
const SHEET_NAME = 'Archives';
const IMAGE_FOLDER_ID = '1qcuRXPEICe9ZZNi4cWkcTNJAAL9cCxGz';
const IMAGE_FOLDER_NAME = 'North Star Archives Images';

// Column headers matching the object schema
const HEADERS = [
  'id',
  'title',
  'aboutText',
  'images',
  'from',
  'designer',
  'maker',
  'makerRole',
  'portfolioTitle',
  'mediumMaterials',
  'measurements',
  'keywords',
  'collection',
  'objectType',
  'objectNumber',
  'createdAt',
  'updatedAt'
];

/**
 * Get or create the Archives sheet
 */
function getSheet() {
  let ss = null;

  if (USE_BOUND_SPREADSHEET) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } else if (SHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(SHEET_ID);
    } catch (error) {
      Logger.log('openById failed, falling back to active spreadsheet: ' + error);
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    const sheets = ss.getSheets();
    if (sheets.length > 0) {
      sheet = sheets[0];
      Logger.log(`Sheet "${SHEET_NAME}" not found. Using first sheet: ${sheet.getName()}`);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
      // Add headers
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

/**
 * Get or create the image folder in Drive
 */
function getImageFolder() {
  if (IMAGE_FOLDER_ID) {
    return DriveApp.getFolderById(IMAGE_FOLDER_ID);
  }
  const folders = DriveApp.getFoldersByName(IMAGE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(IMAGE_FOLDER_NAME);
}

/**
 * Handle GET requests - fetch all objects
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getAll') {
      const objects = getAllObjects();
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, objects: objects }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests - create, update, delete
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    let result;

    switch (action) {
      case 'create':
        result = createObject(data.object);
        break;
      case 'update':
        result = updateObject(data.object);
        break;
      case 'delete':
        result = deleteObject(data.id);
        break;
      case 'uploadImage':
        result = uploadImage(data);
        break;
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, result: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get all objects from the sheet
 */
function getAllObjects() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return []; // Only headers or empty
  }

  const headers = data[0];
  const objects = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      let value = row[j];

      // Parse JSON fields
      if (header === 'images' || header === 'keywords') {
        try {
          value = value ? JSON.parse(value) : [];
        } catch (e) {
          value = [];
        }
      }

      obj[header] = value;
    }

    // Only include rows with an ID
    if (obj.id) {
      objects.push(obj);
    }
  }

  return objects;
}

/**
 * Create a new object
 */
function createObject(obj) {
  const sheet = getSheet();

  // Generate ID if not provided
  if (!obj.id) {
    obj.id = new Date().getTime().toString();
  }

  // Set timestamps
  const now = new Date().toISOString();
  obj.createdAt = obj.createdAt || now;
  obj.updatedAt = now;

  // Create row data
  const rowData = HEADERS.map(header => {
    const value = obj[header];

    // Stringify arrays
    if (header === 'images' || header === 'keywords') {
      return JSON.stringify(value || []);
    }

    return value || '';
  });

  // Append row
  sheet.appendRow(rowData);

  return obj;
}

/**
 * Update an existing object
 */
function updateObject(obj) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  // Find the row with matching ID
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === obj.id) {
      rowIndex = i + 1; // +1 because sheets are 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    // Object not found, create it instead
    return createObject(obj);
  }

  // Update timestamp
  obj.updatedAt = new Date().toISOString();

  // Create row data
  const rowData = HEADERS.map(header => {
    const value = obj[header];

    // Stringify arrays
    if (header === 'images' || header === 'keywords') {
      return JSON.stringify(value || []);
    }

    return value || '';
  });

  // Update row
  sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([rowData]);

  return obj;
}

/**
 * Delete an object by ID
 */
function deleteObject(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  // Find the row with matching ID
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1); // +1 because sheets are 1-indexed
      return { deleted: true, id: id };
    }
  }

  return { deleted: false, id: id, error: 'Not found' };
}

/**
 * Upload an image to Drive and return its public URL
 */
function uploadImage(data) {
  if (!data || !data.data) {
    throw new Error('Missing image data');
  }

  const bytes = Utilities.base64Decode(data.data);
  const mimeType = data.mimeType || 'application/octet-stream';
  const filename = data.filename || 'image';
  const blob = Utilities.newBlob(bytes, mimeType, filename);
  const folder = getImageFolder();
  const file = folder.createFile(blob);

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    id: file.getId(),
    url: `https://drive.google.com/uc?export=view&id=${file.getId()}`,
    name: file.getName()
  };
}

/**
 * Test function - run this to verify the script works
 */
function testScript() {
  // Create a test object
  const testObj = {
    title: 'Test Object',
    aboutText: 'This is a test object',
    images: [{ url: 'https://example.com/image.jpg', caption: 'Test image', isPrimary: true }],
    from: 'Test Source',
    designer: 'Test Designer',
    maker: 'Test Maker',
    makerRole: 'Builder',
    portfolioTitle: 'Test Portfolio',
    mediumMaterials: 'Test Materials',
    measurements: '10" x 10"',
    keywords: ['test', 'sample'],
    collection: 'Test Collection',
    objectType: 'Test Type',
    objectNumber: 'TEST.001'
  };

  // Create
  const created = createObject(testObj);
  Logger.log('Created: ' + JSON.stringify(created));

  // Get all
  const all = getAllObjects();
  Logger.log('All objects: ' + JSON.stringify(all));

  // Update
  created.title = 'Updated Test Object';
  const updated = updateObject(created);
  Logger.log('Updated: ' + JSON.stringify(updated));

  // Delete
  const deleted = deleteObject(created.id);
  Logger.log('Deleted: ' + JSON.stringify(deleted));
}
