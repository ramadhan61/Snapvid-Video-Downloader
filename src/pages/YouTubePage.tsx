import React, { useState } from 'react';
import { useDownload } from '../contexts/DownloadContext';
import VideoDownloader from '../components/VideoDownloader';

const YouTubePage = () => {
  const { addDownload } = useDownload();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState('');
  const [autoDownloadStarted, setAutoDownloadStarted] = useState(false);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('youtube.com/shorts')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Enhanced YouTube URL processing
      let processedUrl = url.trim();
      
      // Handle different YouTube URL formats
      if (processedUrl.includes('youtu.be/')) {
        const videoId = processedUrl.split('youtu.be/')[1].split('?')[0];
        processedUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else if (processedUrl.includes('youtube.com/shorts/')) {
        const videoId = processedUrl.split('youtube.com/shorts/')[1].split('?')[0];
        processedUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }

      const response = await fetch(`https://api.paxsenix.biz.id/dl/aio?url=${encodeURIComponent(processedUrl)}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk-paxsenix-XzTVDzit2ZRHhOLkBuRJBU0OnYzMI6M5WXc2Zwnlzbb8LSOj',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.ok) {
        // Enhanced YouTube data processing
        if (data.downloadUrls && data.downloadUrls.length > 0) {
          // Sort download options by quality (highest first)
          data.downloadUrls.sort((a: any, b: any) => {
            const getQualityValue = (quality: string) => {
              if (quality.includes('2160')) return 2160; // 4K
              if (quality.includes('1440')) return 1440; // 2K
              if (quality.includes('1080')) return 1080; // Full HD
              if (quality.includes('720')) return 720;   // HD
              if (quality.includes('480')) return 480;   // SD
              if (quality.includes('360')) return 360;   // Low
              if (quality.includes('240')) return 240;   // Very Low
              return 0;
            };
            
            const qualityA = getQualityValue(a.quality || a.resolution || '');
            const qualityB = getQualityValue(b.quality || b.resolution || '');
            return qualityB - qualityA;
          });
        }
        setVideoData(data);
        
        // Auto download best quality video after getting data
        if (!autoDownloadStarted && data.downloadUrls && data.downloadUrls.length > 0) {
          setAutoDownloadStarted(true);
          
          // Find best video quality (not audio-only)
          const videoOptions = data.downloadUrls.filter((url: any) => 
            url.type !== 'audio' && 
            url.vcodec !== 'none' && 
            !url.quality?.toLowerCase().includes('audio') &&
            (url.extension === 'mp4' || url.ext === 'mp4')
          );
          
          if (videoOptions.length > 0) {
            // Auto download the best quality video
            setTimeout(() => {
              handleDownloadFile(videoOptions[0]);
              showAutoDownloadNotification(videoOptions[0]);
            }, 1000);
          } else if (data.downloadUrls.length > 0) {
            // Fallback to first available option
            setTimeout(() => {
              handleDownloadFile(data.downloadUrls[0]);
              showAutoDownloadNotification(data.downloadUrls[0]);
            }, 1000);
          }
        }
      } else {
        setError('Failed to fetch YouTube video information. Please check the URL and try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showAutoDownloadNotification = (downloadUrl: any) => {
    // Enhanced notification for iOS
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    const toast = document.createElement('div');
    
    if (isIOS) {
      toast.innerHTML = `
        <div style="text-align: left;">
          <div style="font-weight: bold; margin-bottom: 8px;">✅ YouTube Download Started</div>
          <div style="font-size: 14px; line-height: 1.4;">
            <strong>Quality:</strong> ${downloadUrl.quality || 'HD'}<br>
            <strong>Format:</strong> ${downloadUrl.extension || 'MP4'}<br>
            • Download started automatically<br>
            • Check Downloads folder<br>
            • Or Files app → Downloads
          </div>
        </div>
      `;
    } else {
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; border: 2px solid #dc2626; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <span>Auto downloading YouTube: ${downloadUrl.quality || 'Best Quality'} ${downloadUrl.extension || 'MP4'}</span>
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
      background: ${isIOS ? '#34C759' : '#dc2626'};
      color: white;
      padding: ${isIOS ? '16px 20px' : '12px 20px'};
      border-radius: ${isIOS ? '12px' : '8px'};
      z-index: 10000;
      font-weight: 500;
      box-shadow: ${isIOS ? '0 4px 20px rgba(52,199,89,0.3)' : '0 4px 12px rgba(220,38,38,0.3)'};
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
    // Enhanced data extraction for YouTube with better fallbacks
    const videoTitle = videoData.detail?.title || 
                      videoData.detail?.fulltitle || 
                      videoData.detail?.display_id || 
                      'YouTube Video';
    const videoAuthor = videoData.detail?.author || 
                       videoData.detail?.uploader || 
                       videoData.detail?.channel || 
                       videoData.detail?.uploader_id ||
                       'Unknown';
    const videoDuration = videoData.detail?.duration;
    const videoThumbnail = videoData.detail?.thumbnail || 
                          videoData.detail?.thumbnails?.[0]?.url ||
                          videoData.detail?.thumbnails?.maxresdefault?.url;
    const videoViews = videoData.detail?.view_count || 
                      videoData.detail?.views;
    const videoLikes = videoData.detail?.like_count || 
                      videoData.detail?.likes;
    
    addDownload({
      title: videoTitle,
      url: downloadUrl.url,
      quality: downloadUrl.quality || downloadUrl.resolution || downloadUrl.format || 'HD',
      platform: 'youtube',
      thumbnail: videoThumbnail,
      type: downloadUrl.type || (downloadUrl.vcodec === 'none' ? 'audio' : 'video'),
      extension: downloadUrl.extension || downloadUrl.ext || downloadUrl.container || 'mp4',
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
      title="YouTube Video Downloader"
      description="Download YouTube videos in MP4, MP3, and various qualities. Free YouTube downloader with high-speed downloads."
      placeholder="Paste YouTube video URL here..."
      platform="YouTube"
      platformIcon="📺"
      platformColor="from-red-600 to-red-700"
      url={url}
      setUrl={setUrl}
      isLoading={isLoading}
      videoData={videoData}
      error={error}
      onDownload={handleDownload}
      onDownloadFile={handleDownloadFile}
      keywords={['YouTube downloader', 'download YouTube videos', 'YouTube video download', 'YouTube MP4 download', 'YouTube MP3 download', 'save YouTube videos']}
      features={[
        'Multiple quality options',
        'MP4 and MP3 formats',
        'HD and 4K support',
        'Audio extraction',
        'Playlist support',
        'No length limit'
      ]}
    />
  );
};

export default YouTubePage;