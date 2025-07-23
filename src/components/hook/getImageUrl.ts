export function getImageUrl(rawUrl: string) {
  if (!rawUrl) return '/images/placeholder.png';
  if (rawUrl.startsWith('http') && rawUrl.includes('drive.google.com')) {
    const match = rawUrl.match(/\/d\/([^/]+)\//);
    if (match) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  if (!rawUrl.startsWith('http')) {
    return `https://static.wixstatic.com/media/${rawUrl}`;
  }
  return rawUrl;
}
