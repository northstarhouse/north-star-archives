const { useState, useEffect, useMemo, useCallback, useRef } = React;

// =====================================================================
// LOCAL CACHE CONFIG
// =====================================================================

const CACHE_KEY = 'nsh-archives-cache-v1';
const IMAGE_CACHE_KEY = 'nsh-archives-images-v1';
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_IMAGE_DIMENSION = 800;
const JPEG_QUALITY = 0.82;
const MIN_JPEG_QUALITY = 0.5;
const MAX_SHEET_CELL_CHARS = 42000;

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.objects)) return null;
    return parsed;
  } catch (error) {
    console.warn('Failed to read cache:', error);
    return null;
  }
};

const isLocalImage = (image) => {
  if (!image) return false;
  if (image.isLocal) return true;
  if (STORE_IMAGES_IN_SHEET) return false;
  return typeof image.url === 'string' && image.url.startsWith('data:');
};

const mimeToExtension = (mimeType) => {
  if (!mimeType) return 'jpg';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  return 'jpg';
};

const parseDataUrl = (dataUrl) => {
  const match = typeof dataUrl === 'string'
    ? dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    : null;
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
};

const uploadLocalImagesToDrive = async (images) => {
  console.log('uploadLocalImagesToDrive called with', images?.length, 'images');
  if (!Array.isArray(images) || images.length === 0) {
    return { images, failed: false };
  }
  let failed = false;
  const timestamp = Date.now();
  const uploadedImages = [];

  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    console.log(`Processing image ${i}:`, { isLocal: image.isLocal, urlStart: image.url?.substring(0, 50) });
    if (!isLocalImage(image)) {
      console.log(`Image ${i} is not local, skipping upload`);
      uploadedImages.push(image);
      continue;
    }
    const parsed = parseDataUrl(image.url);
    if (!parsed) {
      console.error(`Image ${i}: Failed to parse data URL`);
      failed = true;
      uploadedImages.push(image);
      continue;
    }
    console.log(`Image ${i}: Parsed OK, mimeType=${parsed.mimeType}, data length=${parsed.data?.length}`);
    try {
      const ext = mimeToExtension(parsed.mimeType);
      const filename = `image-${timestamp}-${i + 1}.${ext}`;
      console.log(`Image ${i}: Uploading as ${filename}...`);
      const result = await SheetsAPI.uploadImage({
        filename,
        mimeType: parsed.mimeType,
        data: parsed.data
      });
      console.log(`Image ${i}: Upload SUCCESS, url=${result.url}`);
      uploadedImages.push({
        ...image,
        url: result.url,
        isLocal: false
      });
    } catch (error) {
      console.error(`Image ${i}: Upload FAILED:`, error);
      failed = true;
      uploadedImages.push(image);
    }
  }

  console.log('uploadLocalImagesToDrive result: failed=', failed);
  return { images: uploadedImages, failed };
};

const stripLocalImagesFromObject = (object) => {
  if (!object) return object;
  if (STORE_IMAGES_IN_SHEET) return object;
  const images = Array.isArray(object.images)
    ? object.images.filter((img) => !isLocalImage(img))
    : [];
  return { ...object, images };
};

const stripLocalImagesFromObjects = (objects) => {
  if (!Array.isArray(objects)) return objects;
  return objects.map(stripLocalImagesFromObject);
};

const writeCache = (objects) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        objects: STORE_IMAGES_IN_SHEET ? objects : stripLocalImagesFromObjects(objects),
        updatedAt: Date.now()
      })
    );
  } catch (error) {
    console.warn('Failed to write cache:', error);
  }
};

const readImageCache = () => {
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('Failed to read image cache:', error);
    return {};
  }
};

const writeImageCache = (imagesById) => {
  try {
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(imagesById || {}));
  } catch (error) {
    console.warn('Failed to write image cache:', error);
  }
};

const normalizeImages = (images) => {
  if (!Array.isArray(images) || images.length === 0) return images;
  if (!images.some((img) => img.isPrimary)) {
    const first = { ...images[0], isPrimary: true };
    return [first, ...images.slice(1)];
  }
  return images;
};

const mergeLocalImages = (objects) => {
  if (!Array.isArray(objects) || objects.length === 0) return objects;
  const localImages = readImageCache();
  return objects.map((object) => {
    const local = localImages[object.id];
    if (!Array.isArray(local) || local.length === 0) return object;
    const merged = normalizeImages([...(object.images || []), ...local]);
    return { ...object, images: merged };
  });
};

