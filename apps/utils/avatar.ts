const stringToHslColor = (str: string, s: number, l: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Function to get initials from a name
export function getInitials(name: string): string {
  if (!name) return "";

  const nameParts = name.split(" ");
  const initials = nameParts
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials.slice(0, 2); // Return at most two initials
}

// Function to get a unique background color for a name
export function getAvatarColor(name: string): string {
  if (!name) return "#ccc"; // Default gray color
  // Use a high saturation and medium lightness for vibrant colors
  return stringToHslColor(name, 75, 50);
}
