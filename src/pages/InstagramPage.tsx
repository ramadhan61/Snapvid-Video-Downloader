import React, { useState } from 'react';
import { useDownload } from '../contexts/DownloadContext';
import VideoDownloader from '../components/VideoDownloader';

const InstagramPage = () => {
  const { addDownload } = useDownload();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState('');
  const [autoDownloadStarted, setAutoDownloadStarted] = useState(false);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter an Instagram URL');
      return;
    }

    if (!url.includes('instagram.com') && !url.includes('instagr.am')) {
      setError('Please enter a valid Instagram URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Enhanced Instagram URL processing
      let processedUrl = url.trim();
      
      // Handle different Instagram URL formats
      if (processedUrl.includes('instagr.am/')) {
        // Convert short URLs to full format
        processedUrl = processedUrl.replace('instagr.am/', 'instagram.com/');
      }

      const response = await fetch(`https://api.paxsenix.biz.id/dl/aio?url=${encodeURIComponent(processedUrl)}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk-paxsenix-cdiIbHKw5k-JQ70SC0IOaQNwsn8wk8hjU03Bi8M0DTw1NlqR', //Change your api key
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.ok) {
        setVideoData(data);
        
        // Auto download best quality after getting data
        if (!autoDownloadStarted && data.downloadUrls && data.downloadUrls.length > 0) {
          setAutoDownloadStarted(true);
          
          const bestOption = data.downloadUrls.find((url: any) => 
            url.type !== 'audio' && 
            (url.quality?.toLowerCase().includes('hd') ||
             url.extension === 'mp4' || url.ext === 'mp4')
          ) || data.downloadUrls[0];
          
          setTimeout(() => {
            handleDownloadFile(bestOption);
            showAutoDownloadNotification(bestOption);
          }, 1000);
        }
      } else {
        setError('Failed to fetch Instagram video information. Please check the URL and try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showAutoDownloadNotification = (downloadUrl: any) => {
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 20px; border: 2px solid #e4405f; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Auto downloading Instagram: ${downloadUrl.quality || 'HD'}</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e4405f;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 350px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  };
  const handleDownloadFile = (downloadUrl: any) => {
    // Enhanced data extraction for Instagram
    const videoTitle = videoData.detail?.title || videoData.detail?.caption || 'Instagram Video';
    const videoAuthor = videoData.detail?.author || videoData.detail?.owner?.full_name || videoData.detail?.owner?.username;
    const videoDuration = videoData.detail?.duration;
    const videoThumbnail = videoData.detail?.thumbnail || videoData.detail?.display_url;
    const videoViews = videoData.detail?.view_count || videoData.detail?.video_view_count;
    const videoLikes = videoData.detail?.like_count || videoData.detail?.edge_media_preview_like?.count;
    
    addDownload({
      title: videoTitle,
      url: downloadUrl.url,
      quality: downloadUrl.quality || downloadUrl.resolution || 'HD',
      platform: 'instagram',
      thumbnail: videoThumbnail,
      type: downloadUrl.type,
      extension: downloadUrl.extension || downloadUrl.ext || 'mp4',
      author: videoAuthor,
      duration: videoDuration,
      viewCount: videoViews,
      likeCount: videoLikes,
      originalUrl: url
    });
  };

  // Reset auto download flag when URL changes
  React.useEffect(() => {
    setAutoDownloadStarted(false);
    setVideoData(null);
    setError('');
  }, [url]);
  return (
    <VideoDownloader
      title="Instagram Video Downloader"
      description="Download Instagram videos, reels, and IGTV in high quality. Save Instagram content to your device quickly and easily."
      placeholder="Paste Instagram video/reel URL here..."
      platform="Instagram"
      platformIcon="📷"
      platformColor="from-pink-500 via-purple-500 to-orange-500"
      url={url}
      setUrl={setUrl}
      isLoading={isLoading}
      videoData={videoData}
      error={error}
      onDownload={handleDownload}
      onDownloadFile={handleDownloadFile}
      keywords={['Instagram downloader', 'download Instagram videos', 'Instagram video download', 'Instagram reels download', 'save Instagram videos', 'IGTV download']}
      features={[
        'Download Instagram Reels',
        'IGTV video support',
        'High quality downloads',
        'Audio extraction',
        'Story download support',
        'No login required'
      ]}
    />
  );
};

export default InstagramPage;
