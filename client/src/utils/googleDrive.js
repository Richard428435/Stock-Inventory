/**
 * Formats Google Drive sharing links into direct image links for use in <img> tags or CSS backgrounds.
 * Example: https://drive.google.com/file/d/123/view?usp=sharing -> https://drive.google.com/uc?export=view&id=123
 */
export const fixGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Match drive.google.com/file/d/ID/...
  const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }
  
  // Match drive.google.com/open?id=ID
  const openIdMatch = url.match(/id=([^&]+)/);
  if (url.includes('drive.google.com') && openIdMatch && openIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${openIdMatch[1]}`;
  }

  return url;
};
