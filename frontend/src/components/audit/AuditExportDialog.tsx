import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Database, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AuditLogFilter } from '@/types/audit';

interface AuditExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'csv' | 'json') => void;
  filters: AuditLogFilter;
}

const AuditExportDialog: React.FC<AuditExportDialogProps> = ({
  open,
  onOpenChange,
  onExport,
  filters
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includePersonalData, setIncludePersonalData] = useState(false);
  const [includeSensitiveFields, setIncludeSensitiveFields] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportFormat);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFilterSummary = () => {
    const summary = [];
    
    if (filters.category) {
      summary.push(`Categoria: ${filters.category}`);
    }
    
    if (filters.severity) {
      summary.push(`Severidade: ${filters.severity}`);
    }
    
    if (filters.startDate && filters.endDate) {
      summary.push(
        `Período: ${format(filters.startDate, 'dd/MM/yyyy', { locale: pt })} - ${format(filters.endDate, 'dd/MM/yyyy', { locale: pt })}`
      );
    }
    
    if (filters.userId) {
      summary.push(`Usuário: ${filters.userId}`);
    }
    
    if (filters.searchTerm) {
      summary.push(`Busca: "${filters.searchTerm}"`);
    }

    return summary;
  };

  const filterSummary = getFilterSummary();
  const estimatedRecords = filters.limit || 1000; // Estimativa baseada no limite

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Exportar Logs de Auditoria
          </DialogTitle>
          <DialogDescription>
            Configure as opções de exportação dos logs de auditoria selecionados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo dos filtros */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtros Aplicados</Label>
            {filterSummary.length > 0 ? (
              <div className="space-y-1">
                {filterSummary.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="mr-1 mb-1">
                    {filter}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum filtro aplicado (todos os logs)</p>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Aproximadamente {estimatedRecords.toLocaleString()} registros</span>
            </div>
          </div>

          <Separator />

          {/* Formato de exportação */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato de Exportação</Label>
            <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as 'csv' | 'json')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  CSV (Comma Separated Values)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center cursor-pointer">
                  <Database className="mr-2 h-4 w-4" />
                  JSON (JavaScript Object Notation)
                </Label>
              </div>
            </RadioGroup>
            
            <div className="text-sm text-muted-foreground">
              {exportFormat === 'csv' 
                ? 'Ideal para análise em planilhas como Excel ou Google Sheets'
                : 'Ideal para análise programática e integração com outras ferramentas'
              }
            </div>
          </div>

          <Separator />

          {/* Opções de dados */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Opções de Dados</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personalData"
                  checked={includePersonalData}
                  onCheckedChange={(checked) => setIncludePersonalData(checked as boolean)}
                />
                <Label htmlFor="personalData" className="text-sm">
                  Incluir dados pessoais (nomes de usuário, IPs)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sensitiveFields"
                  checked={includeSensitiveFields}
                  onCheckedChange={(checked) => setIncludeSensitiveFields(checked as boolean)}
                />
                <Label htmlFor="sensitiveFields" className="text-sm">
                  Incluir campos sensíveis (headers, corpos de requisição)
                </Label>
              </div>
            </div>

            {(includePersonalData || includeSensitiveFields) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Aviso de Conformidade:</strong> A exportação de dados pessoais ou sensíveis 
                  deve estar em conformidade com as políticas GDPR e de privacidade da organização. 
                  Certifique-se de ter autorização adequada.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Informações adicionais */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Informações da Exportação</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• O arquivo será baixado automaticamente quando pronto</p>
              <p>• Dados anonimizados automaticamente se não incluir dados pessoais</p>
              <p>• Exportação registrada nos logs de auditoria</p>
              <p>• Formato de data: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuditExportDialog;
