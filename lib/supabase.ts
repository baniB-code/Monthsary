const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export type Memory = {
  id: string;
  title: string;
  description: string;
  memory_date: string;
  image_url: string;
  created_at: string;
};

type SupabaseListResponse<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/**
 * Lightweight fetch helper for Supabase REST API.
 * Keeps setup simple if package installs are unavailable.
 */
export async function fetchMemories(): Promise<Memory[]> {
  const endpoint = `${supabaseUrl}/rest/v1/memories?select=*&order=memory_date.asc`;

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch memories: ${response.statusText}`);
  }

  const payload = (await response.json()) as SupabaseListResponse<Memory> | Memory[];

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload.error) {
    throw new Error(payload.error.message);
  }

  return payload.data ?? [];
}
