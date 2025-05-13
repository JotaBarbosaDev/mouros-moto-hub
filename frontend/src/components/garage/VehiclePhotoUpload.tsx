
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/common/FileUpload";
import { UseFormReturn } from "react-hook-form";
import { VehicleFormValues } from "./schemas/vehicle-schema";

interface VehiclePhotoUploadProps {
  form: UseFormReturn<VehicleFormValues>;
}

export const VehiclePhotoUpload = ({ form }: VehiclePhotoUploadProps) => {
  return (
    <FormField
      control={form.control}
      name="photoUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Foto do Veículo</FormLabel>
          <FormControl>
            <FileUpload
              onUploadComplete={(url) => form.setValue("photoUrl", url)}
              bucketName="vehicles"
              folderPath="photos"
              currentImageUrl={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
