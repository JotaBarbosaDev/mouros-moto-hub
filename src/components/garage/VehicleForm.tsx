
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { VehicleFormValues } from "./schemas/vehicle-schema";
import { VehicleTypeSelect } from "./VehicleTypeSelect";
import { VehicleBasicFields } from "./VehicleBasicFields";
import { VehiclePhotoUpload } from "./VehiclePhotoUpload";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface VehicleFormProps {
  form: UseFormReturn<VehicleFormValues>;
  onSubmit: (values: VehicleFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const VehicleForm = ({ form, onSubmit, onCancel, isSubmitting }: VehicleFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <VehicleBasicFields form={form} />
        <VehicleTypeSelect form={form} />
        <VehiclePhotoUpload form={form} />
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "A adicionar..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
