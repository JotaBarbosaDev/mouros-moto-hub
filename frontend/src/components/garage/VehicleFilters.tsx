
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface VehicleFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  brandFilter: string;
  setBrandFilter: (value: string) => void;
  modelFilter: string;
  setModelFilter: (value: string) => void;
  displacementFilter: string;
  setDisplacementFilter: (value: string) => void;
  uniqueBrands: string[];
  uniqueModels: string[];
  uniqueDisplacements: number[];
  clearFilters: () => void;
}

export const VehicleFilters = ({
  searchTerm,
  setSearchTerm,
  brandFilter,
  setBrandFilter,
  modelFilter,
  setModelFilter,
  displacementFilter,
  setDisplacementFilter,
  uniqueBrands,
  uniqueModels,
  uniqueDisplacements,
  clearFilters,
}: VehicleFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Filtros e Pesquisa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Pesquisar por proprietário, alcunha ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-brands">Todas as marcas</SelectItem>
              {uniqueBrands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-models">Todos os modelos</SelectItem>
              {uniqueModels.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={displacementFilter} onValueChange={setDisplacementFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Cilindrada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-displacements">Todas as cilindradas</SelectItem>
              {uniqueDisplacements.map(displacement => (
                <SelectItem key={displacement} value={displacement.toString()}>
                  {displacement} cc
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {(brandFilter || modelFilter || displacementFilter) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="mt-2"
          >
            Limpar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
