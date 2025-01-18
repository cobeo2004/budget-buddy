export function getInitials(name: string) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("");
  return initials;
}
