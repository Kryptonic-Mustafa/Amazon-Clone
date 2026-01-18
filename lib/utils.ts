import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ------------------------------------------------------------------
// CORE LOGIC: Handle Comma-Separated Relationships
// ------------------------------------------------------------------

/**
 * Converts a CSV string to an array of numbers.
 * Example: "1, 2, 5" -> [1, 2, 5]
 */
export const parseIds = (idString: string | null): number[] => {
  if (!idString) return [];
  return idString.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
};

/**
 * Converts an array of IDs back to CSV for DB storage.
 */
export const stringifyIds = (ids: number[]): string => {
  return ids.join(',');
};

/**
 * "Application-Level Join"
 * Used to hydrate a list of IDs with actual data from another table.
 */
export const hydrateRelations = async (
  csvIds: string | null, 
  fetcher: (ids: number[]) => Promise<any[]>
) => {
  const ids = parseIds(csvIds);
  if (ids.length === 0) return [];
  // Bulk fetch the related data
  const data = await fetcher(ids);
  return data;
};