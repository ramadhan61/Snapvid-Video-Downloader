import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useDownload } from '../contexts/DownloadContext';
import VideoDownloader from '../components/VideoDownloader';

const TikTokPage = () => {
  const { addDownload } = useDownload();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState('');
  const [autoDownloadStarted, setAutoDownloadStarted] = useState(false);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a TikTok URL');
      return;
    }

    if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com')) {
      setError('Please enter a valid TikTok URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Enhanced TikTok URL processing
      let processedUrl = url.trim();
      
      // Handle short TikTok URLs
      if (processedUrl.includes('vm.tiktok.com')) {
        // For short URLs, we'll pass them directly to the API
        // The API should handle the redirect
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
          
          // Find best video option (prefer no watermark)
          const bestOption = data.downloadUrls.find((url: any) => 
            url.type !== 'audio' && 
            (url.quality?.toLowerCase().includes('no watermark') || 
             url.quality?.toLowerCase().includes('hd') ||
             url.extension === 'mp4' || url.ext === 'mp4')
          ) || data.downloadUrls[0];
          
          setTimeout(() => {
            handleDownloadFile(bestOption);
            showAutoDownloadNotification(bestOption);
          }, 1000);
        }
      } else {
        setError('Failed to fetch TikTok video information. Please check the URL and try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showAutoDownloadNotification = (downloadUrl: any) => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    const toast = document.createElement('div');
    
    if (isIOS) {
      toast.innerHTML = `
        <div style="text-align: left;">
          <div style="font-weight: bold; margin-bottom: 8px;">✅ TikTok Download Started</div>
          <div style="font-size: 14px; line-height: 1.4;">
            <strong>Quality:</strong> ${downloadUrl.quality || 'HD'}<br>
            • Download started automatically<br>
            • Check Downloads folder<br>
            • Or Files app → Downloads
          </div>
        </div>
      `;
    } else {
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; border: 2px solid #ec4899; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <span>Auto downloading TikTok: ${downloadUrl.quality || 'HD'}</span>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
    }
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isIOS ? '#34C759' : '#ec4899'};
      color: white;
      padding: ${isIOS ? '16px 20px' : '12px 20px'};
      border-radius: ${isIOS ? '12px' : '8px'};
      z-index: 10000;
      font-weight: 500;
      box-shadow: ${isIOS ? '0 4px 20px rgba(52,199,89,0.3)' : '0 4px 12px rgba(236,72,153,0.3)'};
      max-width: ${isIOS ? '320px' : '350px'};
      font-size: ${isIOS ? '13px' : '14px'};
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, isIOS ? 4000 : 4000);
  };
  const handleDownloadFile = (downloadUrl: any) => {
    // Enhanced data extraction for TikTok
    const videoTitle = videoData.detail?.title || videoData.detail?.desc || 'TikTok Video';
    const videoAuthor = videoData.detail?.author || videoData.detail?.nickname || videoData.detail?.unique_id;
    const videoDuration = videoData.detail?.duration;
    const videoThumbnail = videoData.detail?.thumbnail || videoData.detail?.cover;
    
    addDownload({
      title: videoTitle,
      url: downloadUrl.url,
      quality: downloadUrl.quality || downloadUrl.resolution || 'HD',
      platform: 'tiktok',
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
      title="TikTok Video Downloader"
      description="Download TikTok videos without watermark in HD quality. Save TikTok videos to your device quickly and easily."
      placeholder="Paste TikTok video URL here..."
      platform="TikTok"
      platformIcon="🎵"
      platformColor="from-pink-500 to-rose-500"
      url={url}
      setUrl={setUrl}
      isLoading={isLoading}
      videoData={videoData}
      error={error}
      onDownload={handleDownload}
      onDownloadFile={handleDownloadFile}
      keywords={['TikTok downloader', 'download TikTok videos', 'TikTok video download', 'TikTok no watermark', 'save TikTok videos', 'TikTok HD download', 'Snaptik','sstik']}
      features={[
        'Download without watermark',
        'HD quality videos',
        'Audio extraction',
        'Multiple format support',
        'Fast download speed',
        'No registration required'
      ]}
    />
  );
};

export default TikTokPage;
