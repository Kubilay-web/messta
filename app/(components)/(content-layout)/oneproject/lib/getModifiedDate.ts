export function getModifiedDate(updatedAt: Date | string): string {
  const date = new Date(updatedAt);

  const day = String(date.getDate()).padStart(2, "0"); // Get day and pad with 0 if needed
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear(); // Get full year

  const hours = String(date.getHours()).padStart(2, "0"); // Get hours and pad with 0
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Get minutes and pad with 0

  return `${day}/${month}/${year} - ${hours}:${minutes}`;
}
