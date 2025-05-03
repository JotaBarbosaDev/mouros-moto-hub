
import { z } from "zod";
import { VehicleType } from "@/types/member";

export const vehicleSchema = z.object({
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  type: z.enum(['Mota', 'Moto-quatro', 'Buggy'] as const),
  displacement: z.coerce.number().int().positive("Cilindrada deve ser um número positivo"),
  nickname: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export const defaultVehicleValues: VehicleFormValues = {
  brand: "",
  model: "",
  type: "Mota" as VehicleType,
  displacement: 125,
  nickname: "",
  photoUrl: "",
};
