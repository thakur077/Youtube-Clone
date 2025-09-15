// Utility functions for image handling

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

export const getRandomThumbnail = (category = 'default', width = 640, height = 360) => {
  const categories = {
    music: ['music', 'concert', 'studio', 'headphones'],
    coding: ['code', 'programming', 'computer', 'laptop'],
    education: ['books', 'learning', 'school', 'study'],
    sports: ['football', 'soccer', 'basketball', 'sports'],
    gaming: ['gaming', 'controller', 'console', 'arcade'],
    news: ['news', 'newspaper', 'broadcast', 'media'],
    default: ['abstract', 'nature', 'city', 'technology']
  };
  
  const keywords = categories[category.toLowerCase()] || categories.default;
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  
  return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
};

export const getFallbackThumbnail = (category = 'default') => {
  const colors = {
    music: 'from-purple-500 to-pink-500',
    coding: 'from-blue-500 to-cyan-500',
    education: 'from-green-500 to-teal-500',
    sports: 'from-orange-500 to-red-500',
    gaming: 'from-indigo-500 to-purple-500',
    news: 'from-gray-500 to-blue-500',
    default: 'from-zinc-600 to-zinc-800'
  };
  
  return colors[category.toLowerCase()] || colors.default;
};
