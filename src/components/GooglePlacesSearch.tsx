import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { searchGooglePlaces, PLACE_CATEGORIES, PLACE_TYPES, type PlaceResult } from "@/lib/googlePlaces";

interface GooglePlacesSearchProps {
  onResults?: (results: PlaceResult[]) => void;
}

export function GooglePlacesSearch({ onResults }: GooglePlacesSearchProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [radius, setRadius] = useState("5000");
  const [isSearching, setIsSearching] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleSearch = async () => {
    if (!query && !type) {
      toast.error("Informe o que você está procurando ou selecione uma categoria");
      return;
    }

    setIsSearching(true);

    try {
      let searchParams: any = {
        query: query || undefined,
        location: location || undefined,
        radius: parseInt(radius),
        type: type || undefined,
      };

      // Se o usuário quer usar localização atual
      if (useCurrentLocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        searchParams = {
          ...searchParams,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          location: undefined, // Remove location text quando usar coordenadas
        };

        toast.success("Localização detectada!");
      }

      const response = await searchGooglePlaces(searchParams);

      if (!response.success) {
        toast.error(response.error || "Erro ao buscar lugares");
        return;
      }

      if (response.total === 0) {
        toast.info("Nenhum lugar encontrado. Tente ajustar os filtros.");
        return;
      }

      toast.success(
        `${response.total} lugares encontrados! ${response.prospects} novos prospects criados.`,
        {
          description: `Fonte: ${response.source === "official_api" ? "Google Places API" : "Scraping"}`,
        }
      );

      onResults?.(response.places);
    } catch (error: any) {
      console.error("Search error:", error);

      if (error.code === 1) {
        toast.error("Permissão de localização negada");
      } else {
        toast.error(error.message || "Erro ao buscar lugares");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    setCategory(categoryName);
    setType(""); // Reset type when category changes
  };

  const handleTypeChange = (selectedType: string) => {
    setType(selectedType);
  };

  const getTypesForCategory = () => {
    if (!category) return [];
    return PLACE_CATEGORIES[category as keyof typeof PLACE_CATEGORIES] || [];
  };

  return (
    <Card className="border-2 hover:border-primary/30 transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Buscar no Google Maps
        </CardTitle>
        <CardDescription>
          Encontre prospects por localização, categoria ou palavra-chave
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query de busca */}
        <div className="space-y-2">
          <Label htmlFor="query">O que você está procurando?</Label>
          <Input
            id="query"
            placeholder="Ex: restaurantes italianos, academias, pet shops..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Localização */}
        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="Ex: São Paulo, SP"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={useCurrentLocation}
              className="flex-1"
            />
            <Button
              type="button"
              variant={useCurrentLocation ? "default" : "outline"}
              onClick={() => setUseCurrentLocation(!useCurrentLocation)}
              className="whitespace-nowrap"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {useCurrentLocation ? "Minha Localização" : "Usar GPS"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PLACE_CATEGORIES).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo específico */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo Específico</Label>
            <Select value={type} onValueChange={handleTypeChange} disabled={!category}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {getTypesForCategory().map((t) => (
                  <SelectItem key={t} value={t}>
                    {PLACE_TYPES[t as keyof typeof PLACE_TYPES]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Raio de busca */}
        <div className="space-y-2">
          <Label htmlFor="radius">Raio de Busca</Label>
          <Select value={radius} onValueChange={setRadius}>
            <SelectTrigger id="radius">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1 km</SelectItem>
              <SelectItem value="2000">2 km</SelectItem>
              <SelectItem value="5000">5 km</SelectItem>
              <SelectItem value="10000">10 km</SelectItem>
              <SelectItem value="20000">20 km</SelectItem>
              <SelectItem value="50000">50 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botão de busca */}
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full"
          size="lg"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Buscar Prospects
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
