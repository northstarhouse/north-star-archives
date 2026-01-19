const { useState, useEffect, useMemo } = React;

// ============================================================================
// SAMPLE DATA - Julia Morgan / North Star House themed objects
// ============================================================================

const OBJECT_TYPES = [
  'Architectural Element',
  'Fixture',
  'Document',
  'Photograph',
  'Furniture',
  'Decorative Art',
  'Building Material',
  'Tool/Equipment'
];

const COLLECTIONS = [
  'Original Fixtures',
  'Construction Documents',
  'Historic Photographs',
  'Restored Elements',
  'Building Materials',
  'Furnishings',
  'Donor Contributions'
];

const INITIAL_OBJECTS = [
  {
    id: '1',
    title: 'Original Redwood Ceiling Beam',
    alternateTitle: 'Main Hall Support Beam',
    aboutText: 'This magnificent old-growth redwood beam is one of the original structural elements from the 1905 construction of the North Star House. Measuring over 20 feet in length, it showcases the exceptional craftsmanship and material quality that Julia Morgan specified for her buildings. The beam features hand-hewn surfaces and original iron hardware attachments, demonstrating the Arts and Crafts commitment to honest expression of materials and construction methods.',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', caption: 'Full beam view showing grain pattern', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800', caption: 'Detail of iron hardware connection', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800', caption: 'End grain showing old-growth rings', isPrimary: false }
    ],
    objectType: 'Architectural Element',
    dateCreated: '1905',
    datePeriod: 'Arts & Crafts Era',
    makers: [
      { name: 'Julia Morgan', role: 'Architect' },
      { name: 'Pacific Lumber Company', role: 'Mill' }
    ],
    dimensions: '20\' 6" L x 12" W x 14" H',
    materials: ['Old-growth Redwood', 'Wrought Iron'],
    condition: 'Excellent - original patina preserved',
    keywords: ['structural', 'original', 'redwood', '1900s', 'Arts & Crafts', 'ceiling'],
    collection: 'Building Materials',
    location: 'Main Hall - in situ',
    provenance: 'Original to building construction. Documented in Morgan\'s 1905 construction specifications.',
    acquisitionDate: '1905',
    acquisitionMethod: 'Original Construction',
    donor: '',
    accessionNumber: 'NSH.1905.001',
    notes: 'Protected during 2015 restoration. Seismic reinforcement added without altering appearance.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Hammered Copper Lantern',
    alternateTitle: 'Entry Hall Pendant Light',
    aboutText: 'A stunning example of Arts and Crafts metalwork, this hammered copper lantern was designed by Julia Morgan specifically for the North Star House entry. The hand-hammered texture creates a warm, dancing light pattern on surrounding walls. The lantern features amber art glass panels and original copper chain suspension hardware. This piece exemplifies Morgan\'s attention to every detail of her buildings, from structure to decorative elements.',
    images: [
      { url: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800', caption: 'Lantern illuminated at dusk', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', caption: 'Detail of hammered copper texture', isPrimary: false }
    ],
    objectType: 'Fixture',
    dateCreated: '1905-1906',
    datePeriod: 'Arts & Crafts Era',
    makers: [
      { name: 'Julia Morgan', role: 'Designer' },
      { name: 'Dirk van Erp Studio', role: 'Metalsmith (attributed)' }
    ],
    dimensions: '24" H x 14" Diameter',
    materials: ['Hammered Copper', 'Amber Art Glass', 'Brass'],
    condition: 'Very Good - minor patina, original glass intact',
    keywords: ['lighting', 'Arts & Crafts', 'handcrafted', 'copper', 'entry', 'original'],
    collection: 'Original Fixtures',
    location: 'Entry Hall - in situ',
    provenance: 'Original to building. Attributed to Dirk van Erp based on construction style and Morgan\'s known collaborations.',
    acquisitionDate: '1905',
    acquisitionMethod: 'Original Construction',
    donor: '',
    accessionNumber: 'NSH.1905.015',
    notes: 'Rewired for modern electrical standards in 1987. Original socket retained for display.',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    title: 'Original Construction Blueprint - Main Floor',
    alternateTitle: 'Morgan Drawing No. 12',
    aboutText: 'This original blueprint from Julia Morgan\'s office shows the complete main floor plan of the North Star House as designed in 1904. The drawing includes detailed room layouts, structural notations in Morgan\'s distinctive hand, and material specifications. Blueprint annotations reveal last-minute design changes and the collaborative relationship between Morgan and her clients. This document is invaluable for understanding Morgan\'s design process and the original intent for the space.',
    images: [
      { url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', caption: 'Full blueprint showing main floor layout', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800', caption: 'Detail of Morgan\'s handwritten notes', isPrimary: false }
    ],
    objectType: 'Document',
    dateCreated: '1904',
    datePeriod: 'Arts & Crafts Era',
    makers: [
      { name: 'Julia Morgan', role: 'Architect' }
    ],
    dimensions: '36" x 48"',
    materials: ['Paper', 'Blueprint (cyanotype)'],
    condition: 'Good - some edge wear, fading in corners',
    keywords: ['plans', 'architecture', 'original', 'blueprint', 'Morgan', 'design'],
    collection: 'Construction Documents',
    location: 'Archive Room - Climate Controlled Storage',
    provenance: 'Gift from Morgan\'s office archives via Cal Poly Special Collections, 1980.',
    acquisitionDate: '1980-06-15',
    acquisitionMethod: 'Donation',
    donor: 'Cal Poly San Luis Obispo - Morgan Collection',
    accessionNumber: 'NSH.DOC.1904.012',
    notes: 'Digitized in 2018. Original stored in acid-free folder. Handle with cotton gloves only.',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z'
  },
  {
    id: '4',
    title: 'Hand-Forged Iron Door Hinge',
    alternateTitle: 'Main Entry Strap Hinge',
    aboutText: 'This substantial hand-forged iron hinge is one of a matched set of six that support the main entry doors. Each hinge was individually crafted by a local blacksmith, featuring a decorative scroll terminal that echoes the organic forms favored in Arts and Crafts metalwork. The forging marks are intentionally visible, celebrating the handmade nature of the work. These hinges have supported the original oak doors for over a century.',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', caption: 'Hinge mounted on original door', isPrimary: true }
    ],
    objectType: 'Architectural Element',
    dateCreated: 'c. 1905',
    datePeriod: 'Arts & Crafts Era',
    makers: [
      { name: 'Unknown Blacksmith', role: 'Craftsman' },
      { name: 'Julia Morgan', role: 'Designer' }
    ],
    dimensions: '18" L x 3" W',
    materials: ['Wrought Iron'],
    condition: 'Excellent - protective wax coating applied',
    keywords: ['hardware', 'handmade', 'iron', 'doors', 'blacksmith', 'entry'],
    collection: 'Original Fixtures',
    location: 'Main Entry Doors - in situ',
    provenance: 'Original to building. Blacksmith identity unknown but likely a Grass Valley craftsman.',
    acquisitionDate: '1905',
    acquisitionMethod: 'Original Construction',
    donor: '',
    accessionNumber: 'NSH.1905.022',
    notes: 'One of six matching hinges. Inspected annually for structural integrity.',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z'
  },
  {
    id: '5',
    title: 'Construction Photograph - Workers on Scaffolding',
    alternateTitle: 'Building the North Star House, 1905',
    aboutText: 'This remarkable photograph captures construction workers on wooden scaffolding during the building of the North Star House in 1905. The image shows the west elevation partially complete, with workers visible at various levels of the structure. This photograph provides invaluable documentation of early 20th century construction methods and the scale of effort required to build Morgan\'s designs. Several workers are identifiable and their descendants remain in the Grass Valley community.',
    images: [
      { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', caption: 'Workers on scaffolding, west elevation', isPrimary: true }
    ],
    objectType: 'Photograph',
    dateCreated: 'Summer 1905',
    datePeriod: 'Arts & Crafts Era',
    makers: [
      { name: 'Unknown Photographer', role: 'Photographer' }
    ],
    dimensions: '8" x 10" (original negative)',
    materials: ['Silver Gelatin Print', 'Glass Plate Negative'],
    condition: 'Good - some silver mirroring at edges',
    keywords: ['construction', 'history', 'workers', '1900s', 'scaffolding', 'building'],
    collection: 'Historic Photographs',
    location: 'Archive Room - Climate Controlled Storage',
    provenance: 'Discovered in Grass Valley Historical Society collection, 1992. Donated to North Star House.',
    acquisitionDate: '1992-03-20',
    acquisitionMethod: 'Donation',
    donor: 'Grass Valley Historical Society',
    accessionNumber: 'NSH.PHOTO.1905.003',
    notes: 'Original glass negative preserved separately. Print made from high-resolution scan.',
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z'
  },
  {
    id: '6',
    title: 'Arts & Crafts Oak Sideboard',
    alternateTitle: 'Dining Room Server',
    aboutText: 'This quarter-sawn white oak sideboard was commissioned by the original owners specifically for the North Star House dining room. The piece features typical Arts and Crafts construction: exposed tenon joints, hammered copper hardware, and a simple, functional form. The back panel includes a beveled mirror flanked by small display shelves. The rich fumed oak finish has developed a beautiful patina over more than a century of use.',
    images: [
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', caption: 'Sideboard in dining room setting', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800', caption: 'Detail of exposed joinery', isPrimary: false }
    ],
    objectType: 'Furniture',
    dateCreated: 'c. 1906',
    datePeriod: 'Arts & Crafts Era',
    makers: [
      { name: 'Unknown Craftsman', role: 'Cabinetmaker' }
    ],
    dimensions: '54" W x 22" D x 48" H',
    materials: ['Quarter-sawn White Oak', 'Hammered Copper', 'Beveled Mirror Glass'],
    condition: 'Very Good - original finish, minor wear consistent with age',
    keywords: ['furniture', 'dining', 'oak', 'Arts & Crafts', 'storage', 'original'],
    collection: 'Furnishings',
    location: 'Dining Room - in situ',
    provenance: 'Original to house, purchased by first owners. Remained with property through all ownership changes.',
    acquisitionDate: '1906',
    acquisitionMethod: 'Original Purchase',
    donor: '',
    accessionNumber: 'NSH.FURN.1906.001',
    notes: 'Brass plate on back indicates "Sacramento Cabinet Works" but no records of this company survive.',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  },
  {
    id: '7',
    title: 'Stained Glass Window Panel',
    alternateTitle: 'Stairwell Nature Scene',
    aboutText: 'This exceptional stained glass panel graces the main stairwell landing, depicting a California landscape with native oaks and rolling hills. The design uses opalescent glass in the American style, with rich greens, golds, and blues creating a luminous scene when backlit. The panel demonstrates the integration of nature themes throughout Morgan\'s designs, bringing the outdoors inside in a permanent, artistic form.',
    images: [
      { url: 'https://images.unsplash.com/photo-1551913902-c92207136625?w=800', caption: 'Window panel with afternoon light', isPrimary: true }
    ],
    objectType: 'Decorative Art',
    dateCreated: '1905',
    datePeriod: 'Arts & Crafts Era',
    makers: [
      { name: 'Julia Morgan', role: 'Designer' },
      { name: 'Unknown Studio', role: 'Glass Artisan' }
    ],
    dimensions: '36" W x 60" H',
    materials: ['Opalescent Glass', 'Lead Came', 'Copper Foil'],
    condition: 'Excellent - professionally conserved 2010',
    keywords: ['glass', 'stained glass', 'window', 'nature', 'landscape', 'Arts & Crafts'],
    collection: 'Original Fixtures',
    location: 'Main Stairwell Landing - in situ',
    provenance: 'Original to building. Glass studio unidentified but likely San Francisco-based.',
    acquisitionDate: '1905',
    acquisitionMethod: 'Original Construction',
    donor: '',
    accessionNumber: 'NSH.1905.008',
    notes: 'Protective glazing installed exterior side, 2010. UV filtering glass used.',
    createdAt: '2024-01-19T09:30:00Z',
    updatedAt: '2024-01-19T09:30:00Z'
  },
  {
    id: '8',
    title: 'Granite Foundation Stone',
    alternateTitle: 'Cornerstone Sample',
    aboutText: 'This sample of local granite represents the foundation material used throughout the North Star House. Quarried from a site less than five miles from the building location, the stone exemplifies Julia Morgan\'s commitment to using local materials whenever possible. The granite\'s warm gray color with pink feldspar inclusions complements the redwood and copper used elsewhere in the building. This piece was salvaged during foundation repairs in 1998.',
    images: [
      { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800', caption: 'Granite sample showing characteristic color', isPrimary: true }
    ],
    objectType: 'Building Material',
    dateCreated: '1905',
    datePeriod: 'Arts & Crafts Era',
    makers: [
      { name: 'Local Quarry', role: 'Source' }
    ],
    dimensions: '12" x 8" x 6"',
    materials: ['Granite'],
    condition: 'Good - natural weathering',
    keywords: ['stone', 'foundation', 'granite', 'local', 'structural', 'quarry'],
    collection: 'Building Materials',
    location: 'Archive Room - Display Case',
    provenance: 'Salvaged during 1998 foundation repair project. Documented removal location.',
    acquisitionDate: '1998-09-15',
    acquisitionMethod: 'Salvage',
    donor: '',
    accessionNumber: 'NSH.MAT.1998.001',
    notes: 'GPS coordinates of original quarry site recorded. Quarry no longer active.',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z'
  }
];

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const IconArrowLeft = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconSearch = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        {/* Main Image */}
        <div
          className="relative aspect-[4/3] cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        >
          <img
            src={currentImage.url}
            alt={currentImage.caption || title}
            className="w-full h-full object-cover"
          />
          <button
            className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
          >
            <IconZoomIn size={20} />
          </button>
        </div>

        {/* Navigation Arrows */}
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

        {/* Caption */}
        {currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
            <p className="text-white text-sm">{currentImage.caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
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
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
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
// METADATA GRID COMPONENT
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
      <MetadataField
        label="Object Type"
        value={object.objectType}
        isClickable
        onClick={() => onFilterClick('objectType', object.objectType)}
      />
      <MetadataField label="Date" value={object.dateCreated} />
      <MetadataField label="Period" value={object.datePeriod} />
      <MetadataField label="Dimensions" value={object.dimensions} />
      <MetadataField
        label="Materials"
        value={object.materials}
        isClickable
        onClick={() => onFilterClick('materials', object.materials[0])}
      />
      <MetadataField label="Condition" value={object.condition} />
      <MetadataField
        label="Collection"
        value={object.collection}
        isClickable
        onClick={() => onFilterClick('collection', object.collection)}
      />
      <MetadataField label="Location" value={object.location} />
      <MetadataField label="Accession Number" value={object.accessionNumber} />
      <MetadataField label="Acquisition Date" value={object.acquisitionDate} />
      <MetadataField label="Acquisition Method" value={object.acquisitionMethod} />
      {object.donor && <MetadataField label="Donor" value={object.donor} />}
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
        <p className="text-sm text-gold">{object.dateCreated}</p>
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

        // Same collection: +3
        if (obj.collection === currentObject.collection) score += 3;

        // Same object type: +2
        if (obj.objectType === currentObject.objectType) score += 2;

        // Shared keywords: +1 each
        const sharedKeywords = obj.keywords?.filter(k =>
          currentObject.keywords?.includes(k)
        ) || [];
        score += sharedKeywords.length;

        // Shared materials: +1 each
        const sharedMaterials = obj.materials?.filter(m =>
          currentObject.materials?.includes(m)
        ) || [];
        score += sharedMaterials.length;

        // Same maker: +2
        const currentMakers = currentObject.makers?.map(m => m.name) || [];
        const objMakers = obj.makers?.map(m => m.name) || [];
        const sharedMakers = objMakers.filter(m => currentMakers.includes(m));
        score += sharedMakers.length * 2;

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
// MAKER INPUT COMPONENT
// ============================================================================

const MakerInput = ({ makers, onChange }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const addMaker = () => {
    if (name.trim()) {
      onChange([...makers, { name: name.trim(), role: role.trim() || 'Contributor' }]);
      setName('');
      setRole('');
    }
  };

  const removeMaker = (idx) => {
    onChange(makers.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      {makers.map((maker, idx) => (
        <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg">
          <span className="flex-1">
            <span className="font-medium">{maker.name}</span>
            <span className="text-stone-500 ml-2">({maker.role})</span>
          </span>
          <button
            type="button"
            onClick={() => removeMaker(idx)}
            className="text-stone-400 hover:text-red-600"
          >
            <IconX size={18} />
          </button>
        </div>
      ))}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Role (e.g., Architect, Craftsman)"
          className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
        />
      </div>
      <button
        type="button"
        onClick={addMaker}
        className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm"
      >
        <IconPlus size={16} /> Add Contributor
      </button>
    </div>
  );
};

// ============================================================================
// IMAGE INPUT COMPONENT
// ============================================================================

const ImageInput = ({ images, onChange }) => {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  const addImage = () => {
    if (url.trim()) {
      const isPrimary = images.length === 0;
      onChange([...images, { url: url.trim(), caption: caption.trim(), isPrimary }]);
      setUrl('');
      setCaption('');
    }
  };

  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    // Ensure at least one primary if images remain
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
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
        />
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={addImage}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm"
        >
          <IconPlus size={16} /> Add Image
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN FORM COMPONENT
// ============================================================================

const AdminForm = ({ object, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    alternateTitle: '',
    aboutText: '',
    images: [],
    objectType: '',
    dateCreated: '',
    datePeriod: '',
    makers: [],
    dimensions: '',
    materials: [],
    condition: '',
    keywords: [],
    collection: '',
    location: '',
    provenance: '',
    acquisitionDate: '',
    acquisitionMethod: '',
    donor: '',
    accessionNumber: '',
    notes: '',
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
      {/* Basic Information */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Title <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-stone-700 mb-1">Alternate Title</label>
            <input
              type="text"
              value={form.alternateTitle}
              onChange={(e) => updateField('alternateTitle', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">About</label>
            <textarea
              value={form.aboutText}
              onChange={(e) => updateField('aboutText', e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg resize-none"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Images</h3>
        <ImageInput
          images={form.images}
          onChange={(images) => updateField('images', images)}
        />
      </section>

      {/* Classification */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Object Type</label>
            <select
              value={form.objectType}
              onChange={(e) => updateField('objectType', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white"
            >
              <option value="">Select type...</option>
              {OBJECT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Collection</label>
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
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Date Created</label>
            <input
              type="text"
              value={form.dateCreated}
              onChange={(e) => updateField('dateCreated', e.target.value)}
              placeholder="e.g., 1905, c. 1900, 1905-1910"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Period</label>
            <input
              type="text"
              value={form.datePeriod}
              onChange={(e) => updateField('datePeriod', e.target.value)}
              placeholder="e.g., Arts & Crafts Era"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Keywords</label>
          <TagInput
            tags={form.keywords}
            onChange={(tags) => updateField('keywords', tags)}
            placeholder="Add keyword..."
          />
        </div>
      </section>

      {/* Physical Details */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Physical Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Dimensions</label>
            <input
              type="text"
              value={form.dimensions}
              onChange={(e) => updateField('dimensions', e.target.value)}
              placeholder='e.g., 24" x 36" x 12"'
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Condition</label>
            <input
              type="text"
              value={form.condition}
              onChange={(e) => updateField('condition', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Accession Number</label>
            <input
              type="text"
              value={form.accessionNumber}
              onChange={(e) => updateField('accessionNumber', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Materials</label>
          <TagInput
            tags={form.materials}
            onChange={(tags) => updateField('materials', tags)}
            placeholder="Add material..."
          />
        </div>
      </section>

      {/* Contributors */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Contributors</h3>
        <MakerInput
          makers={form.makers}
          onChange={(makers) => updateField('makers', makers)}
        />
      </section>

      {/* Provenance */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Provenance & Acquisition</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Provenance</label>
            <textarea
              value={form.provenance}
              onChange={(e) => updateField('provenance', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Acquisition Date</label>
              <input
                type="text"
                value={form.acquisitionDate}
                onChange={(e) => updateField('acquisitionDate', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Acquisition Method</label>
              <input
                type="text"
                value={form.acquisitionMethod}
                onChange={(e) => updateField('acquisitionMethod', e.target.value)}
                placeholder="e.g., Donation, Purchase"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Donor</label>
              <input
                type="text"
                value={form.donor}
                onChange={(e) => updateField('donor', e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Internal Notes</h3>
        <textarea
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg resize-none"
          placeholder="Notes for staff use only..."
        />
      </section>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-stone-200">
        <button
          type="submit"
          className="flex-1 bg-gold hover:bg-gold-dark text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          {object?.id ? 'Save Changes' : 'Add Object'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
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

const ObjectDetailView = ({ object, allObjects, onBack, onEdit, onFilterClick, onObjectClick }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-600 hover:text-gold transition-colors mb-6"
      >
        <IconArrowLeft size={20} />
        <span>Back to Collection</span>
      </button>

      {/* Image Gallery */}
      <ImageGallery images={object.images} title={object.title} />

      {/* Title Section */}
      <div className="mt-8 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-stone-800">
              {object.title}
            </h1>
            {object.alternateTitle && (
              <p className="text-lg text-stone-500 italic mt-1">{object.alternateTitle}</p>
            )}
          </div>
          <button
            onClick={() => onEdit(object)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-sm"
          >
            <IconEdit size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* About Section */}
      {object.aboutText && (
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold text-stone-800 mb-3">About</h2>
          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{object.aboutText}</p>
        </div>
      )}

      {/* Makers */}
      {object.makers && object.makers.length > 0 && (
        <div className="mb-6 pb-6 border-b border-stone-200">
          <h3 className="metadata-label">Contributors</h3>
          <div className="space-y-1">
            {object.makers.map((maker, idx) => (
              <div key={idx} className="text-stone-800">
                <span className="font-medium">{maker.name}</span>
                <span className="text-stone-500 ml-2">({maker.role})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Grid */}
      <MetadataGrid object={object} onFilterClick={onFilterClick} />

      {/* Keywords */}
      {object.keywords && object.keywords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-stone-200">
          <h3 className="metadata-label mb-2">Keywords</h3>
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

      {/* Provenance */}
      {object.provenance && (
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="font-display text-xl font-semibold text-stone-800 mb-3">Provenance</h3>
          <p className="text-stone-700 leading-relaxed">{object.provenance}</p>
        </div>
      )}

      {/* Related Objects */}
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

const BrowseView = ({ objects, filters, onFilterChange, onObjectClick, onAddNew }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique values for filter dropdowns
  const objectTypes = [...new Set(objects.map(o => o.objectType).filter(Boolean))];
  const collections = [...new Set(objects.map(o => o.collection).filter(Boolean))];
  const allKeywords = [...new Set(objects.flatMap(o => o.keywords || []))];

  // Filter objects
  const filteredObjects = useMemo(() => {
    return objects.filter(obj => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          obj.title,
          obj.alternateTitle,
          obj.aboutText,
          obj.objectType,
          ...(obj.keywords || []),
          ...(obj.makers?.map(m => m.name) || [])
        ].join(' ').toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      // Object type filter
      if (filters.objectType && obj.objectType !== filters.objectType) return false;

      // Collection filter
      if (filters.collection && obj.collection !== filters.collection) return false;

      // Keyword filter
      if (filters.keyword && !obj.keywords?.includes(filters.keyword)) return false;

      // Materials filter
      if (filters.materials && !obj.materials?.includes(filters.materials)) return false;

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
          <p className="text-stone-600 mt-1">North Star House Collection</p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-5 py-3 rounded-lg font-medium transition-colors"
        >
          <IconPlus size={20} />
          Add Object
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <IconSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search objects..."
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.objectType || ''}
            onChange={(e) => onFilterChange({ ...filters, objectType: e.target.value || null })}
            className="px-4 py-3 border border-stone-300 rounded-lg bg-white min-w-[160px]"
          >
            <option value="">All Types</option>
            {objectTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Collection Filter */}
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

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <span className="text-sm text-stone-500">Active filters:</span>
            {searchQuery && (
              <span className="tag tag-gold">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1">
                  <IconX size={14} />
                </button>
              </span>
            )}
            {filters.objectType && (
              <span className="tag tag-gold">
                Type: {filters.objectType}
                <button onClick={() => onFilterChange({ ...filters, objectType: null })} className="ml-1">
                  <IconX size={14} />
                </button>
              </span>
            )}
            {filters.collection && (
              <span className="tag tag-gold">
                Collection: {filters.collection}
                <button onClick={() => onFilterChange({ ...filters, collection: null })} className="ml-1">
                  <IconX size={14} />
                </button>
              </span>
            )}
            {filters.keyword && (
              <span className="tag tag-gold">
                Keyword: {filters.keyword}
                <button onClick={() => onFilterChange({ ...filters, keyword: null })} className="ml-1">
                  <IconX size={14} />
                </button>
              </span>
            )}
            {filters.materials && (
              <span className="tag tag-gold">
                Material: {filters.materials}
                <button onClick={() => onFilterChange({ ...filters, materials: null })} className="ml-1">
                  <IconX size={14} />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gold hover:text-gold-dark ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-stone-600 mb-4">
        {filteredObjects.length} {filteredObjects.length === 1 ? 'object' : 'objects'} found
      </p>

      {/* Object Grid */}
      {filteredObjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <IconGrid size={48} className="mx-auto text-stone-300 mb-4" />
          <p className="text-stone-600 text-lg">No objects match your search</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-gold hover:text-gold-dark"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObjects.map(obj => (
            <ObjectCard
              key={obj.id}
              object={obj}
              onClick={() => onObjectClick(obj)}
            />
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
  const [objects, setObjects] = useState(INITIAL_OBJECTS);
  const [view, setView] = useState('browse'); // browse | detail | add | edit
  const [selectedObject, setSelectedObject] = useState(null);
  const [editingObject, setEditingObject] = useState(null);
  const [filters, setFilters] = useState({});

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

  const handleSave = (savedObject) => {
    if (editingObject) {
      // Update existing
      setObjects(prev => prev.map(o => o.id === savedObject.id ? savedObject : o));
      setSelectedObject(savedObject);
    } else {
      // Add new
      setObjects(prev => [...prev, savedObject]);
      setSelectedObject(savedObject);
    }
    setView('detail');
    setEditingObject(null);
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
          />
        )}

        {view === 'detail' && selectedObject && (
          <ObjectDetailView
            object={selectedObject}
            allObjects={objects}
            onBack={handleBack}
            onEdit={handleEdit}
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
