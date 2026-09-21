import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { Play, Image as ImageIcon, Calendar, X, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";

type GalleryItem = {
  id: number;
  title: string;
  fileUrl: string;
  mediaType: string;
  createdAt?: string;
};

type PublicGalleryProps = {
  preview?: boolean;
  maxItems?: number;
};

export default function PublicGallery({ preview = false, maxItems = 6 }: PublicGalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedItem?.mediaType === 'VIDEO' && videoRef.current) {
      videoRef.current.play();
    }
  }, [selectedItem]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/public/gallery");
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch public gallery", err);
    } finally {
      setLoading(false);
    }
  };

// AFTER:
// Strips 'api.' from the API URL so static media resolves to https://offhostel.org
const base = (import.meta.env.VITE_API_BASE_URL || "").replace("https://api.", "https://");

const getFileUrl = (fileUrl: string) => {
  if (!fileUrl) return "";
  if (fileUrl.startsWith('http')) return fileUrl;
  
  // If no base URL is defined in env, fall back to current root domain origin
  const hostBase = base || window.location.origin;
  const cleanBase = hostBase.replace(/\/$/, '');
  const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
  
  return cleanBase + cleanFileUrl;
};

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const openFullGallery = () => {
    // Set first item as selected and open modal
    if (items.length > 0) {
      setSelectedItem(items[0]);
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  // Handle keyboard events for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && selectedItem) {
        const currentIndex = items.findIndex(item => item.id === selectedItem.id);
        const nextIndex = (currentIndex + 1) % items.length;
        setSelectedItem(items[nextIndex]);
      }
      if (e.key === 'ArrowLeft' && selectedItem) {
        const currentIndex = items.findIndex(item => item.id === selectedItem.id);
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        setSelectedItem(items[prevIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, items, isModalOpen]);

  // Determine which items to show
  const displayItems = preview ? items.slice(0, maxItems) : items;
  const hasMoreItems = preview && items.length > maxItems;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No gallery items yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayItems.map((item, index) => (
          <div
            key={item.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-gray-100 hover:shadow-xl transition-all duration-300"
            onClick={() => openLightbox(item)}
          >
            {item.mediaType === 'VIDEO' ? (
              <>
                <video
                  src={getFileUrl(item.fileUrl)}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-5 h-5 text-blue-600 fill-blue-600 ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" />
                </div>
              </>
            ) : (
              <>
                <img
                  src={getFileUrl(item.fileUrl)}
                  alt={item.title || "Gallery image"}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            )}
            
            {/* Title overlay on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-xs truncate">{item.title || "Untitled"}</p>
            </div>
          </div>
        ))}

        {/* "View All" Card - Only show in preview mode with more items */}
        {preview && hasMoreItems && (
          <div
            className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-gradient-to-br from-blue-500 to-purple-600 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            onClick={openFullGallery}
          >
            <div className="text-center text-white p-4">
              <div className="text-3xl font-bold mb-1">+{items.length - maxItems}</div>
              <div className="text-sm font-medium">View All</div>
              <Grid3x3 className="w-6 h-6 mx-auto mt-2 opacity-75" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        )}
      </div>

      {/* Full Gallery Modal */}
      {isModalOpen && selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {items.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = items.findIndex(item => item.id === selectedItem.id);
                    const prevIndex = (currentIndex - 1 + items.length) % items.length;
                    setSelectedItem(items[prevIndex]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all duration-200"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = items.findIndex(item => item.id === selectedItem.id);
                    const nextIndex = (currentIndex + 1) % items.length;
                    setSelectedItem(items[nextIndex]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all duration-200"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Content */}
            <div className="flex items-center justify-center min-h-[50vh] max-h-[85vh] p-4">
              {selectedItem.mediaType === 'VIDEO' ? (
                <video
                  ref={videoRef}
                  src={getFileUrl(selectedItem.fileUrl)}
                  controls
                  className="max-w-full max-h-[80vh] rounded-lg"
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={getFileUrl(selectedItem.fileUrl)}
                  alt={selectedItem.title || "Gallery image"}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </div>

            {/* Caption with thumbnail strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white text-lg font-semibold">{selectedItem.title || "Untitled"}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-3 py-0.5 rounded-full ${
                      selectedItem.mediaType === 'VIDEO'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {selectedItem.mediaType}
                    </span>
                    {selectedItem.createdAt && (
                      <span className="text-white/70 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                    <span className="text-white/40 text-xs">
                      {items.findIndex(item => item.id === selectedItem.id) + 1} / {items.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thumbnail strip */}
              {items.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedItem.id === item.id
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      {item.mediaType === 'VIDEO' ? (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <img
                          src={getFileUrl(item.fileUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
        }
      `}</style>
    </>
  );
}