const { useState, useEffect, useMemo } = React;

// ============================================================================
// SAMPLE DATA - North Star House / Julia Morgan themed objects
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
  'Original Fixtures',
  'Construction Documents',
  'Historic Photographs',
  'Restored Elements',
  'Building Materials',
  'Furnishings',
  'Donor Contributions',
  'Morgan Archives',
  'Arts & Crafts Collection'
];

const MAKER_ROLES = [
  'Architect',
  'Designer',
  'Builder',
  'Craftsman',
  'Artist',
  'Collaborator',
  'Fabricator',
  'Photographer',
  'Artisan',
  'Contractor'
];

const INITIAL_OBJECTS = [
  {
    id: '1',
    title: 'Original Redwood Ceiling Beam',
    aboutText: 'This magnificent old-growth redwood beam is one of the original structural elements from the 1905 construction of the North Star House. Measuring over 20 feet in length, it showcases the exceptional craftsmanship and material quality that Julia Morgan specified for her buildings. The beam features hand-hewn surfaces and original iron hardware attachments, demonstrating the Arts and Crafts commitment to honest expression of materials and construction methods.',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', caption: 'Full beam view showing grain pattern', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800', caption: 'Detail of iron hardware connection', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800', caption: 'End grain showing old-growth rings', isPrimary: false }
    ],
    from: 'Original Construction',
    designer: 'Julia Morgan',
    maker: 'Pacific Lumber Company',
    makerRole: 'Fabricator',
    portfolioTitle: 'North Star House - Structural Elements',
    mediumMaterials: 'Old-growth Redwood, Wrought Iron hardware',
    measurements: '20\' 6" L x 12" W x 14" H',
    keywords: ['structural', 'original', 'redwood', '1900s', 'Arts & Crafts', 'ceiling', 'timber'],
    collection: 'Building Materials',
    objectType: 'Architectural Element',
    objectNumber: 'NSH.1905.001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Hammered Copper Lantern',
    aboutText: 'A stunning example of Arts and Crafts metalwork, this hammered copper lantern was designed by Julia Morgan specifically for the North Star House entry. The hand-hammered texture creates a warm, dancing light pattern on surrounding walls. The lantern features amber art glass panels and original copper chain suspension hardware. This piece exemplifies Morgan\'s attention to every detail of her buildings, from structure to decorative elements.',
    images: [
      { url: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800', caption: 'Lantern illuminated at dusk', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800', caption: 'Detail of hammered copper texture', isPrimary: false }
    ],
    from: 'Original Construction',
    designer: 'Julia Morgan',
    maker: 'Dirk van Erp Studio (attributed)',
    makerRole: 'Artisan',
    portfolioTitle: 'North Star House - Lighting Fixtures',
    mediumMaterials: 'Hammered Copper, Amber Art Glass, Brass fittings',
    measurements: '24" H x 14" Diameter',
    keywords: ['lighting', 'Arts & Crafts', 'handcrafted', 'copper', 'entry', 'original', 'metalwork'],
    collection: 'Original Fixtures',
    objectType: 'Fixture',
    objectNumber: 'NSH.1905.015',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    title: 'Original Construction Blueprint - Main Floor',
    aboutText: 'This original blueprint from Julia Morgan\'s office shows the complete main floor plan of the North Star House as designed in 1904. The drawing includes detailed room layouts, structural notations in Morgan\'s distinctive hand, and material specifications. Blueprint annotations reveal last-minute design changes and the collaborative relationship between Morgan and her clients. This document is invaluable for understanding Morgan\'s design process and the original intent for the space.',
    images: [
      { url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', caption: 'Full blueprint showing main floor layout', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800', caption: 'Detail of Morgan\'s handwritten notes', isPrimary: false }
    ],
    from: 'Cal Poly San Luis Obispo - Morgan Collection (Donated 1980)',
    designer: 'Julia Morgan',
    maker: 'Julia Morgan Office',
    makerRole: 'Architect',
    portfolioTitle: 'Morgan Drawing No. 12',
    mediumMaterials: 'Paper, Blueprint (cyanotype)',
    measurements: '36" x 48"',
    keywords: ['plans', 'architecture', 'original', 'blueprint', 'Morgan', 'design', 'drawing'],
    collection: 'Construction Documents',
    objectType: 'Document',
    objectNumber: 'NSH.DOC.1904.012',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z'
  },
  {
    id: '4',
    title: 'Hand-Forged Iron Door Hinge',
    aboutText: 'This substantial hand-forged iron hinge is one of a matched set of six that support the main entry doors. Each hinge was individually crafted by a local blacksmith, featuring a decorative scroll terminal that echoes the organic forms favored in Arts and Crafts metalwork. The forging marks are intentionally visible, celebrating the handmade nature of the work. These hinges have supported the original oak doors for over a century.',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', caption: 'Hinge mounted on original door', isPrimary: true }
    ],
    from: 'Original Construction',
    designer: 'Julia Morgan',
    maker: 'Unknown Grass Valley Blacksmith',
    makerRole: 'Craftsman',
    portfolioTitle: 'North Star House - Hardware Collection',
    mediumMaterials: 'Wrought Iron, hand-forged',
    measurements: '18" L x 3" W',
    keywords: ['hardware', 'handmade', 'iron', 'doors', 'blacksmith', 'entry', 'forged'],
    collection: 'Original Fixtures',
    objectType: 'Architectural Element',
    objectNumber: 'NSH.1905.022',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z'
  },
  {
    id: '5',
    title: 'Construction Photograph - Workers on Scaffolding',
    aboutText: 'This remarkable photograph captures construction workers on wooden scaffolding during the building of the North Star House in 1905. The image shows the west elevation partially complete, with workers visible at various levels of the structure. This photograph provides invaluable documentation of early 20th century construction methods and the scale of effort required to build Morgan\'s designs. Several workers are identifiable and their descendants remain in the Grass Valley community.',
    images: [
      { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', caption: 'Workers on scaffolding, west elevation', isPrimary: true }
    ],
    from: 'Grass Valley Historical Society (Donated 1992)',
    designer: '',
    maker: 'Unknown Photographer',
    makerRole: 'Photographer',
    portfolioTitle: 'Building the North Star House, 1905',
    mediumMaterials: 'Silver Gelatin Print, Glass Plate Negative',
    measurements: '8" x 10" (original negative)',
    keywords: ['construction', 'history', 'workers', '1900s', 'scaffolding', 'building', 'photograph'],
    collection: 'Historic Photographs',
    objectType: 'Photograph',
    objectNumber: 'NSH.PHOTO.1905.003',
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z'
  },
  {
    id: '6',
    title: 'Arts & Crafts Oak Sideboard',
    aboutText: 'This quarter-sawn white oak sideboard was commissioned by the original owners specifically for the North Star House dining room. The piece features typical Arts and Crafts construction: exposed tenon joints, hammered copper hardware, and a simple, functional form. The back panel includes a beveled mirror flanked by small display shelves. The rich fumed oak finish has developed a beautiful patina over more than a century of use.',
    images: [
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', caption: 'Sideboard in dining room setting', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800', caption: 'Detail of exposed joinery', isPrimary: false }
    ],
    from: 'Original Purchase by First Owners',
    designer: 'Unknown',
    maker: 'Sacramento Cabinet Works',
    makerRole: 'Builder',
    portfolioTitle: 'North Star House - Original Furnishings',
    mediumMaterials: 'Quarter-sawn White Oak, Hammered Copper hardware, Beveled Mirror Glass',
    measurements: '54" W x 22" D x 48" H',
    keywords: ['furniture', 'dining', 'oak', 'Arts & Crafts', 'storage', 'original', 'sideboard'],
    collection: 'Furnishings',
    objectType: 'Furniture',
    objectNumber: 'NSH.FURN.1906.001',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  },
  {
    id: '7',
    title: 'Stained Glass Window Panel',
    aboutText: 'This exceptional stained glass panel graces the main stairwell landing, depicting a California landscape with native oaks and rolling hills. The design uses opalescent glass in the American style, with rich greens, golds, and blues creating a luminous scene when backlit. The panel demonstrates the integration of nature themes throughout Morgan\'s designs, bringing the outdoors inside in a permanent, artistic form.',
    images: [
      { url: 'https://images.unsplash.com/photo-1551913902-c92207136625?w=800', caption: 'Window panel with afternoon light', isPrimary: true }
    ],
    from: 'Original Construction',
    designer: 'Julia Morgan',
    maker: 'Unknown San Francisco Glass Studio',
    makerRole: 'Artisan',
    portfolioTitle: 'North Star House - Decorative Glass',
    mediumMaterials: 'Opalescent Glass, Lead Came, Copper Foil',
    measurements: '36" W x 60" H',
    keywords: ['glass', 'stained glass', 'window', 'nature', 'landscape', 'Arts & Crafts', 'decorative'],
    collection: 'Original Fixtures',
    objectType: 'Decorative Art',
    objectNumber: 'NSH.1905.008',
    createdAt: '2024-01-19T09:30:00Z',
    updatedAt: '2024-01-19T09:30:00Z'
  },
  {
    id: '8',
    title: 'Granite Foundation Stone',
    aboutText: 'This sample of local granite represents the foundation material used throughout the North Star House. Quarried from a site less than five miles from the building location, the stone exemplifies Julia Morgan\'s commitment to using local materials whenever possible. The granite\'s warm gray color with pink feldspar inclusions complements the redwood and copper used elsewhere in the building. This piece was salvaged during foundation repairs in 1998.',
    images: [
      { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800', caption: 'Granite sample showing characteristic color', isPrimary: true }
    ],
    from: 'Salvaged during 1998 foundation repair',
    designer: 'Julia Morgan',
    maker: 'Local Grass Valley Quarry',
    makerRole: 'Fabricator',
    portfolioTitle: 'North Star House - Foundation Materials',
    mediumMaterials: 'Granite with pink feldspar inclusions',
    measurements: '12" x 8" x 6"',
    keywords: ['stone', 'foundation', 'granite', 'local', 'structural', 'quarry', 'material'],
    collection: 'Building Materials',
    objectType: 'Building Material',
    objectNumber: 'NSH.MAT.1998.001',
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
      <MetadataField label="Object Number" value={object.objectNumber} />
      <MetadataField
        label="Named Collection"
        value={object.collection}
        isClickable
        onClick={() => onFilterClick('collection', object.collection)}
      />
      <MetadataField label="Portfolio Title" value={object.portfolioTitle} />
      <MetadataField label="Medium & Materials" value={object.mediumMaterials} />
      <MetadataField label="Measurements" value={object.measurements} />
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
      <MetadataField label="Maker Role" value={object.makerRole} />
      <MetadataField label="From (Origin/Donor/Source)" value={object.from} />
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

        // Same collection: +3
        if (obj.collection === currentObject.collection) score += 3;

        // Same object type: +2
        if (obj.objectType === currentObject.objectType) score += 2;

        // Same designer: +2
        if (obj.designer && obj.designer === currentObject.designer) score += 2;

        // Same maker: +2
        if (obj.maker && obj.maker === currentObject.maker) score += 2;

        // Shared keywords: +1 each
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
    aboutText: '',
    images: [],
    from: '',
    designer: '',
    maker: '',
    makerRole: '',
    portfolioTitle: '',
    mediumMaterials: '',
    measurements: '',
    keywords: [],
    collection: '',
    objectType: '',
    objectNumber: '',
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
      {/* Images - First as specified */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Images</h3>
        <p className="text-sm text-stone-500 mb-3">Add multiple images with zoom and carousel support</p>
        <ImageInput
          images={form.images}
          onChange={(images) => updateField('images', images)}
        />
      </section>

      {/* From (Origin/Donor/Source) */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Origin Information</h3>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            From (Origin, Donor, or Source)
          </label>
          <input
            type="text"
            value={form.from}
            onChange={(e) => updateField('from', e.target.value)}
            placeholder="e.g., Original Construction, Donated by Smith Family, Purchased 1980"
            className="w-full px-4 py-3 border border-stone-300 rounded-lg"
          />
        </div>
      </section>

      {/* Name / Title */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Name / Title <span className="text-red-500">*</span>
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
            <p className="text-xs text-stone-500 mb-2">Short descriptive narrative</p>
            <textarea
              value={form.aboutText}
              onChange={(e) => updateField('aboutText', e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg resize-none"
            />
          </div>
        </div>
      </section>

      {/* Makers and Designers */}
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
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Maker Role</label>
            <select
              value={form.makerRole}
              onChange={(e) => updateField('makerRole', e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white"
            >
              <option value="">Select role...</option>
              {MAKER_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Portfolio Title</label>
            <input
              type="text"
              value={form.portfolioTitle}
              onChange={(e) => updateField('portfolioTitle', e.target.value)}
              placeholder="e.g., North Star House - Structural Elements"
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
            <label className="block text-sm font-medium text-stone-700 mb-1">Medium and Materials</label>
            <input
              type="text"
              value={form.mediumMaterials}
              onChange={(e) => updateField('mediumMaterials', e.target.value)}
              placeholder="e.g., Old-growth Redwood, Wrought Iron"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg"
            />
          </div>
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
      </section>

      {/* Keywords */}
      <section>
        <h3 className="font-display text-xl font-semibold text-stone-800 mb-4">Subject and Association Keywords</h3>
        <p className="text-sm text-stone-500 mb-3">Tag-based, searchable keywords</p>
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
          <div>
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Object Number</label>
            <p className="text-xs text-stone-500 mb-2">Unique identifier</p>
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
            {object.portfolioTitle && (
              <p className="text-lg text-stone-500 italic mt-1">{object.portfolioTitle}</p>
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
          <h2 className="font-display text-xl font-semibold text-stone-800 mb-3">About this Object</h2>
          <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{object.aboutText}</p>
        </div>
      )}

      {/* Metadata Grid */}
      <MetadataGrid object={object} onFilterClick={onFilterClick} />

      {/* Keywords */}
      {object.keywords && object.keywords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-stone-200">
          <h3 className="metadata-label mb-2">Subject & Association Keywords</h3>
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

  // Filter objects
  const filteredObjects = useMemo(() => {
    return objects.filter(obj => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          obj.title,
          obj.aboutText,
          obj.objectType,
          obj.designer,
          obj.maker,
          obj.from,
          obj.mediumMaterials,
          obj.portfolioTitle,
          ...(obj.keywords || [])
        ].join(' ').toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      // Object type filter
      if (filters.objectType && obj.objectType !== filters.objectType) return false;

      // Collection filter
      if (filters.collection && obj.collection !== filters.collection) return false;

      // Keyword filter
      if (filters.keywords && !obj.keywords?.includes(filters.keywords)) return false;

      // Designer filter
      if (filters.designer && obj.designer !== filters.designer) return false;

      // Maker filter
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
              placeholder="Search objects, keywords, makers..."
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
            {filters.keywords && (
              <span className="tag tag-gold">
                Keyword: {filters.keywords}
                <button onClick={() => onFilterChange({ ...filters, keywords: null })} className="ml-1">
                  <IconX size={14} />
                </button>
              </span>
            )}
            {filters.designer && (
              <span className="tag tag-gold">
                Designer: {filters.designer}
                <button onClick={() => onFilterChange({ ...filters, designer: null })} className="ml-1">
                  <IconX size={14} />
                </button>
              </span>
            )}
            {filters.maker && (
              <span className="tag tag-gold">
                Maker: {filters.maker}
                <button onClick={() => onFilterChange({ ...filters, maker: null })} className="ml-1">
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
