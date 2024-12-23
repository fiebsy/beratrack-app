/**
 * Returns an ISO date string for a number of days ago from now
 * @param days Number of days to subtract from current date
 * @returns ISO date string
 */
export function getDateString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
} 