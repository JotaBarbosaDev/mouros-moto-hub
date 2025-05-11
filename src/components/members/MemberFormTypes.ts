
import { UseFormReturn } from "react-hook-form";
import { Member } from "@/hooks/use-members";
import { z } from "zod";
import { BloodType } from "@/types/member";

// Create a Zod schema for form validation
export const bloodTypeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional();
export const memberTypeSchema = z.enum(['Sócio Adulto', 'Sócio Criança', 'Administração', 'Convidado']);

export const editMemberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneMain: z.string().min(1, "Telefone principal é obrigatório"),
  phoneAlternative: z.string().optional(),
  nickname: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(), // Campo para alteração de senha
  bloodType: bloodTypeSchema,
  memberType: memberTypeSchema,
  inWhatsAppGroup: z.boolean().optional(),
  receivedMemberKit: z.boolean().optional(),
  photoUrl: z.string().optional(),
});

export type EditMemberFormValues = z.infer<typeof editMemberSchema>;

export interface FormProps {
  form: UseFormReturn<EditMemberFormValues>;
  member: Member | null;
}
