import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LazyImage from "./LazyImage";
import { Search, Grid, List, Image, Video, Folder, ChevronRight, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
}

interface StorageBrowserProps {
  onSelectFile: (fileUrl: string, fileName: string) => void;
  onCancel: () => void;
  bucketName?: string;
}

const StorageBrowser = ({ onSelectFile, onCancel, bucketName = "photos" }: StorageBrowserProps) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBucket, setSelectedBucket] = useState(bucketName);
  const [currentPath, setCurrentPath] = useState("");
  const { toast } = useToast();

  const buckets = ["photos", "videos", "thumbnails"];

  useEffect(() => {
    fetchFiles();
  }, [selectedBucket, currentPath]);

  useEffect(() => {
    const filtered = files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [files, searchTerm]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(selectedBucket)
        .list(currentPath, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;
      
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load files from storage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (fileName: string) => {
    const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
    return `https://ijgrizsbxnevkngbidew.supabase.co/storage/v1/object/public/${selectedBucket}/${fullPath}`;
  };

  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
  };

  const isVideo = (fileName: string) => {
    return /\.(mp4|webm|ogg|mov|avi)$/i.test(fileName);
  };

  const isFolder = (file: StorageFile) => {
    return !file.metadata && !isImage(file.name) && !isVideo(file.name) && !file.name.includes('.');
  };

  const handleFileSelect = (file: StorageFile) => {
    if (isFolder(file)) {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      setCurrentPath(newPath);
      setSearchTerm(""); // Clear search when navigating
    } else {
      const fileUrl = getFileUrl(file.name);
      onSelectFile(fileUrl, file.name);
    }
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
    setSearchTerm("");
  };

  const navigateToRoot = () => {
    setCurrentPath("");
    setSearchTerm("");
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6 border border-border rounded-lg bg-card">
        <div className="text-center">
          <div className="animate-pulse">Loading storage files...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-border rounded-lg bg-card max-h-[600px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-4">Select from Storage</h3>
        
        {/* Breadcrumb Navigation */}
        {currentPath && (
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <button
              onClick={navigateToRoot}
              className="hover:text-foreground flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              {selectedBucket}
            </button>
            {getBreadcrumbs().map((folder, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <span>{folder}</span>
              </div>
            ))}
            {currentPath && (
              <button
                onClick={navigateUp}
                className="ml-2 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
              >
                Back
              </button>
            )}
          </div>
        )}
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Bucket Selector */}
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            {buckets.map(bucket => (
              <option key={bucket} value={bucket}>{bucket}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 border border-border rounded-md p-1">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="px-2 py-1"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="px-2 py-1"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No files found in {selectedBucket} bucket
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-4 gap-3" 
            : "space-y-2"
          }>
            {filteredFiles.map((file) => (
              <div
                key={file.name}
                onClick={() => handleFileSelect(file)}
                className={`cursor-pointer border border-border rounded-md hover:border-primary/50 transition-colors ${
                  viewMode === "grid" 
                    ? "p-2 aspect-square" 
                    : "p-3 flex items-center gap-3"
                }`}
              >
                {viewMode === "grid" ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center bg-muted rounded mb-2">
                      {isFolder(file) ? (
                        <Folder className="w-8 h-8 text-muted-foreground" />
                      ) : isImage(file.name) ? (
                        <LazyImage
                          src={getFileUrl(file.name)}
                          alt={file.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : isVideo(file.name) ? (
                        <Video className="w-8 h-8 text-muted-foreground" />
                      ) : (
                        <Image className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs truncate text-center">{file.name}</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                      {isFolder(file) ? (
                        <Folder className="w-6 h-6 text-muted-foreground" />
                      ) : isImage(file.name) ? (
                        <LazyImage
                          src={getFileUrl(file.name)}
                          alt={file.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : isVideo(file.name) ? (
                        <Video className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <Image className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {isFolder(file) ? 'Folder' : file.updated_at ? new Date(file.updated_at).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default StorageBrowser;