type SearchInput = {
  city: string;
  state: string;
  zip?: string;
  category: string;
  maxReviewCount?: number;
  minimumRating?: number;
  onlyNoWebsite?: boolean;
};

function getAddress(place: any) {
  return place.formattedAddress ?? place.formatted_address ?? "";
}

export async function searchGooglePlaces(input: SearchInput) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
  }

  const query = `${input.category} in ${input.city}, ${input.state}${input.zip ? ` ${input.zip}` : ""}`;
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.primaryTypeDisplayName",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return (data.places ?? [])
    .map((place: any) => ({
      businessName: place.displayName?.text ?? "Unnamed business",
      category: place.primaryTypeDisplayName?.text ?? input.category,
      phone: place.nationalPhoneNumber ?? null,
      email: null,
      website: place.websiteUri ?? null,
      address: getAddress(place),
      city: input.city,
      state: input.state,
      googlePlaceId: place.id,
      googleMapsUrl: place.googleMapsUri ?? null,
      googleRating: place.rating ?? null,
      googleReviewCount: place.userRatingCount ?? null,
      status: "NEW",
    }))
    .filter((lead: any) =>
      input.maxReviewCount == null ? true : (lead.googleReviewCount ?? 0) <= input.maxReviewCount,
    )
    .filter((lead: any) =>
      input.minimumRating == null ? true : (lead.googleRating ?? 0) >= input.minimumRating,
    )
    .filter((lead: any) => (input.onlyNoWebsite ? !lead.website : true));
}
