import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Star, Building2, ExternalLink } from "lucide-react";
import type { PlaceResult } from "@/lib/googlePlaces";

interface GooglePlacesResultsProps {
  results: PlaceResult[];
  onSelectPlace?: (place: PlaceResult) => void;
}

export function GooglePlacesResults({ results, onSelectPlace }: GooglePlacesResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum resultado para exibir</p>
            <p className="text-sm mt-1">Use a busca acima para encontrar prospects</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:border-primary/30 transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Resultados da Busca
        </CardTitle>
        <CardDescription>
          {results.length} {results.length === 1 ? "lugar encontrado" : "lugares encontrados"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((place) => (
            <PlaceCard
              key={place.place_id}
              place={place}
              onClick={() => onSelectPlace?.(place)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface PlaceCardProps {
  place: PlaceResult;
  onClick?: () => void;
}

function PlaceCard({ place, onClick }: PlaceCardProps) {
  return (
    <Card
      className="border hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
              {place.name}
            </CardTitle>
            {place.types && place.types.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {place.types.slice(0, 2).map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {place.rating && (
            <div className="flex items-center gap-1 text-sm font-medium bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md shrink-0">
              <Star className="h-3 w-3 fill-current" />
              {place.rating}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {/* Endereço */}
        {place.formatted_address && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2 text-xs">{place.formatted_address}</span>
          </div>
        )}

        {/* Telefone */}
        {place.phone_number && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <a
              href={`tel:${place.phone_number}`}
              className="hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {place.phone_number}
            </a>
          </div>
        )}

        {/* Website */}
        {place.website && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4 shrink-0" />
            <a
              href={place.website.startsWith("http") ? place.website : `https://${place.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors truncate flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate">{place.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}

        {/* Avaliações */}
        {place.user_ratings_total && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            {place.user_ratings_total} avaliações
          </div>
        )}

        {/* Status do negócio */}
        {place.business_status && place.business_status !== "OPERATIONAL" && (
          <Badge variant="destructive" className="text-xs">
            {place.business_status === "CLOSED_TEMPORARILY"
              ? "Temporariamente fechado"
              : "Fechado permanentemente"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
