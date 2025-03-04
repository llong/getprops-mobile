interface LocationAddress {
  streetNumber?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

export const transformLocationToSpotForm = (
  location: LocationAddress
): {
  streetNumber: string | null;
  street: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  postalCode: string | null;
} => {
  return {
    streetNumber: location.streetNumber ?? null,
    street: location.street ?? null,
    city: location.city ?? null,
    region: location.region ?? null,
    country: location.country ?? null,
    postalCode: location.postalCode ?? null,
  };
};
