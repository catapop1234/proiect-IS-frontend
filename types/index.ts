export interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface OpeningHours {
  weekday_text?: string[];
}

export interface Place {
  place_id: string;
  name: string;
  address?: string;
  location?: PlaceLocation;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: PlacePhoto[];
  geometry?: {
    location: PlaceLocation;
  };
  opening_hours?: OpeningHours;
  website?: string;
  formatted_phone_number?: string;
  url?: string;
  types?: string[];
  opening_hours_weekday_text?: string[];
}

export interface SearchResponse {
  results: Place[];
  next_page_token?: string;
  error?: string;
}

export interface DetailResponse extends Place {}