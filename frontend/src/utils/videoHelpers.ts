export const isYouTubeUrl = (url: string): boolean => {
  return /youtube\.com|youtu\.be/.test(url);
};

export const getYouTubeEmbedUrl = (url: string): string => {
  try {
    const videoId = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0`;
  } catch {
    return '';
  }
};

export const validateVideoUrl = (url: string | undefined) => {
  let isValid = !!url;
  let isYouTube = false;
  let embedUrl = '';

  if (url) {
    isYouTube = isYouTubeUrl(url);
    embedUrl = isYouTube ? getYouTubeEmbedUrl(url) : url;
    isValid = !!embedUrl && (!isYouTube || embedUrl.includes('embed/'));
  }

  return { isValid, isYouTube, embedUrl };
};
