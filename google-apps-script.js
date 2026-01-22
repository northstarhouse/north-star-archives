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
 *          collection, objectType, objectNumber, accessionDate,
 *          controllingInstitution, collectionType, classification,
 *          physicalCharacteristics, cataloguedDate, cataloguer,
 *          relatedAcquisitionRecord, acquisitionNotes, parts,
 *          createdAt, updatedAt
 */

const USE_SHEETS = true;
const SHEET_NAME = 'Archives';
const IMAGE_FOLDER_ID = '';
const FORCE_MY_DRIVE = true;
const IMAGE_FOLDER_NAME = 'Archival Photos';

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
  'accessionDate',
  'controllingInstitution',
  'collectionType',
  'classification',
  'physicalCharacteristics',
  'cataloguedDate',
  'cataloguer',
  'relatedAcquisitionRecord',
  'acquisitionNotes',
  'parts',
  'createdAt',
  'updatedAt'
];

/**
 * Get or create the Archives sheet
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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

  try {
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    const existing = headerRange.getValues()[0];
    const needsUpdate = existing.length < HEADERS.length
      || HEADERS.some((header, index) => existing[index] !== header);
    if (needsUpdate) {
      headerRange.setValues([HEADERS]);
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  } catch (error) {
    Logger.log(`Failed to validate headers: ${error}`);
  }

  return sheet;
}

/**
 * Get or create the image folder in Drive
 */
function getImageFolder() {
  if (IMAGE_FOLDER_ID) {
    try {
      return DriveApp.getFolderById(IMAGE_FOLDER_ID);
    } catch (error) {
      Logger.log(`Invalid IMAGE_FOLDER_ID "${IMAGE_FOLDER_ID}": ${error}`);
    }
  }

  if (FORCE_MY_DRIVE) {
    // Search for folder in My Drive root only
    const rootFolder = DriveApp.getRootFolder();
    const folders = rootFolder.getFoldersByName(IMAGE_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    }
    return rootFolder.createFolder(IMAGE_FOLDER_NAME);
  } else {
    // Search anywhere in Drive (including shared drives)
    const folders = DriveApp.getFoldersByName(IMAGE_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(IMAGE_FOLDER_NAME);
  }
}

/**
 * Handle GET requests - fetch all objects
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getAll') {
      if (!USE_SHEETS) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, objects: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
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
        if (!USE_SHEETS) throw new Error('Sheets disabled');
        result = createObject(data.object);
        break;
      case 'update':
        if (!USE_SHEETS) throw new Error('Sheets disabled');
        result = updateObject(data.object);
        break;
      case 'delete':
        if (!USE_SHEETS) throw new Error('Sheets disabled');
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
      if (header === 'images' || header === 'keywords' || header === 'parts') {
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
    if (header === 'images' || header === 'keywords' || header === 'parts') {
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
    if (header === 'images' || header === 'keywords' || header === 'parts') {
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

  Logger.log(`uploadImage called with filename: ${data.filename}, mimeType: ${data.mimeType}, data length: ${(data.data || '').length}`);

  let bytes;
  try {
    bytes = Utilities.base64Decode(data.data);
    Logger.log(`Decoded ${bytes.length} bytes`);
  } catch (decodeError) {
    Logger.log(`Failed to decode base64: ${decodeError}`);
    throw new Error(`Failed to decode image data: ${decodeError}`);
  }

  const mimeType = data.mimeType || 'application/octet-stream';
  const filename = data.filename || 'image';
  const blob = Utilities.newBlob(bytes, mimeType, filename);

  let folder;
  try {
    folder = getImageFolder();
    Logger.log(`Got image folder: ${folder.getName()} (ID: ${folder.getId()})`);
  } catch (folderError) {
    Logger.log(`Failed to get image folder: ${folderError}`);
    throw new Error(`Failed to get image folder: ${folderError}`);
  }

  let file;
  try {
    file = folder.createFile(blob);
    Logger.log(`Created file: ${file.getName()} (ID: ${file.getId()})`);
  } catch (createError) {
    Logger.log(`Failed to create file: ${createError}`);
    throw new Error(`Failed to create file in Drive: ${createError}`);
  }

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log(`Set sharing to ANYONE_WITH_LINK`);
  } catch (error) {
    Logger.log(`Failed to set link sharing for ${file.getId()}: ${error}`);
    try {
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
      Logger.log(`Fallback: Set sharing to ANYONE`);
    } catch (fallbackError) {
      Logger.log(`Failed to set public sharing for ${file.getId()}: ${fallbackError}`);
    }
  }

  const result = {
    id: file.getId(),
    url: `https://drive.google.com/uc?export=view&id=${file.getId()}`,
    name: file.getName()
  };
  Logger.log(`Returning: ${JSON.stringify(result)}`);
  return result;
}

/**
 * Test image upload - run this manually in Apps Script to verify Drive permissions
 */
function testImageUpload() {
  try {
    Logger.log('Testing image upload...');

    // Create a simple 1x1 red PNG (smallest valid PNG)
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    const result = uploadImage({
      filename: 'test-image.png',
      mimeType: 'image/png',
      data: testBase64
    });

    Logger.log('SUCCESS! Image uploaded: ' + JSON.stringify(result));
    Logger.log('Check your Drive for folder: ' + IMAGE_FOLDER_NAME);
    return result;
  } catch (error) {
    Logger.log('FAILED: ' + error.toString());
    throw error;
  }
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
