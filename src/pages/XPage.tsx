import React, { useState } from 'react';
import { useDownload } from '../contexts/DownloadContext';
import VideoDownloader from '../components/VideoDownloader';

const XPage = () => {
  const { addDownload } = useDownload();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState('');
  const [autoDownloadStarted, setAutoDownloadStarted] = useState(false);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter an X (Twitter) URL');
      return;
    }

    if (!url.includes('twitter.com') && !url.includes('x.com') && !url.includes('t.co')) {
      setError('Please enter a valid X (Twitter) URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Enhanced X (Twitter) URL processing
      let processedUrl = url.trim();
      
      // Handle different X/Twitter URL formats
      if (processedUrl.includes('x.com/')) {
        // X.com URLs are already in the correct format
      } else if (processedUrl.includes('mobile.twitter.com')) {
        // Convert mobile URLs to desktop format
        processedUrl = processedUrl.replace('mobile.twitter.com', 'twitter.com');
      } else if (processedUrl.includes('t.co/')) {
        // t.co URLs are short links, pass them directly to API
      }

      const response = await fetch(`https://api.paxsenix.biz.id/dl/aio?url=${encodeURIComponent(processedUrl)}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk-paxsenix-cdiIbHKw5k-JQ70SC0IOaQNwsn8wk8hjU03Bi8M0DTw1NlqR',  //Change you api key
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
        setError('Failed to fetch X (Twitter) video information. Please check the URL and try again.');
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
        <div style="width: 20px; height: 20px; border: 2px solid #000; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Auto downloading X: ${downloadUrl.quality || 'HD'}</span>
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
      background: #000;
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
    // Enhanced data extraction for X (Twitter)
    const videoTitle = videoData.detail?.title || videoData.detail?.text || 'X (Twitter) Video';
    const videoAuthor = videoData.detail?.author || videoData.detail?.user?.name || videoData.detail?.user?.screen_name;
    const videoDuration = videoData.detail?.duration;
    const videoThumbnail = videoData.detail?.thumbnail || videoData.detail?.media?.[0]?.media_url_https;
    
    addDownload({
      title: videoTitle,
      url: downloadUrl.url,
      quality: downloadUrl.quality || downloadUrl.resolution || 'HD',
      platform: 'x',
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
      title="X (Twitter) Video Downloader"
      description="Download videos and GIFs from X (Twitter) in high quality. Free X video downloader tool."
      placeholder="Paste X (Twitter) video URL here..."
      platform="X (Twitter)"
      platformIcon="🐦"
      platformColor="from-gray-800 to-black"
      url={url}
      setUrl={setUrl}
      isLoading={isLoading}
      videoData={videoData}
      error={error}
      onDownload={handleDownload}
      onDownloadFile={handleDownloadFile}
      keywords={['X video downloader', 'Twitter video download', 'download X videos', 'Twitter video downloader', 'X video download', 'save Twitter videos']}
      features={[
        'HD video downloads',
        'GIF support',
        'Thread video extraction',
        'Audio extraction',
        'Multiple formats',
        'Fast processing'
      ]}
    />
  );
};

export default XPage;
