
import { useState } from "react";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function SystemSettingsForm() {
  const { settings, isLoading, updateSettings } = useSystemSettings();
  const { toast } = useToast();
  const [themeColor, setThemeColor] = useState<string>(settings?.themeColor || "#ea384c");
  const [foundingDate, setFoundingDate] = useState<string>(
    settings?.foundingDate ? new Date(settings.foundingDate).toISOString().split('T')[0] : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when settings are loaded
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>A carregar configurações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>Não foi possível carregar as configurações.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateSettings({
        themeColor,
        foundingDate
      });

      // Update CSS variable for theme color
      document.documentElement.style.setProperty('--mouro-red', themeColor);

      toast({
        title: "Configurações atualizadas",
        description: "As configurações do sistema foram atualizadas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive"
      });
      console.error("Error updating settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>Personalize as configurações gerais do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="themeColor">Cor de Destaque</Label>
            <div className="flex items-center space-x-3">
              <Input
                id="themeColor"
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Esta cor será utilizada para botões principais e elementos de destaque.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundingDate">Data de Fundação do Motoclube</Label>
            <Input
              id="foundingDate"
              type="date"
              value={foundingDate}
              onChange={(e) => setFoundingDate(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Esta data será utilizada para gerar os anos de pagamento de cotas.
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-mouro-red hover:bg-mouro-red/90"
            >
              {isSubmitting ? "A guardar..." : "Guardar Configurações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
