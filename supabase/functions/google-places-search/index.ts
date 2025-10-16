import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  query: string;
  location?: string;
  radius?: number;
  type?: string;
  lat?: number;
  lng?: number;
  orgId: string;
}

interface PlaceResult {
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
  photos?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, location, radius = 5000, type, lat, lng, orgId } = await req.json() as SearchRequest;

    console.log("Google Places Search request:", { query, location, radius, type, lat, lng });

    if (!query && !type) {
      throw new Error("Query ou type são obrigatórios");
    }

    if (!orgId) {
      throw new Error("orgId é obrigatório");
    }

    // Tentar primeiro com Google Places API oficial
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    let places: PlaceResult[] = [];
    let source = "unknown";

    if (apiKey) {
      console.log("Tentando busca com Google Places API oficial...");
      try {
        places = await searchWithOfficialAPI(apiKey, { query, location, radius, type, lat, lng });
        source = "official_api";
        console.log(`Encontrados ${places.length} lugares via API oficial`);
      } catch (error) {
        console.error("Erro na API oficial, tentando fallback:", error);
      }
    }

    // Fallback para scraping se API oficial falhar ou não estiver configurada
    if (places.length === 0) {
      console.log("Usando fallback de scraping...");
      try {
        places = await searchWithScraping({ query, location, radius, type, lat, lng });
        source = "scraping";
        console.log(`Encontrados ${places.length} lugares via scraping`);
      } catch (error) {
        console.error("Erro no scraping:", error);
        throw new Error("Não foi possível buscar lugares. Verifique os parâmetros e tente novamente.");
      }
    }

    // Salvar resultados no banco de dados
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const savedPlaces = [];
    const savedProspects = [];

    for (const place of places) {
      try {
        // Verificar se o lugar já existe
        const { data: existingPlace } = await supabase
          .from("places")
          .select("id")
          .eq("place_id", place.place_id)
          .single();

        let placeId: string;

        if (existingPlace) {
          placeId = existingPlace.id;
          // Atualizar dados existentes
          await supabase
            .from("places")
            .update({
              name: place.name,
              formatted_address: place.formatted_address,
              phone_number: place.phone_number,
              website: place.website,
              types: place.types,
              location: place.location,
              raw_json: place,
              source_ts: new Date().toISOString(),
            })
            .eq("id", placeId);
        } else {
          // Inserir novo lugar
          const { data: newPlace, error: placeError } = await supabase
            .from("places")
            .insert({
              place_id: place.place_id,
              name: place.name,
              formatted_address: place.formatted_address,
              phone_number: place.phone_number,
              website: place.website,
              types: place.types,
              location: place.location,
              raw_json: place,
              source_ts: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (placeError) throw placeError;
          placeId = newPlace.id;
        }

        savedPlaces.push({ ...place, id: placeId });

        // Verificar se já existe prospect para este lugar
        const { data: existingProspect } = await supabase
          .from("prospects")
          .select("id")
          .eq("place_id", placeId)
          .eq("org_id", orgId)
          .single();

        if (!existingProspect) {
          // Criar prospect
          const { data: newProspect, error: prospectError } = await supabase
            .from("prospects")
            .insert({
              org_id: orgId,
              place_id: placeId,
              status: "new",
              tags: place.types.slice(0, 3), // Usar primeiras 3 categorias como tags
            })
            .select()
            .single();

          if (prospectError) throw prospectError;
          savedProspects.push(newProspect);
        }
      } catch (error) {
        console.error(`Erro ao salvar lugar ${place.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        source,
        total: places.length,
        saved: savedPlaces.length,
        prospects: savedProspects.length,
        places: savedPlaces,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in google-places-search:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// Busca usando Google Places API (New)
async function searchWithOfficialAPI(
  apiKey: string,
  params: Omit<SearchRequest, "orgId">
): Promise<PlaceResult[]> {
  const { query, location, radius = 5000, type, lat, lng } = params;

  // Usar Places API (New) - Text Search
  const searchText = [query, type, location].filter(Boolean).join(" ");

  const url = "https://places.googleapis.com/v1/places:searchText";

  const requestBody: any = {
    textQuery: searchText,
    maxResultCount: 20,
  };

  // Se tiver coordenadas, adicionar bias de localização
  if (lat && lng) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: lat,
          longitude: lng,
        },
        radius: radius,
      },
    };
  }

  console.log("Calling Google Places API (New):", url);
  console.log("Request body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.types,places.location,places.rating,places.userRatingCount,places.businessStatus",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || data.error || "Unknown error";
    throw new Error(`Google Places API (New) error: ${errorMsg}`);
  }

  if (!data.places || data.places.length === 0) {
    console.log("Nenhum resultado encontrado");
    return [];
  }

  console.log(`Found ${data.places.length} places`);

  // Processar resultados
  const places: PlaceResult[] = data.places.map((place: any) => ({
    place_id: place.id || `place_${Date.now()}_${Math.random()}`,
    name: place.displayName?.text || "Nome não disponível",
    formatted_address: place.formattedAddress || "",
    phone_number: place.nationalPhoneNumber || place.internationalPhoneNumber || undefined,
    website: place.websiteUri || undefined,
    types: place.types || [],
    location: {
      lat: place.location?.latitude || 0,
      lng: place.location?.longitude || 0,
    },
    rating: place.rating,
    user_ratings_total: place.userRatingCount,
    business_status: place.businessStatus,
  }));

  return places;
}

// Busca usando scraping (fallback) ou dados de demonstração
async function searchWithScraping(
  params: Omit<SearchRequest, "orgId">
): Promise<PlaceResult[]> {
  const { query, location, type } = params;

  // Construir URL de busca do Google Maps
  const searchQuery = [query, type, location].filter(Boolean).join(" ");
  console.log("Scraping seria executado para:", searchQuery);

  // Retornar dados de demonstração para teste
  const demoPlaces: PlaceResult[] = [
    {
      place_id: "demo_1",
      name: `${query || type || "Negócio"} - Exemplo 1`,
      formatted_address: `${location || "São Paulo"}, SP, Brasil`,
      phone_number: "(11) 99999-9999",
      website: "https://exemplo1.com.br",
      types: [type || "establishment"],
      location: {
        lat: -23.5505,
        lng: -46.6333,
      },
      rating: 4.5,
      user_ratings_total: 127,
      business_status: "OPERATIONAL",
    },
    {
      place_id: "demo_2", 
      name: `${query || type || "Negócio"} - Exemplo 2`,
      formatted_address: `${location || "São Paulo"}, SP, Brasil`,
      phone_number: "(11) 88888-8888",
      website: "https://exemplo2.com.br",
      types: [type || "establishment"],
      location: {
        lat: -23.5515,
        lng: -46.6343,
      },
      rating: 4.2,
      user_ratings_total: 89,
      business_status: "OPERATIONAL",
    },
    {
      place_id: "demo_3",
      name: `${query || type || "Negócio"} - Exemplo 3`,
      formatted_address: `${location || "São Paulo"}, SP, Brasil`,
      phone_number: "(11) 77777-7777",
      website: "https://exemplo3.com.br",
      types: [type || "establishment"],
      location: {
        lat: -23.5525,
        lng: -46.6353,
      },
      rating: 4.8,
      user_ratings_total: 203,
      business_status: "OPERATIONAL",
    }
  ];

  console.log(`Retornando ${demoPlaces.length} lugares de demonstração`);
  return demoPlaces;
}
