/**
 * Audio URL Builder
 * Transforms audioKey from seed metadata to browser-accessible URL
 *
 * Example:
 * audioKey: "letters/a.mp3"
 * → URL: "/audio/letters/a.mp3"
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

/**
 * Build audio URL from audioKey in seed metadata
 * @param audioKey - From alphabet.audio.json: "letters/a.mp3"
 * @returns Browser URL: "/audio/letters/a.mp3"
 */
export const getAudioUrl = (audioKey: string): string => {
  if (!audioKey) return "";
  // Remove leading/trailing slashes for consistency
  const cleanKey = audioKey.replace(/^\/+|\/+$/g, "");
  return `/audio/${cleanKey}`;
};

/**
 * Build full absolute URL (for SSR or external requests)
 * @param audioKey - From alphabet.audio.json: "letters/a.mp3"
 * @returns Full URL: "http://localhost:3000/audio/letters/a.mp3"
 */
export const getAbsoluteAudioUrl = (audioKey: string): string => {
  const relativePath = getAudioUrl(audioKey);
  if (!API_BASE_URL) return relativePath;
  return `${API_BASE_URL}${relativePath}`;
};

/**
 * Validate that audioKey points to existing audio file
 * @param audioKey - Path from metadata
 * @returns true if audioKey format is valid
 */
export const isValidAudioKey = (audioKey: string): boolean => {
  return /^letters\/[a-z_]+\.mp3$/.test(audioKey);
};