// ============================================================================
// GOOGLE SHEETS CONFIGURATION
// ============================================================================

// Instructions to set up Google Sheets integration:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste the code from google-apps-script.js (included in this repo)
// 4. Deploy as Web App (Execute as: Me, Who has access: Anyone)
// 5. Copy the Web App URL and paste it below

const USE_SHEETS = true;
const USE_DRIVE_UPLOADS = false;
const STORE_IMAGES_IN_SHEET = true;
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6X8rdXiAUnasGTQdl-hcTN3zFa_Z4KPSa2au44i3u1eUbfwnov1jmX5yBEAdwduP_vQ/exec';
const DRIVE_SCRIPT_URL = GOOGLE_SCRIPT_URL;

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

const OBJECT_TYPES = [
  'Architectural Element',
  'Fixture',
  'Document',
  'Photograph',
  'Furniture',
  'Decorative Art',
  'Building Material',
  'Tool/Equipment',
  'Textile',
  'Artwork'
];

const COLLECTIONS = [
  'Furnishings',
  'Art',
  'Photographs',
  'Decorative display',
  'Documents',
  'Tools/Equipment',
  'Fixture',
  'Docent Display'
];

const ORIGIN_OPTIONS = [
  'Donor',
  'Purchase',
  'Found on premises'
];

// ============================================================================
// FALLBACK SAMPLE DATA (used when Google Sheets is not configured)
// ============================================================================

const SAMPLE_OBJECTS = [
  {
    id: '1',
    title: 'Original Redwood Ceiling Beam',
    aboutText: 'This magnificent old-growth redwood beam is one of the original structural elements from the 1905 construction of the North Star House.',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', caption: 'Full beam view showing grain pattern', isPrimary: true }
    ],
    from: 'Original Construction',
    designer: 'Julia Morgan',
    maker: 'Pacific Lumber Company',
    makerRole: 'Fabricator',
    portfolioTitle: 'North Star House - Structural Elements',
    mediumMaterials: 'Old-growth Redwood, Wrought Iron hardware',
    measurements: '20\' 6" L x 12" W x 14" H',
    keywords: ['structural', 'original', 'redwood', '1900s', 'Arts & Crafts'],
    collection: 'Building Materials',
    objectType: 'Architectural Element',
    objectNumber: 'NSH.1905.001'
  },
  {
    id: '2',
    title: 'Hammered Copper Lantern',
    aboutText: 'A stunning example of Arts and Crafts metalwork, this hammered copper lantern was designed by Julia Morgan specifically for the North Star House entry.',
    images: [
      { url: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800', caption: 'Lantern illuminated at dusk', isPrimary: true }
    ],
    from: 'Original Construction',
    designer: 'Julia Morgan',
    maker: 'Dirk van Erp Studio (attributed)',
    makerRole: 'Artisan',
    portfolioTitle: 'North Star House - Lighting Fixtures',
    mediumMaterials: 'Hammered Copper, Amber Art Glass, Brass fittings',
    measurements: '24" H x 14" Diameter',
    keywords: ['lighting', 'Arts & Crafts', 'handcrafted', 'copper'],
    collection: 'Original Fixtures',
    objectType: 'Fixture',
    objectNumber: 'NSH.1905.015'
  }
];

// ============================================================================
// GOOGLE SHEETS API FUNCTIONS
// ============================================================================

