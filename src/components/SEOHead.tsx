import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOHead = () => {
  const location = useLocation();

  useEffect(() => {
    const getPageMeta = () => {
      switch (location.pathname) {
        case '/':
          return {
            title: 'Snapvid Free Video Downloader - Download from TikTok, YouTube, Facebook, X',
            description: 'Download videos from TikTok, YouTube, Facebook, and X (Twitter) for free. High quality, fast downloads, no watermarks. Best online video downloader 2025.',
            keywords: 'video downloader, download videos, TikTok downloader, YouTube downloader, Facebook video download, X Twitter download, free video download, snaptik, sstiktok, savefrom, snapvid'
          };
        case '/tiktok':
          return {
            title: 'TikTok Video Downloader - Download TikTok Videos Without Watermark',
            description: 'Download TikTok videos without watermark in HD quality. Fast, free, and easy TikTok video downloader. Save TikTok videos to your device.',
            keywords: 'TikTok downloader, download TikTok videos, TikTok video download, TikTok no watermark, save TikTok videos, TikTok HD download'
          };
        case '/facebook':
          return {
            title: 'Facebook Video Downloader - Download Facebook Videos HD',
            description: 'Download Facebook videos in HD quality for free. Save Facebook videos, reels, and posts to your device. Fast and secure Facebook downloader.',
            keywords: 'Facebook video downloader, download Facebook videos, Facebook video download, Facebook HD download, save Facebook videos, Facebook reels download'
          };
        case '/instagram':
          return {
            title: 'Instagram Video Downloader - Download Instagram Videos & Reels',
            description: 'Download Instagram videos, reels, and IGTV in high quality for free. Save Instagram content to your device quickly and easily.',
            keywords: 'Instagram downloader, download Instagram videos, Instagram video download, Instagram reels download, save Instagram videos, IGTV download'
          };
        case '/x':
          return {
            title: 'X (Twitter) Video Downloader - Download X Videos & GIFs',
            description: 'Download videos and GIFs from X (Twitter) in high quality. Free X video downloader tool. Save X videos to your device quickly and easily.',
            keywords: 'X video downloader, Twitter video download, download X videos, Twitter video downloader, X video download, save Twitter videos'
          };
        case '/youtube':
          return {
            title: 'YouTube Video Downloader - Download YouTube Videos MP4',
            description: 'Download YouTube videos in MP4, MP3, and various qualities. Free YouTube downloader with high-speed downloads. Save YouTube videos offline.',
            keywords: 'YouTube downloader, download YouTube videos, YouTube video download, YouTube MP4 download, YouTube MP3 download, save YouTube videos'
          };
        default:
          return {
            title: 'Video Downloader',
            description: 'Download videos from popular social media platforms',
            keywords: 'video downloader, download videos'
          };
      }
    };

    const { title, description, keywords } = getPageMeta();
    
    document.title = title;
    
    // Update meta tags
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // Open Graph tags
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:type', 'website');
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);

  }, [location.pathname]);

  return null;
};

export default SEOHead;