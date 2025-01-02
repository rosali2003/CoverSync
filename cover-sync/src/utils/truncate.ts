export const truncateWords = (
  text: string,
  maxLength: number = 4000
): string => {
  // Remove extra whitespace and newlines
  const cleanText = text.replace(/\s+/g, " ").trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  // Split into words and count characters
  const words = cleanText.split(" ");
  let currentLength = 0;
  let truncatedWords = [];

  for (const word of words) {
    if (currentLength + word.length + 1 <= maxLength) {
      truncatedWords.push(word);
      currentLength += word.length + 1; // +1 for the space
    } else {
      break;
    }
  }

  return truncatedWords.join(" ");
};