const SheetsAPI = {
  isConfigured: () => USE_SHEETS && GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.length > 0,

  postJson: async (url, payload) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },

  // Fetch all objects from Google Sheets
  fetchAll: async () => {
    if (!USE_SHEETS) {
      const cached = readCache();
      return cached?.objects || [];
    }
    if (!SheetsAPI.isConfigured()) {
      console.log('Google Sheets not configured, using sample data');
      return SAMPLE_OBJECTS;
    }

    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAll`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      return data.objects || [];
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      return SAMPLE_OBJECTS;
    }
  },

  // Save a new object to Google Sheets
  create: async (object) => {
    if (!SheetsAPI.isConfigured()) {
      console.log('Google Sheets not configured, saving locally only');
      return { ...object, id: Date.now().toString() };
    }

    try {
      const data = await SheetsAPI.postJson(GOOGLE_SCRIPT_URL, { action: 'create', object });
      return data.result || { ...object, id: Date.now().toString() };
    } catch (error) {
      console.error('Error creating in Google Sheets:', error);
      return { ...object, id: Date.now().toString() };
    }
  },

  // Update an existing object in Google Sheets
  update: async (object) => {
    if (!SheetsAPI.isConfigured()) {
      console.log('Google Sheets not configured, saving locally only');
      return object;
    }

    try {
      await SheetsAPI.postJson(GOOGLE_SCRIPT_URL, { action: 'update', object });
      return object;
    } catch (error) {
      console.error('Error updating in Google Sheets:', error);
      return object;
    }
  },

  // Delete an object from Google Sheets
  delete: async (id) => {
    if (!SheetsAPI.isConfigured()) {
      console.log('Google Sheets not configured');
      return true;
    }

    try {
      await SheetsAPI.postJson(GOOGLE_SCRIPT_URL, { action: 'delete', id });
      return true;
    } catch (error) {
      console.error('Error deleting from Google Sheets:', error);
      return false;
    }
  },

  // Upload an image file to Google Drive via Apps Script
  uploadImage: async ({ filename, mimeType, data }) => {
    if (!USE_DRIVE_UPLOADS) {
      throw new Error('Drive uploads disabled');
    }
    if (!DRIVE_SCRIPT_URL) {
      throw new Error('Drive upload not configured');
    }

    console.log(`Uploading image: ${filename} (${mimeType}), data length: ${(data || '').length}`);

    const payload = {
      action: 'uploadImage',
      filename,
      mimeType,
      data
    };

    const response = await SheetsAPI.postJson(DRIVE_SCRIPT_URL, payload);
    console.log('Upload response:', response);
    if (!response.success) throw new Error(response.error || 'Upload failed');
    console.log('Upload successful, URL:', response.result?.url);
    return response.result;
  }
};

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const IconArrowLeft = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconSearch = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconPlus = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconX = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconChevronLeft = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const IconChevronRight = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const IconEdit = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconTrash = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const IconGrid = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const IconZoomIn = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const IconRefresh = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const IconCloud = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
  </svg>
);

const IconCheck = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconLoader = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`animate-spin ${className}`}>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"></path>
  </svg>
);

// ============================================================================
// IMAGE GALLERY COMPONENT
// ============================================================================

const ImageGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="bg-stone-200 rounded-lg h-64 flex items-center justify-center">
        <span className="text-stone-500">No images available</span>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="relative bg-stone-100 rounded-xl overflow-hidden">
        <div
          className="relative cursor-zoom-in bg-stone-100"
          onClick={() => setIsZoomed(true)}
        >
          <img
            src={currentImage.url}
            alt={currentImage.caption || title}
            className="w-full h-auto object-contain"
            decoding="async"
          />
          <button
            className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
          >
            <IconZoomIn size={20} />
          </button>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors shadow-md"
            >
              <IconChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors shadow-md"
            >
              <IconChevronRight size={24} />
            </button>
          </>
        )}

        {currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
            <p className="text-white text-sm">{currentImage.caption}</p>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-gold ring-2 ring-gold/30' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 lightbox-overlay flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-stone-300 transition-colors"
            onClick={() => setIsZoomed(false)}
          >
            <IconX size={32} />
          </button>
          <img
            src={currentImage.url}
            alt={currentImage.caption || title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            decoding="async"
          />
          {currentImage.caption && (
            <p className="absolute bottom-4 left-4 right-4 text-center text-white text-sm">
              {currentImage.caption}
            </p>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors"
              >
                <IconChevronLeft size={32} className="text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors"
              >
                <IconChevronRight size={32} className="text-white" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

// ============================================================================
// METADATA COMPONENTS
// ============================================================================

const MetadataField = ({ label, value, onClick, isClickable = false }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  const displayValue = Array.isArray(value) ? value.join(', ') : value;

  return (
    <div className="py-3">
      <div className="metadata-label">{label}</div>
      {isClickable ? (
        <button
          onClick={onClick}
          className="metadata-value text-gold hover:text-gold-dark transition-colors text-left"
        >
          {displayValue}
        </button>
      ) : (
        <div className="metadata-value">{displayValue}</div>
      )}
    </div>
  );
};

const MetadataGrid = ({ object, onFilterClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-t border-stone-200">
      <MetadataField label="Object Type" value={object.objectType} />
      <MetadataField label="Object Number" value={object.objectNumber} />
      <MetadataField label="Accession Date" value={object.accessionDate} />
      <MetadataField
        label="Named Collection"
        value={object.collection}
        isClickable
        onClick={() => onFilterClick('collection', object.collection)}
      />
      <MetadataField label="Measurements" value={object.measurements} />
      <MetadataField label="Physical Characteristics" value={object.physicalCharacteristics} />
      <MetadataField label="Location in House/On Property" value={object.locationInHouse} />
      <MetadataField
        label="Designer"
        value={object.designer}
        isClickable={!!object.designer}
        onClick={() => onFilterClick('designer', object.designer)}
      />
      <MetadataField
        label="Maker"
        value={object.maker}
        isClickable={!!object.maker}
        onClick={() => onFilterClick('maker', object.maker)}
      />
      <MetadataField label="From (Origin/Donor/Source)" value={object.from} />
      <MetadataField label="Origin Details" value={object.originDetails} />
      <MetadataField label="Catalogued Date" value={object.cataloguedDate} />
      <MetadataField label="Cataloguer" value={object.cataloguer} />
      <MetadataField label="Acquisition Notes" value={object.acquisitionNotes} />
      <MetadataField
        label="Estimated Value"
        value={object.amountPaidOrEstimatedReplacementValue}
      />
    </div>
  );
};

// ============================================================================
// OBJECT CARD COMPONENT
// ============================================================================

const ObjectCard = ({ object, onClick }) => {
  const primaryImage = object.images?.find(img => img.isPrimary) || object.images?.[0];

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-stone-200 overflow-hidden text-left card-hover w-full"
    >
      <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={object.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-stone-800 mb-1 line-clamp-2">
          {object.title}
        </h3>
        <p className="text-sm text-stone-600 mb-2">{object.objectType}</p>
        {object.collection && (
          <p className="text-sm text-gold">{object.collection}</p>
        )}
      </div>
    </button>
  );
};

// ============================================================================
// RELATED OBJECTS COMPONENT
// ============================================================================

const RelatedObjects = ({ currentObject, allObjects, onObjectClick }) => {
  const relatedObjects = useMemo(() => {
    if (!currentObject) return [];

    const scored = allObjects
      .filter(obj => obj.id !== currentObject.id)
      .map(obj => {
        let score = 0;
        if (obj.collection === currentObject.collection) score += 3;
        if (obj.objectType === currentObject.objectType) score += 2;
        if (obj.designer && obj.designer === currentObject.designer) score += 2;
        if (obj.maker && obj.maker === currentObject.maker) score += 2;
        const sharedKeywords = obj.keywords?.filter(k =>
          currentObject.keywords?.includes(k)
        ) || [];
        score += sharedKeywords.length;
        return { ...obj, score };
      })
      .filter(obj => obj.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return scored;
  }, [currentObject, allObjects]);

  if (relatedObjects.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="font-display text-2xl font-semibold text-stone-800 mb-6">Related Objects</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedObjects.map(obj => (
          <ObjectCard key={obj.id} object={obj} onClick={() => onObjectClick(obj)} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TAG INPUT COMPONENT
// ============================================================================

const TagInput = ({ tags, onChange, placeholder = "Add tag..." }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span key={idx} className="tag tag-gold flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-600 ml-1"
            >
              <IconX size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <IconPlus size={18} />
        </button>
      </div>
    </div>
  );
};


// ============================================================================
// IMAGE INPUT COMPONENT
// ============================================================================

const ImageInput = ({ images, onChange }) => {
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const fileToResizedDataUrl = (file) => (
    new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const render = (width, height, quality) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            return canvas.toDataURL('image/jpeg', quality);
          };

          const maxDim = Math.max(img.width, img.height);
          const baseScale = maxDim > MAX_IMAGE_DIMENSION ? (MAX_IMAGE_DIMENSION / maxDim) : 1;
          let width = Math.max(1, Math.round(img.width * baseScale));
          let height = Math.max(1, Math.round(img.height * baseScale));
          let quality = JPEG_QUALITY;
          let dataUrl = render(width, height, quality);

          if (STORE_IMAGES_IN_SHEET) {
            const minDim = 240;
            let safety = 0;
            while (dataUrl.length > MAX_SHEET_CELL_CHARS && safety < 30) {
              if (quality > MIN_JPEG_QUALITY) {
                quality = Math.max(MIN_JPEG_QUALITY, quality - 0.08);
              } else {
                width = Math.max(minDim, Math.round(width * 0.8));
                height = Math.max(minDim, Math.round(height * 0.8));
                quality = JPEG_QUALITY;
              }
              dataUrl = render(width, height, quality);
              safety += 1;
            }
          }
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      img.src = objectUrl;
    })
  );

  const isHeicFile = (file) => {
    if (!file) return false;
    const type = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    return type === 'image/heic' || type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif');
  };

  const convertHeicToJpeg = async (file) => {
    if (typeof window === 'undefined' || typeof window.heic2any !== 'function') {
      throw new Error('HEIC conversion not available.');
    }
    const blob = await window.heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    });
    const name = (file.name || 'image').replace(/\.(heic|heif)$/i, '.jpg');
    return new File([blob], name, { type: 'image/jpeg' });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const sourceFile = isHeicFile(file) ? await convertHeicToJpeg(file) : file;
      const dataUrl = await fileToResizedDataUrl(sourceFile);
      const base64 = dataUrl.split(',')[1] || '';
      if (!base64) throw new Error('Invalid image data');
      let uploadedUrl = null;
      if (USE_DRIVE_UPLOADS && SheetsAPI.isConfigured()) {
        try {
          const result = await SheetsAPI.uploadImage({
            filename: sourceFile.name,
            mimeType: sourceFile.type,
            data: base64
          });
          uploadedUrl = result?.url || null;
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      }

      const isPrimary = images.length === 0;
      if (uploadedUrl) {
        onChange([...images, { url: uploadedUrl, caption: caption.trim(), isPrimary }]);
      } else {
        onChange([
          ...images,
          {
            url: dataUrl,
            caption: caption.trim(),
            isPrimary,
            isLocal: STORE_IMAGES_IN_SHEET ? false : true
          }
        ]);
      }
      setUploadError('');
      setCaption('');
    } catch (error) {
      console.error('Image upload failed:', error);
      setUploadError(error?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    onChange(newImages);
  };

  const setPrimary = (idx) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
  };

  return (
    <div className="space-y-3">
      {images.map((img, idx) => (
        <div key={idx} className="flex items-start gap-3 bg-stone-50 p-3 rounded-lg">
          <img src={img.url} alt="" className="w-16 h-16 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{img.url}</p>
            {img.caption && <p className="text-xs text-stone-500">{img.caption}</p>}
            <button
              type="button"
              onClick={() => setPrimary(idx)}
              className={`text-xs mt-1 ${img.isPrimary ? 'text-gold font-medium' : 'text-stone-400 hover:text-gold'}`}
            >
              {img.isPrimary ? 'Primary Image' : 'Set as Primary'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeImage(idx)}
            className="text-stone-400 hover:text-red-600"
          >
            <IconX size={18} />
          </button>
        </div>
      ))}
      <div className="space-y-2">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:bg-stone-200 rounded-lg transition-colors text-sm"
        >
          {isUploading ? <IconLoader size={16} /> : <IconPlus size={16} />}
          {isUploading ? 'Uploading...' : 'Add Image'}
        </button>
        {uploadError && (
          <p className="text-xs text-red-600">{uploadError}</p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN FORM COMPONENT
// ============================================================================

const AdminForm = ({ object, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState({
    title: '',
    aboutText: '',
    locationInHouse: '',
    images: [],
    from: '',
    designer: '',
    maker: '',
    measurements: '',
    keywords: [],
    collection: '',
    objectType: '',
    objectNumber: '',
    accessionDate: '',
    physicalCharacteristics: '',
    cataloguedDate: '',
    cataloguer: 'Lisa Robinson',
    acquisitionNotes: '',
    amountPaidOrEstimatedReplacementValue: '',
    ...object
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }
    onSave({
      ...form,
      id: form.id || Date.now().toString(),
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Images */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Images</h3>
        <p className="text-sm text-stone-500 mb-3">Add multiple images with zoom and carousel support</p>
        <ImageInput
          images={form.images}
          onChange={(images) => updateField('images', images)}
        />
      </section>

      {/* From */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Origin Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              From (Origin, Donor, or Source)
            </label>
            <select
              value={form.from}
              onChange={(e) => updateField('from', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white"
            >
              <option value="">Select origin...</option>
              {ORIGIN_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name / Store / Where on Premises</label>
            <input
              type="text"
              value={form.originDetails}
              onChange={(e) => updateField('originDetails', e.target.value)}
              placeholder="e.g., donor name, store name, or where it was found"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Accession Date</label>
            <input
              type="text"
              value={form.accessionDate}
              onChange={(e) => updateField('accessionDate', e.target.value)}
              placeholder="e.g., 07/25/2025"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Acquisition Notes</label>
          <textarea
            value={form.acquisitionNotes}
            onChange={(e) => updateField('acquisitionNotes', e.target.value)}
            placeholder="e.g., Donor requests items be returned if administration changes"
            className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            rows={2}
          />
        </div>
      </section>

      {/* Basic Info */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Name of Object <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">About this Object</label>
            <textarea
              value={form.aboutText}
              onChange={(e) => updateField('aboutText', e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Location in House/On Property</label>
            <input
              type="text"
              value={form.locationInHouse}
              onChange={(e) => updateField('locationInHouse', e.target.value)}
              placeholder="e.g., Dining Room, East wall"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Creators */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Creators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Designer(s)</label>
            <input
              type="text"
              value={form.designer}
              onChange={(e) => updateField('designer', e.target.value)}
              placeholder="e.g., Julia Morgan"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Maker</label>
            <input
              type="text"
              value={form.maker}
              onChange={(e) => updateField('maker', e.target.value)}
              placeholder="e.g., Pacific Lumber Company"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Physical Details */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Physical Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Measurements</label>
            <input
              type="text"
              value={form.measurements}
              onChange={(e) => updateField('measurements', e.target.value)}
              placeholder='e.g., 24" x 36" x 12"'
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Physical Characteristics</label>
          <input
            type="text"
            value={form.physicalCharacteristics}
            onChange={(e) => updateField('physicalCharacteristics', e.target.value)}
            placeholder="e.g., dark blue flower pattern on white porcelain"
            className="w-full px-4 py-3 border border-stone-300 rounded-lg"
          />
        </div>
      </section>

      {/* Keywords */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Keywords for Search</h3>
        <TagInput
          tags={form.keywords}
          onChange={(tags) => updateField('keywords', tags)}
          placeholder="Add keyword..."
        />
      </section>

      {/* Classification */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Named Collection</label>
            <select
              value={form.collection}
              onChange={(e) => updateField('collection', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white"
            >
              <option value="">Select collection...</option>
              {COLLECTIONS.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Object Number</label>
            <input
              type="text"
              value={form.objectNumber}
              onChange={(e) => updateField('objectNumber', e.target.value)}
              placeholder="e.g., NSH.1905.001"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Cataloging</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Catalogued Date</label>
            <input
              type="text"
              value={form.cataloguedDate}
              onChange={(e) => updateField('cataloguedDate', e.target.value)}
              placeholder="e.g., 09/01/2025"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Cataloguer</label>
            <select
              value={form.cataloguer}
              onChange={(e) => updateField('cataloguer', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white"
            >
              <option value="Lisa Robinson">Lisa Robinson</option>
              <option value="Rebekah Freeman">Rebekah Freeman</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Estimated Value
          </label>
          <input
            type="text"
            value={form.amountPaidOrEstimatedReplacementValue}
            onChange={(e) => updateField('amountPaidOrEstimatedReplacementValue', e.target.value)}
            placeholder="e.g., $1,200 (estimated)"
            className="w-full px-4 py-3 border border-stone-300 rounded-lg"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-stone-200">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-gold hover:bg-gold-dark disabled:bg-stone-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <IconLoader size={20} />
              Saving...
            </>
          ) : (
            <>
              <IconCloud size={20} />
              {object?.id ? 'Save Changes' : 'Add Object'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-3 bg-stone-100 hover:bg-stone-200 disabled:bg-stone-100 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// OBJECT DETAIL VIEW
// ============================================================================

const ObjectDetailView = ({ object, allObjects, onBack, onEdit, onDelete, onFilterClick, onObjectClick, isDeleting }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-600 hover:text-gold transition-colors mb-6"
      >
        <IconArrowLeft size={20} />
        <span>Back to Collection</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10">
        <div>
          <ImageGallery images={object.images} title={object.title} />
        </div>
        <div>
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-stone-800">
                  {object.title}
                </h1>
              </div>
              <button
                onClick={() => onEdit(object)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm"
              >
                <IconEdit size={16} />
                Edit
              </button>
              <button
                onClick={() => onDelete(object)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <IconTrash size={16} />
                Delete
              </button>
            </div>
          </div>

          {object.aboutText && (
            <div className="mb-8">
              <h2 className="font-display text-xl font-semibold text-stone-800 mb-3">About this Object</h2>
              <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{object.aboutText}</p>
            </div>
          )}

          <MetadataGrid object={object} onFilterClick={onFilterClick} />

          {object.keywords && object.keywords.length > 0 && (
            <div className="mt-6 pt-6 border-t border-stone-200">
              <h3 className="metadata-label mb-2">Keywords for Search</h3>
              <div className="flex flex-wrap gap-2">
                {object.keywords.map((keyword, idx) => (
                  <button
                    key={idx}
                    onClick={() => onFilterClick('keywords', keyword)}
                    className="tag"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RelatedObjects
        currentObject={object}
        allObjects={allObjects}
        onObjectClick={onObjectClick}
      />
    </div>
  );
};

// ============================================================================
// BROWSE VIEW
// ============================================================================

const BrowseView = ({ objects, filters, onFilterChange, onObjectClick, onAddNew, onRefresh, isLoading, isConnected }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const collections = COLLECTIONS;

  const filteredObjects = useMemo(() => {
    return objects.filter(obj => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          obj.title,
          obj.aboutText,
          obj.objectType,
          obj.designer,
          obj.maker,
          obj.from,
          ...(obj.keywords || [])
        ].join(' ').toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      if (filters.collection && obj.collection !== filters.collection) return false;
      if (filters.keywords && !obj.keywords?.includes(filters.keywords)) return false;
      if (filters.designer && obj.designer !== filters.designer) return false;
      if (filters.maker && obj.maker !== filters.maker) return false;
      return true;
    });
  }, [objects, searchQuery, filters]);

  const clearFilters = () => {
    setSearchQuery('');
    onFilterChange({});
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-stone-800">Archives</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-stone-600">North Star House Collection</p>
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <IconCheck size={12} /> Synced
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                <IconCloud size={12} /> Local
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            title="Refresh from Google Sheets"
          >
            <IconRefresh size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-5 py-3 rounded-lg font-medium transition-colors"
          >
            <IconPlus size={20} />
            Add Object
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <IconSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search objects, keywords, makers..."
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
          <select
            value={filters.collection || ''}
            onChange={(e) => onFilterChange({ ...filters, collection: e.target.value || null })}
            className="px-4 py-3 border border-stone-300 rounded-lg bg-white min-w-[180px]"
          >
            <option value="">All Collections</option>
            {collections.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <span className="text-sm text-stone-500">Active filters:</span>
            {searchQuery && (
              <span className="tag tag-gold">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1"><IconX size={14} /></button>
              </span>
            )}
            {filters.collection && (
              <span className="tag tag-gold">
                Collection: {filters.collection}
                <button onClick={() => onFilterChange({ ...filters, collection: null })} className="ml-1"><IconX size={14} /></button>
              </span>
            )}
            {filters.keywords && (
              <span className="tag tag-gold">
                Keyword: {filters.keywords}
                <button onClick={() => onFilterChange({ ...filters, keywords: null })} className="ml-1"><IconX size={14} /></button>
              </span>
            )}
            {filters.designer && (
              <span className="tag tag-gold">
                Designer: {filters.designer}
                <button onClick={() => onFilterChange({ ...filters, designer: null })} className="ml-1"><IconX size={14} /></button>
              </span>
            )}
            {filters.maker && (
              <span className="tag tag-gold">
                Maker: {filters.maker}
                <button onClick={() => onFilterChange({ ...filters, maker: null })} className="ml-1"><IconX size={14} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-sm text-gold hover:text-gold-dark ml-2">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <p className="text-stone-600 mb-4">
        {filteredObjects.length} {filteredObjects.length === 1 ? 'object' : 'objects'} found
      </p>

      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <IconLoader size={48} className="mx-auto text-gold mb-4" />
          <p className="text-stone-600 text-lg">Loading from Google Sheets...</p>
        </div>
      ) : filteredObjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <IconGrid size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-600 text-lg">No objects match your search</p>
          <button onClick={clearFilters} className="mt-4 text-gold hover:text-gold-dark">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObjects.map(obj => (
            <ObjectCard key={obj.id} object={obj} onClick={() => onObjectClick(obj)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const ArchiveApp = () => {
  const [objects, setObjects] = useState([]);
  const [view, setView] = useState('browse');
  const [selectedObject, setSelectedObject] = useState(null);
  const [editingObject, setEditingObject] = useState(null);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async ({ useCache = true } = {}) => {
    if (!USE_SHEETS) {
      const cached = readCache();
      setObjects(mergeLocalImages(cached?.objects || []));
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    const cached = useCache ? readCache() : null;
    const isCacheFresh = cached && (Date.now() - cached.updatedAt) < CACHE_TTL_MS;

    if (cached?.objects?.length) {
      setObjects(mergeLocalImages(cached.objects));
      setIsConnected(SheetsAPI.isConfigured());
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    try {
      if (isCacheFresh) {
        // Still refresh in the background for latest changes.
      }
      const data = await SheetsAPI.fetchAll();
      setObjects(mergeLocalImages(data));
      setIsConnected(SheetsAPI.isConfigured());
      writeCache(data);
    } catch (error) {
      console.error('Failed to load data:', error);
      if (!cached?.objects?.length) {
        setObjects(mergeLocalImages(SAMPLE_OBJECTS));
      }
    }

    setIsLoading(false);
  };

  const handleObjectClick = (obj) => {
    setSelectedObject(obj);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedObject(null);
    setView('browse');
  };

  const handleAddNew = () => {
    setEditingObject(null);
    setView('add');
    window.scrollTo(0, 0);
  };

  const handleEdit = (obj) => {
    setEditingObject(obj);
    setView('edit');
    window.scrollTo(0, 0);
  };

  const handleSave = async (savedObject) => {
    setIsSaving(true);
    try {
      let finalObject = savedObject;
      if (USE_DRIVE_UPLOADS && SheetsAPI.isConfigured()) {
        const uploadResult = await uploadLocalImagesToDrive(savedObject.images || []);
        finalObject = { ...savedObject, images: uploadResult.images };
        if (uploadResult.failed) {
          alert('Some images could not be uploaded to Drive. Please try saving again.');
        }
      }
      const localImages = (finalObject.images || []).filter(isLocalImage);
      const sheetObject = stripLocalImagesFromObject(finalObject);
      if (editingObject) {
        await SheetsAPI.update(sheetObject);
        setObjects(prev => {
          const next = prev.map(o => o.id === finalObject.id ? finalObject : o);
          writeCache(next);
          return next;
        });
        setSelectedObject(finalObject);
      } else {
        const newObj = await SheetsAPI.create(sheetObject);
        const nextObject = { ...finalObject, id: newObj.id || finalObject.id };
        finalObject = nextObject;
        setObjects(prev => {
          const next = [...prev, nextObject];
          writeCache(next);
          return next;
        });
        setSelectedObject(nextObject);
      }
      if (finalObject.id) {
        const imageCache = readImageCache();
        if (localImages.length > 0) {
          imageCache[finalObject.id] = localImages;
        } else {
          delete imageCache[finalObject.id];
        }
        writeImageCache(imageCache);
      }
      setView('detail');
      setEditingObject(null);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (selectedObject) {
      setView('detail');
    } else {
      setView('browse');
    }
    setEditingObject(null);
  };

  const handleFilterClick = (filterType, value) => {
    setFilters({ [filterType]: value });
    setSelectedObject(null);
    setView('browse');
    window.scrollTo(0, 0);
  };

  const handleDelete = async (object) => {
    if (!object?.id) return;
    const confirmed = window.confirm(`Delete "${object.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      if (USE_SHEETS && SheetsAPI.isConfigured()) {
        const ok = await SheetsAPI.delete(object.id);
        if (!ok) throw new Error('Delete failed');
      }

      setObjects(prev => {
        const next = prev.filter(o => o.id !== object.id);
        writeCache(next);
        return next;
      });

      const imageCache = readImageCache();
      delete imageCache[object.id];
      writeImageCache(imageCache);

      setSelectedObject(null);
      setView('browse');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Failed to delete object:', error);
      alert('Delete failed. Please try again.');
    }
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => { setView('browse'); setSelectedObject(null); setFilters({}); }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 3.5l2.6 5.9L21 12l-6.4 2.6L12 20.5l-2.6-5.9L3 12l6.4-2.6L12 3.5z" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold text-stone-800">
                North Star House
              </span>
            </button>
            <span className="text-stone-500 text-sm hidden sm:block">Archives Collection</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {view === 'browse' && (
          <BrowseView
            objects={objects}
            filters={filters}
            onFilterChange={setFilters}
            onObjectClick={handleObjectClick}
            onAddNew={handleAddNew}
            onRefresh={() => loadData({ useCache: false })}
            isLoading={isLoading}
            isConnected={isConnected}
          />
        )}

        {view === 'detail' && selectedObject && (
          <ObjectDetailView
            object={selectedObject}
            allObjects={objects}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            onFilterClick={handleFilterClick}
            onObjectClick={handleObjectClick}
          />
        )}

        {(view === 'add' || view === 'edit') && (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-stone-600 hover:text-gold transition-colors mb-6"
            >
              <IconArrowLeft size={20} />
              <span>Cancel</span>
            </button>
            <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8">
              <h2 className="font-display text-2xl font-semibold text-stone-800 mb-6">
                {view === 'edit' ? 'Edit Object' : 'Add New Object'}
              </h2>
              <AdminForm
                object={editingObject}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-stone-500 text-sm">
            <p>North Star House Archives</p>
            <p className="mt-1">A Julia Morgan Historic Building</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// RENDER
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ArchiveApp />);




