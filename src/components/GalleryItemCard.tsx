import React, { useState } from "react";

type Item = {
  id: number;
  title: string;
  fileUrl: string;
  mediaType: string;
};

export default function GalleryItemCard({ 
  item, 
  baseUrl = "", 
  onDelete 
}: { 
  item: Item; 
  baseUrl?: string; 
  onDelete?: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  
  const url = item.fileUrl.startsWith("/") 
    ? (baseUrl.replace(/\/$/, "") + item.fileUrl) 
    : item.fileUrl;

  return (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="relative h-48 w-full bg-gray-100">
        {item.mediaType === "VIDEO" ? (
          <video 
            src={url} 
            controls 
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={imageError ? '/placeholder-image.png' : url}
            alt={item.title || "Gallery item"} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {item.mediaType}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium truncate flex-1 mr-2">
            {item.title || "Untitled"}
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}