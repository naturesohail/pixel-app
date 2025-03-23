/**
 * Decodes HTML content while preserving the formatting (like <b>, <strong>, etc.)
 * @param html - The HTML string to decode
 * @param removeTags - (Optional) An array of tags to remove from the decoded content
 * @returns - The decoded HTML content with formatting preserved
 */
const decodeHtmlWithFormatting = (html: string, removeTags: string[] = []): string => {
  // Create a DOM parser to parse the HTML string
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Optionally remove specified tags
  if (removeTags.length > 0) {
    removeTags.forEach((tag) => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((element) => {
        element.remove();
      });
    });
  }

  // Return the HTML content from the body, preserving the formatting
  return doc.body.innerHTML || "";
};

export default decodeHtmlWithFormatting;
