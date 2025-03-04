export interface LocationSuggestion {
  id: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
}
