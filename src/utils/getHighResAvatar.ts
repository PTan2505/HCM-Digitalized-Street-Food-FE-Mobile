const getHighResAvatar = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.includes('googleusercontent.com')) {
    return url.replace(/=s\d+-c/, '=s512-c');
  }
  return url;
};

export default getHighResAvatar;
