type SearchInput = {
  location: string;
  city?: string;
  state?: string;
  zip?: string;
  category?: string;
  maxReviewCount?: number;
  minimumRating?: number;
  onlyNoWebsite?: boolean;
};

function getAddress(place: any) {
  return place.formattedAddress ?? place.formatted_address ?? "";
}

function getCityState(address: string, fallbackCity?: string, fallbackState?: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const city = parts.length >= 3 ? parts[parts.length - 3] : fallbackCity;
  const stateZip = parts.length >= 2 ? parts[parts.length - 2] : fallbackState;
  const state = stateZip?.match(/\b[A-Z]{2}\b/)?.[0] ?? fallbackState;
  return { city: city || fallbackCity || null, state: state || fallbackState || null };
}

export type PlaceReview = {
  author: string;
  rating: number | null;
  text: string;
  relativeTime: string | null;
  publishTime: string | null;
};

/**
 * Pull the top reviews for a place via Places Details. Best-effort: returns an
 * empty list when the key or place id is missing, or on any API failure, so
 * callers can degrade gracefully.
 */
export async function getPlaceReviews(placeId: string | null | undefined): Promise<PlaceReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !placeId) return [];
  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews",
      },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.reviews ?? []).map((review: any) => ({
      author: review.authorAttribution?.displayName ?? "Google reviewer",
      rating: typeof review.rating === "number" ? review.rating : null,
      text: review.text?.text ?? review.originalText?.text ?? "",
      relativeTime: review.relativePublishTimeDescription ?? null,
      publishTime: review.publishTime ?? null,
    })) as PlaceReview[];
  } catch {
    return [];
  }
}

export async function searchGooglePlaces(input: SearchInput) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
  }

  const locationQuery = (input.location || [input.city, input.state, input.zip].filter(Boolean).join(" ")).trim();
  const searchCategory = input.category?.trim() || "local businesses";
  const query = `${searchCategory} in ${locationQuery}, United States`;
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
    .map((place: any) => {
      const address = getAddress(place);
      const parsed = getCityState(address, input.city, input.state);
      return {
        businessName: place.displayName?.text ?? "Unnamed business",
        category: place.primaryTypeDisplayName?.text ?? input.category ?? "Local Business",
        phone: place.nationalPhoneNumber ?? null,
        email: null,
        website: place.websiteUri ?? null,
        address,
        city: parsed.city,
        state: parsed.state,
        googlePlaceId: place.id,
        googleMapsUrl: place.googleMapsUri ?? null,
        googleRating: place.rating ?? null,
        googleReviewCount: place.userRatingCount ?? null,
        status: "NEW",
      };
    })
    .filter((lead: any) =>
      input.maxReviewCount == null ? true : (lead.googleReviewCount ?? 0) <= input.maxReviewCount,
    )
    .filter((lead: any) =>
      input.minimumRating == null ? true : (lead.googleRating ?? 0) >= input.minimumRating,
    )
    .filter((lead: any) => (input.onlyNoWebsite ? !lead.website : true));
}
