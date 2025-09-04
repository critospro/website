import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "./FileUpload";
import StorageBrowser from "./StorageBrowser";
import { Upload, FolderOpen } from "lucide-react";

interface MediaSelectorProps {
  onUploadFile: (file: File, altText: string) => Promise<void>;
  onSelectFromStorage: (fileUrl: string, fileName: string) => void;
  onCancel: () => void;
  isUploading?: boolean;
  bucketName?: string;
}

const MediaSelector = ({ 
  onUploadFile, 
  onSelectFromStorage, 
  onCancel, 
  isUploading = false,
  bucketName = "photos"
}: MediaSelectorProps) => {
  const [activeTab, setActiveTab] = useState("upload");

  const handleStorageSelect = (fileUrl: string, fileName: string) => {
    // Generate a default alt text from filename
    const altText = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    onSelectFromStorage(fileUrl, altText);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload New
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Browse Storage
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <FileUpload
            onUpload={onUploadFile}
            onCancel={onCancel}
            isUploading={isUploading}
          />
        </TabsContent>
        
        <TabsContent value="browse" className="mt-6">
          <StorageBrowser
            onSelectFile={handleStorageSelect}
            onCancel={onCancel}
            bucketName={bucketName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaSelector;