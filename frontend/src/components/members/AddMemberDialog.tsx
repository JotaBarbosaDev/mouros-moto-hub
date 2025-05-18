import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, X, Upload, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member, MemberType, BloodType, Vehicle, VehicleType } from '@/types/member';
import { Loader2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (member: Partial<Member>) => void;
  isSubmitting?: boolean;
}

// Interface para controlar os erros de validação
interface FormErrors {
  name?: string;
  email?: string;
  phoneMain?: string;
  username?: string;
  password?: string;
}

export function AddMemberDialog({ open, onOpenChange, onSubmit, isSubmitting = false }: AddMemberDialogProps) {
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    email: '',
    phoneMain: '',
    phoneAlternative: '',
    memberType: 'Sócio Adulto' as MemberType,
    bloodType: 'A+' as BloodType,
    joinDate: new Date().toISOString().split('T')[0],
    address: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      district: '',
      country: 'Portugal'
    },
    vehicles: [],
    nickname: '',
    photoUrl: '',
    inWhatsAppGroup: false,
    receivedMemberKit: false,
    username: '',
    password: '',
    // Adicionando campos faltantes
    isActive: true,
    honoraryMember: false,
    legacyMember: false,
    registrationFeePaid: false,
    registrationFeeExempt: false,
    isAdmin: false,
  });
  
  // Estado para gerenciar erros de validação do formulário
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  // Estado para controlar se o formulário já foi submetido uma vez
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [vehicleForm, setVehicleForm] = useState<Partial<Vehicle>>({
    brand: '',
    model: '',
    type: 'Mota' as VehicleType,
    displacement: 0,
    nickname: '',
    photoUrl: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState<string | null>(null);

  // Função para validar o email usando uma expressão regular
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Função para validar o telefone (aceita apenas números, espaços, + e -)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9\s\-+]+$/;
    return phone ? phoneRegex.test(phone) : false;
  };

  // Função para validar campos obrigatórios
  const validateRequired = (value: string): boolean => {
    return !!value && value.trim() !== '';
  };

  // Função para validar senha (mínimo de 6 caracteres)
  const validatePassword = (password: string | undefined): boolean => {
    if (!password) return true; // Se estiver vazio, não é erro (será preenchido automaticamente)
    return password.length >= 6;
  };

  // Função para validar o formulário completo
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validar nome
    if (!validateRequired(formData.name || '')) {
      errors.name = 'Nome é obrigatório';
      isValid = false;
    }

    // Validar email
    if (!validateRequired(formData.email || '')) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!validateEmail(formData.email || '')) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    // Validar telefone
    if (!validateRequired(formData.phoneMain || '')) {
      errors.phoneMain = 'Telefone é obrigatório';
      isValid = false;
    } else if (!validatePhone(formData.phoneMain || '')) {
      errors.phoneMain = 'Formato de telefone inválido';
      isValid = false;
    }

    // Validar username
    if (validateRequired(formData.username || '')) {
      // Se um username for fornecido, verifica se tem pelo menos 3 caracteres
      if ((formData.username || '').length < 3) {
        errors.username = 'Username deve ter pelo menos 3 caracteres';
        isValid = false;
      }
    }

    // Validar senha
    if (!validatePassword(formData.password)) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validar o formulário antes de enviar
    if (!validateForm()) {
      return; // Impede envio se houver erros
    }
    
    // Verificar se o membro possui username, se não, usa o email como username
    const updatedFormData = { ...formData };
    if (!updatedFormData.username) {
      const emailParts = updatedFormData.email?.split('@') || [];
      updatedFormData.username = emailParts[0] || `membro${Date.now().toString().substring(7)}`;
    }
    
    // Se password não for fornecido, utiliza o username como password
    if (!updatedFormData.password) {
      updatedFormData.password = updatedFormData.username;
    }
    
    // Garantir que campos críticos não sejam undefined
    updatedFormData.phoneMain = updatedFormData.phoneMain || "";
    updatedFormData.email = updatedFormData.email || "";
    updatedFormData.name = updatedFormData.name || "";
    
    // Garantir que os campos de status estejam definidos
    updatedFormData.isActive = updatedFormData.isActive ?? true;
    updatedFormData.honoraryMember = updatedFormData.honoraryMember ?? false;
    updatedFormData.legacyMember = updatedFormData.legacyMember ?? false;
    updatedFormData.registrationFeePaid = updatedFormData.registrationFeePaid ?? false;
    updatedFormData.registrationFeeExempt = updatedFormData.registrationFeeExempt ?? false;
    updatedFormData.isAdmin = updatedFormData.isAdmin ?? false;
    
    onSubmit(updatedFormData);
  };

  // Função para validar campos durante a digitação
  const validateField = (field: keyof FormErrors, value: string) => {
    if (!formSubmitted) return; // Só valida após a primeira tentativa de envio

    const newErrors = { ...formErrors };
    
    switch (field) {
      case 'name':
        if (!validateRequired(value)) {
          newErrors.name = 'Nome é obrigatório';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!validateRequired(value)) {
          newErrors.email = 'Email é obrigatório';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Email inválido';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phoneMain':
        if (!validateRequired(value)) {
          newErrors.phoneMain = 'Telefone é obrigatório';
        } else if (!validatePhone(value)) {
          newErrors.phoneMain = 'Formato de telefone inválido';
        } else {
          delete newErrors.phoneMain;
        }
        break;
      case 'username':
        if (validateRequired(value) && value.length < 3) {
          newErrors.username = 'Username deve ter pelo menos 3 caracteres';
        } else {
          delete newErrors.username;
        }
        break;
      case 'password':
        if (!validatePassword(value)) {
          newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setFormErrors(newErrors);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setPhotoPreview(photoUrl);
        setFormData({
          ...formData,
          photoUrl: photoUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVehiclePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        setVehiclePhotoPreview(photoUrl);
        setVehicleForm({
          ...vehicleForm,
          photoUrl: photoUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addVehicle = () => {
    if (vehicleForm.brand && vehicleForm.model && vehicleForm.displacement) {
      // Create a complete Vehicle object with required id
      const newVehicle: Vehicle = {
        ...vehicleForm,
        id: `v${Date.now()}`, // Generate a temporary ID
        brand: vehicleForm.brand as string,
        model: vehicleForm.model as string,
        type: vehicleForm.type as VehicleType,
        displacement: vehicleForm.displacement as number,
        photoUrl: vehicleForm.photoUrl,
        nickname: vehicleForm.nickname,
      };

      setFormData({
        ...formData,
        vehicles: [
          ...(formData.vehicles || []), 
          newVehicle
        ]
      });
      
      // Reset vehicle form
      setVehicleForm({
        brand: '',
        model: '',
        type: 'Mota' as VehicleType,
        displacement: 0,
        nickname: '',
        photoUrl: '',
      });
      setVehiclePhotoPreview(null);
    }
  };

  const removeVehicle = (index: number) => {
    if (formData.vehicles) {
      const newVehicles = [...formData.vehicles];
      newVehicles.splice(index, 1);
      setFormData({
        ...formData,
        vehicles: newVehicles
      });
    }
  };

  const memberTypes: MemberType[] = ['Sócio Adulto', 'Sócio Criança', 'Administração', 'Convidado'];
  const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const vehicleTypes: VehicleType[] = ['Mota', 'Moto-quatro', 'Buggy'];

  return (
    <Dialog open={open} onOpenChange={(state) => {
      if (!isSubmitting) {
        onOpenChange(state);
        if (!state) {
          // Resetar erros e estado de submissão quando o diálogo for fechado
          setFormErrors({});
          setFormSubmitted(false);
        }
      }
    }}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Membro</DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar um novo membro</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-24 h-24 border-2 border-gray-200">
                  {photoPreview ? (
                    <AvatarImage src={photoPreview} alt="Foto do membro" />
                  ) : (
                    <>
                      <AvatarFallback>
                        <User className="w-12 h-12 text-gray-400" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                    <Upload className="w-3 h-3" />
                    <span>{photoPreview ? 'Mudar foto' : 'Carregar foto'}</span>
                  </div>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </Label>
              </div>
              
              <div className="grid gap-2 flex-1">
                <div className="grid gap-1">
                  <Label htmlFor="name" className={formErrors.name ? "text-red-500" : ""}>Nome Completo*</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      validateField('name', e.target.value);
                    }}
                    className={formErrors.name ? "border-red-500" : ""}
                    required
                  />
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="nickname">Alcunha</Label>
                    <Input
                      id="nickname"
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberType">Tipo de Membro*</Label>
                    <Select 
                      value={formData.memberType} 
                      onValueChange={(value) => setFormData({ ...formData, memberType: value as MemberType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {memberTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="email" className={formErrors.email ? "text-red-500" : ""}>Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    validateField('email', e.target.value);
                  }}
                  className={formErrors.email ? "border-red-500" : ""}
                  required
                />
                {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bloodType">Tipo de Sangue</Label>
                <Select 
                  value={formData.bloodType} 
                  onValueChange={(value) => setFormData({ ...formData, bloodType: value as BloodType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="username" className={formErrors.username ? "text-red-500" : ""}>Nome de Usuário*</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    validateField('username', e.target.value);
                  }}
                  className={formErrors.username ? "border-red-500" : ""}
                  required
                />
                {formErrors.username && <p className="text-xs text-red-500">{formErrors.username}</p>}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password" className={formErrors.password ? "text-red-500" : ""}>Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Se vazio, será igual ao nome de usuário"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    validateField('password', e.target.value);
                  }}
                  className={formErrors.password ? "border-red-500" : ""}
                />
                {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="phoneMain" className={formErrors.phoneMain ? "text-red-500" : ""}>Telefone Principal*</Label>
                <Input
                  id="phoneMain"
                  value={formData.phoneMain}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneMain: e.target.value });
                    validateField('phoneMain', e.target.value);
                  }}
                  className={formErrors.phoneMain ? "border-red-500" : ""}
                  required
                />
                {formErrors.phoneMain && <p className="text-xs text-red-500">{formErrors.phoneMain}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneAlternative">Telefone Alternativo</Label>
                <Input
                  id="phoneAlternative"
                  value={formData.phoneAlternative}
                  onChange={(e) => setFormData({ ...formData, phoneAlternative: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Morada</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Rua"
                  value={formData.address?.street}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, street: e.target.value } })}
                  className="col-span-2"
                />
                <Input
                  placeholder="Número"
                  value={formData.address?.number}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, number: e.target.value } })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  placeholder="Código Postal"
                  value={formData.address?.postalCode}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, postalCode: e.target.value } })}
                />
                <Input
                  placeholder="Cidade"
                  value={formData.address?.city}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, city: e.target.value } })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input
                  placeholder="Distrito/Concelho"
                  value={formData.address?.district}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, district: e.target.value } })}
                />
                <Input
                  placeholder="País"
                  value={formData.address?.country}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, country: e.target.value } })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="joinDate">Data de Entrada*</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="whatsapp" 
                  checked={formData.inWhatsAppGroup} 
                  onCheckedChange={(checked) => setFormData({ ...formData, inWhatsAppGroup: checked })}
                />
                <Label htmlFor="whatsapp">Grupo WhatsApp</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="memberKit" 
                  checked={formData.receivedMemberKit} 
                  onCheckedChange={(checked) => setFormData({ ...formData, receivedMemberKit: checked })}
                />
                <Label htmlFor="memberKit">Kit de Membro</Label>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <Label className="mb-2 block font-medium">Status do Membro</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isActive" 
                    checked={formData.isActive} 
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Membro Ativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="honoraryMember" 
                    checked={formData.honoraryMember} 
                    onCheckedChange={(checked) => setFormData({ ...formData, honoraryMember: checked })}
                  />
                  <Label htmlFor="honoraryMember">Membro Honorário</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="legacyMember" 
                    checked={formData.legacyMember} 
                    onCheckedChange={(checked) => setFormData({ ...formData, legacyMember: checked })}
                  />
                  <Label htmlFor="legacyMember">Membro Legacy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="registrationFeePaid" 
                    checked={formData.registrationFeePaid} 
                    onCheckedChange={(checked) => setFormData({ ...formData, registrationFeePaid: checked })}
                  />
                  <Label htmlFor="registrationFeePaid">Taxa Inscrição Paga</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="registrationFeeExempt" 
                    checked={formData.registrationFeeExempt} 
                    onCheckedChange={(checked) => setFormData({ ...formData, registrationFeeExempt: checked })}
                  />
                  <Label htmlFor="registrationFeeExempt">Isento de Taxa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isAdmin" 
                    checked={formData.isAdmin} 
                    onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
                  />
                  <Label htmlFor="isAdmin">Administrador</Label>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <Label className="mb-3 block">Veículos</Label>
              
              {formData.vehicles && formData.vehicles.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-6 gap-2 font-medium text-xs text-gray-500 mb-2">
                    <div className="col-span-1">Foto</div>
                    <div className="col-span-1">Marca</div>
                    <div className="col-span-1">Modelo</div>
                    <div className="col-span-1">Tipo</div>
                    <div className="col-span-1">Cilindrada</div>
                    <div className="col-span-1">Alcunha</div>
                  </div>
                  {formData.vehicles.map((vehicle, index) => (
                    <div key={index} className="grid grid-cols-6 gap-2 items-center mb-2">
                      <div className="col-span-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={vehicle.photoUrl} alt={vehicle.model} />
                          <AvatarFallback>{vehicle.brand.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="col-span-1">{vehicle.brand}</div>
                      <div className="col-span-1">{vehicle.model}</div>
                      <div className="col-span-1">{vehicle.type}</div>
                      <div className="col-span-1">{vehicle.displacement} cc</div>
                      <div className="col-span-1 flex items-center justify-between">
                        {vehicle.nickname || '-'}
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeVehicle(index)}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-6 gap-2 mb-2">
                <div className="col-span-1">
                  <Label htmlFor="vehiclePhoto" className="cursor-pointer">
                    <div className="h-10 w-10 border rounded-full flex items-center justify-center">
                      {vehiclePhotoPreview ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={vehiclePhotoPreview} alt="Foto do veículo" />
                          <AvatarFallback>
                            <Upload className="h-4 w-4 text-gray-400" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Upload className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <Input
                      id="vehiclePhoto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleVehiclePhotoChange}
                    />
                  </Label>
                </div>
                <div className="col-span-1">
                  <Input
                    placeholder="Marca"
                    value={vehicleForm.brand}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    placeholder="Modelo"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  />
                </div>
                <div className="col-span-1">
                  <Select 
                    value={vehicleForm.type as string} 
                    onValueChange={(value) => setVehicleForm({ ...vehicleForm, type: value as VehicleType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Input
                    placeholder="Cilindrada"
                    type="number"
                    value={vehicleForm.displacement ? vehicleForm.displacement.toString() : ''}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, displacement: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <Input
                    placeholder="Alcunha"
                    value={vehicleForm.nickname || ''}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, nickname: e.target.value })}
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon"
                    onClick={addVehicle}
                    disabled={!vehicleForm.brand || !vehicleForm.model || !vehicleForm.displacement}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            {/* Mostrar mensagens de erro gerais do formulário aqui */}
            {formSubmitted && Object.keys(formErrors).length > 0 && (
              <div className="w-full text-red-500 text-sm mb-2">
                Por favor, corrija os erros no formulário antes de enviar.
              </div>
            )}
            <Button type="submit" className="bg-mouro-red hover:bg-mouro-red/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A adicionar...
                </>
              ) : (
                'Adicionar Membro'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
