/**
 * Utility functions for club data handling and validation
 */

import { Club } from "./clubs";

/**
 * Extract a valid club ID from a club object, trying multiple field names
 * Some APIs might return the ID under different field names
 */
export function getClubId(club: any): string | undefined {
  if (!club) return undefined;
  
  // Try common field names in order of preference
  const possibleIdFields = ['id', 'club_id', 'uuid', 'clubId', '_id'];
  
  for (const field of possibleIdFields) {
    const value = club[field];
    if (value && typeof value === 'string' && value !== 'undefined') {
      return value;
    }
  }
  
  return undefined;
}

/**
 * Ensure a club object has a valid id field
 * If the id is missing but available under another field name, map it
 */
export function normalizeClubId(club: any): Club | null {
  if (!club) return null;
  
  const id = getClubId(club);
  
  if (!id) {
    console.warn('Could not find valid ID for club:', club);
    return null;
  }
  
  // Return the club with the id field set (create a copy if needed)
  return {
    ...club,
    id: id,
  } as Club;
}

/**
 * Filter and normalize clubs to ensure all have valid IDs
 */
export function filterAndNormalizeClubs(clubs: any[]): Club[] {
  return clubs
    .map(club => normalizeClubId(club))
    .filter((club): club is Club => club !== null);
}
