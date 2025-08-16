import React, { useState } from 'react';
import { useDownload } from '../contexts/DownloadContext';
import VideoDownloader from '../components/VideoDownloader';

const FacebookPage = () => {
  const { addDownload } = useDownload();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState('');
  const [autoDownloadStarted, setAutoDownloadStarted] = useState(false);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a Facebook URL');
      return;
    }

    if (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('fb.com')) {
      setError('Please enter a valid Facebook URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Enhanced Facebook URL processing
      let processedUrl = url.trim();
      
      // Handle different Facebook URL formats
      if (processedUrl.includes('fb.watch/')) {
        // fb.watch URLs are already in the correct format
      } else if (processedUrl.includes('m.facebook.com')) {
        // Convert mobile URLs to desktop format
        processedUrl = processedUrl.replace('m.facebook.com', 'www.facebook.com');
      }

      const response = await fetch(`https://api.paxsenix.biz.id/dl/aio?url=${encodeURIComponent(processedUrl)}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk-paxsenix-cdiIbHKw5k-JQ70SC0IOaQNwsn8wk8hjU03Bi8M0DTw1NlqR',
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
        setError('Failed to fetch Facebook video information. Please check the URL and try again.');
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
        <div style="width: 20px; height: 20px; border: 2px solid #1877f2; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Auto downloading Facebook: ${downloadUrl.quality || 'HD'}</span>
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
      background: #1877f2;
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
    // Enhanced data extraction for Facebook
    const videoTitle = videoData.detail?.title || videoData.detail?.description || 'Facebook Video';
    const videoAuthor = videoData.detail?.author || videoData.detail?.owner?.name;
    const videoDuration = videoData.detail?.duration;
    const videoThumbnail = videoData.detail?.thumbnail || videoData.detail?.picture;
    
    addDownload({
      title: videoTitle,
      url: downloadUrl.url,
      quality: downloadUrl.quality || downloadUrl.resolution || 'HD',
      platform: 'facebook',
      thumbnail: videoThumbnail,
      type: downloadUrl.type,
      extension: downloadUrl.extension || downloadUrl.ext || 'mp4',
      author: videoAuthor,
      duration: videoDuration,
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
      title="Facebook Video Downloader"
      description="Download Facebook videos in HD quality for free. Save Facebook videos, reels, and posts to your device."
      placeholder="Paste Facebook video URL here..."
      platform="Facebook"
      platformIcon="📘"
      platformColor="from-blue-600 to-blue-700"
      url={url}
      setUrl={setUrl}
      isLoading={isLoading}
      videoData={videoData}
      error={error}
      onDownload={handleDownload}
      onDownloadFile={handleDownloadFile}
      keywords={['Facebook video downloader', 'download Facebook videos', 'Facebook video download', 'Facebook HD download', 'save Facebook videos', 'Facebook reels download']}
      features={[
        'HD quality downloads',
        'Facebook Reels support',
        'Multiple formats',
        'Fast processing',
        'No software needed',
        'Mobile compatible'
      ]}
    />
  );
};

export default FacebookPage;
