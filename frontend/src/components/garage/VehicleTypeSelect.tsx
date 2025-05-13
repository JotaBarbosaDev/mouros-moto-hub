
import { UseFormReturn } from "react-hook-form";
import { VehicleFormValues } from "./schemas/vehicle-schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleTypeSelectProps {
  form: UseFormReturn<VehicleFormValues>;
}

export const VehicleTypeSelect = ({ form }: VehicleTypeSelectProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <FormControl>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mota">Mota</SelectItem>
                  <SelectItem value="Moto-quatro">Moto-quatro</SelectItem>
                  <SelectItem value="Buggy">Buggy</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="displacement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cilindrada (cc)</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
