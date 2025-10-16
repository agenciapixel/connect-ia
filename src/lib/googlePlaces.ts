import { supabase } from "@/integrations/supabase/client";

export interface GooglePlacesSearchParams {
  query?: string;
  location?: string;
  radius?: number;
  type?: string;
  lat?: number;
  lng?: number;
}

export interface PlaceResult {
  id?: string;
  place_id: string;
  name: string;
  formatted_address: string;
  phone_number?: string;
  website?: string;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  opening_hours?: any;
}

export interface SearchResponse {
  success: boolean;
  source: "official_api" | "scraping" | "unknown";
  total: number;
  saved: number;
  prospects: number;
  places: PlaceResult[];
  error?: string;
}

/**
 * Busca lugares no Google Maps/Places
 * @param params Parâmetros de busca
 * @returns Resultados da busca
 */
export async function searchGooglePlaces(
  params: GooglePlacesSearchParams
): Promise<SearchResponse> {
  try {
    // Usar orgId fixo temporariamente até resolver o problema da tabela members
    const orgId = '00000000-0000-0000-0000-000000000000';

    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke("google-places-search", {
      body: {
        ...params,
        orgId: orgId,
      },
    });

    if (error) throw error;

    return data as SearchResponse;
  } catch (error: any) {
    console.error("Error searching Google Places:", error);
    return {
      success: false,
      source: "unknown",
      total: 0,
      saved: 0,
      prospects: 0,
      places: [],
      error: error.message || "Erro ao buscar lugares",
    };
  }
}

/**
 * Busca lugares próximos a uma localização
 * @param lat Latitude
 * @param lng Longitude
 * @param radius Raio em metros (padrão: 5000)
 * @param type Tipo de lugar (opcional)
 * @returns Resultados da busca
 */
export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  radius: number = 5000,
  type?: string
): Promise<SearchResponse> {
  return searchGooglePlaces({
    lat,
    lng,
    radius,
    type,
  });
}

/**
 * Busca lugares por texto e localização
 * @param query Texto de busca
 * @param location Localização (cidade, estado, país)
 * @param type Tipo de lugar (opcional)
 * @returns Resultados da busca
 */
export async function searchPlacesByText(
  query: string,
  location?: string,
  type?: string
): Promise<SearchResponse> {
  return searchGooglePlaces({
    query,
    location,
    type,
  });
}

/**
 * Categorias/tipos de lugares mais comuns
 */
export const PLACE_TYPES = {
  // Alimentação
  restaurant: "Restaurante",
  cafe: "Café",
  bakery: "Padaria",
  bar: "Bar",
  food: "Alimentação",

  // Varejo
  store: "Loja",
  clothing_store: "Loja de Roupas",
  shoe_store: "Sapataria",
  jewelry_store: "Joalheria",
  book_store: "Livraria",
  electronics_store: "Loja de Eletrônicos",
  furniture_store: "Loja de Móveis",
  home_goods_store: "Loja de Utilidades",
  supermarket: "Supermercado",
  convenience_store: "Conveniência",

  // Serviços
  beauty_salon: "Salão de Beleza",
  hair_care: "Cabeleireiro",
  spa: "Spa",
  gym: "Academia",
  laundry: "Lavanderia",
  car_wash: "Lava-jato",
  car_repair: "Mecânica",
  locksmith: "Chaveiro",
  electrician: "Eletricista",
  plumber: "Encanador",

  // Saúde
  hospital: "Hospital",
  doctor: "Médico",
  dentist: "Dentista",
  pharmacy: "Farmácia",
  physiotherapist: "Fisioterapeuta",
  veterinary_care: "Veterinário",

  // Educação
  school: "Escola",
  university: "Universidade",
  library: "Biblioteca",

  // Outros
  real_estate_agency: "Imobiliária",
  lawyer: "Advogado",
  accounting: "Contabilidade",
  insurance_agency: "Seguradora",
  travel_agency: "Agência de Viagens",
  lodging: "Hospedagem",

  // Entretenimento
  movie_theater: "Cinema",
  night_club: "Boate",
  tourist_attraction: "Atração Turística",
  park: "Parque",
  museum: "Museu",
} as const;

export type PlaceType = keyof typeof PLACE_TYPES;

/**
 * Obter categorias agrupadas
 */
export const PLACE_CATEGORIES = {
  "Alimentação": [
    "restaurant",
    "cafe",
    "bakery",
    "bar",
    "food",
  ],
  "Varejo": [
    "store",
    "clothing_store",
    "shoe_store",
    "jewelry_store",
    "book_store",
    "electronics_store",
    "furniture_store",
    "home_goods_store",
    "supermarket",
    "convenience_store",
  ],
  "Serviços": [
    "beauty_salon",
    "hair_care",
    "spa",
    "gym",
    "laundry",
    "car_wash",
    "car_repair",
    "locksmith",
    "electrician",
    "plumber",
  ],
  "Saúde": [
    "hospital",
    "doctor",
    "dentist",
    "pharmacy",
    "physiotherapist",
    "veterinary_care",
  ],
  "Educação": [
    "school",
    "university",
    "library",
  ],
  "Profissionais": [
    "real_estate_agency",
    "lawyer",
    "accounting",
    "insurance_agency",
  ],
  "Turismo": [
    "travel_agency",
    "lodging",
    "tourist_attraction",
    "park",
    "museum",
  ],
  "Entretenimento": [
    "movie_theater",
    "night_club",
  ],
} as const;
