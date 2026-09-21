import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import api from "../../api/axios";
import GalleryItemCard from "../../components/GalleryItemCard";

type GalleryItem = {
  id: number;
  title: string;
  fileUrl: string;
  mediaType: string;
  createdAt?: string;
};

type UploadFile = {
  file: File;
  title: string;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
};

export default function GalleryPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/gallery");
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch gallery items", err);
      alert("Failed to load gallery items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => {
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : undefined;
      
      return {
        file,
        title: file.name.split('.')[0] || "Untitled",
        type: isImage ? "IMAGE" : "VIDEO",
        progress: 0,
        status: 'pending' as const,
        preview
      };
    });

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(e.target.files);
    e.target.value = '';
  };

  // Define onDrop function
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateFileTitle = (index: number, title: string) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].title = title || "Untitled";
      return newFiles;
    });
  };

  const updateFileType = (index: number, type: string) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].type = type;
      return newFiles;
    });
  };

  const updateTotalProgress = () => {
    const total = uploadFiles.length;
    if (total === 0) {
      setTotalProgress(0);
      return;
    }
    const sum = uploadFiles.reduce((acc, file) => acc + file.progress, 0);
    setTotalProgress(Math.round(sum / total));
  };

  const uploadSingleFile = async (fileData: UploadFile, index: number): Promise<GalleryItem> => {
    const formData = new FormData();
    formData.append("file", fileData.file);
    formData.append("title", fileData.title || "Untitled");
    formData.append("type", fileData.type);

    setUploadFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].status = 'uploading';
      return newFiles;
    });

    try {
      const res = await api.post("/api/admin/gallery/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadFiles(prev => {
              const newFiles = [...prev];
              newFiles[index].progress = percentCompleted;
              return newFiles;
            });
            updateTotalProgress();
          }
        },
      });

      setUploadFiles(prev => {
        const newFiles = [...prev];
        newFiles[index].status = 'success';
        newFiles[index].progress = 100;
        return newFiles;
      });

      updateTotalProgress();
      return res.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || "Upload failed";
      setUploadFiles(prev => {
        const newFiles = [...prev];
        newFiles[index].status = 'error';
        newFiles[index].error = errorMessage;
        return newFiles;
      });
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setUploading(true);
    setTotalProgress(0);

    const uploadedItems: GalleryItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < uploadFiles.length; i++) {
      if (uploadFiles[i].status === 'pending') {
        try {
          const result = await uploadSingleFile(uploadFiles[i], i);
          uploadedItems.push(result);
        } catch (error: any) {
          errors.push(`${uploadFiles[i].file.name}: ${error.message}`);
        }
      }
    }

    if (uploadedItems.length > 0) {
      setItems(prev => [...uploadedItems, ...prev]);
    }

    if (errors.length > 0) {
      alert(`Upload completed with errors:\n${errors.join('\n')}`);
    }

    setUploadFiles(prev => prev.filter(f => f.status === 'error'));
    setUploading(false);
    setTotalProgress(0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this media item?")) return;
    
    try {
      await api.delete(`/api/admin/gallery/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed. Please try again.");
    }
  };

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace("https://api.", "https://");


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading gallery...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Upload Media</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          {/* File Drop Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Files</label>
            <div
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative flex items-center justify-center w-full rounded-lg border-2 border-dashed p-8 transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="text-center w-full">
                <input
                  id="gallery-file-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Drag & drop files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports multiple images and videos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* File List with Progress */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700">Files to Upload ({uploadFiles.length})</h4>
                {uploading && (
                  <div className="text-sm text-blue-600">
                    Overall Progress: {totalProgress}%
                  </div>
                )}
              </div>

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${totalProgress}%` }}
                  ></div>
                </div>
              )}

              {uploadFiles.map((fileData, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start gap-3">
                    {fileData.preview && fileData.type === "IMAGE" && (
                      <img 
                        src={fileData.preview} 
                        alt={fileData.file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    {fileData.preview && fileData.type === "VIDEO" && (
                      <video 
                        src={fileData.preview} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    {!fileData.preview && (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No preview</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={fileData.title}
                          onChange={(e) => updateFileTitle(index, e.target.value)}
                          className="flex-1 min-w-[100px] px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter title"
                          disabled={fileData.status === 'uploading' || fileData.status === 'success'}
                        />
                        <select
                          value={fileData.type}
                          onChange={(e) => updateFileType(index, e.target.value)}
                          className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={fileData.status === 'uploading' || fileData.status === 'success'}
                        >
                          <option value="IMAGE">Image</option>
                          <option value="VIDEO">Video</option>
                        </select>
                        {fileData.status !== 'uploading' && fileData.status !== 'success' && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {fileData.file.name} ({(fileData.file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>

                      {fileData.status === 'uploading' && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${fileData.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-blue-600 mt-1">{fileData.progress}%</span>
                        </div>
                      )}

                      {fileData.status === 'success' && (
                        <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Uploaded successfully
                        </div>
                      )}
                      {fileData.status === 'error' && (
                        <div className="mt-1 text-xs text-red-600">
                          Error: {fileData.error || 'Upload failed'}
                          <button
                            type="button"
                            onClick={() => {
                              setUploadFiles(prev => {
                                const newFiles = [...prev];
                                newFiles[index].status = 'pending';
                                newFiles[index].progress = 0;
                                newFiles[index].error = undefined;
                                return newFiles;
                              });
                            }}
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadFiles.filter(f => f.status === 'pending').length > 0 && (
            <button
              type="submit"
              disabled={uploading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uploading 
                ? `Uploading... ${totalProgress}%` 
                : `Upload ${uploadFiles.filter(f => f.status === 'pending').length} File(s)`}
            </button>
          )}
        </form>
      </div>

      {/* Gallery Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4">Gallery Items ({items.length})</h3>
        {items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No gallery items yet. Upload your first media!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <GalleryItemCard
                key={item.id}
                item={item}
                baseUrl={baseUrl}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}