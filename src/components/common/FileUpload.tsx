
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
  folderPath?: string;
}

export function FileUpload({
  onUploadComplete,
  currentImageUrl,
  bucketName = "images",
  folderPath = "inventory",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Imagem muito grande",
        description: "O tamanho máximo é 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas imagens são permitidas",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filePath = `${folderPath}/${timestamp}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase
        .storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Return URL to parent component
      onUploadComplete(publicUrl);

      toast({
        title: "Imagem carregada",
        description: "A imagem foi carregada com sucesso",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar a imagem",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-40 rounded-md object-cover" 
          />
          <Button 
            size="icon" 
            variant="destructive" 
            className="absolute top-2 right-2 h-6 w-6" 
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 h-40">
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <div className="flex flex-col items-center justify-center">
              {isUploading ? (
                <div className="animate-pulse">A carregar...</div>
              ) : (
                <>
                  <Image className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Clique para carregar uma imagem
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG ou GIF até 5MB
                  </p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
}
