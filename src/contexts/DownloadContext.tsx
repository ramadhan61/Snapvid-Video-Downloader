import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DownloadItem {
  id: string;
  title: string;
  url: string;
  quality: string;
  platform: string;
  thumbnail?: string;
  size?: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  type: 'video' | 'audio';
  extension: string;
  author?: string;
  duration?: number;
  viewCount?: number;
  likeCount?: number;
  originalUrl?: string;
  downloadedBytes?: number;
  totalBytes?: number;
  downloadSpeed?: number;
  timeRemaining?: number;
}

interface DownloadContextType {
  downloads: DownloadItem[];
  addDownload: (item: Omit<DownloadItem, 'id' | 'progress' | 'status'>) => void;
  removeDownload: (id: string) => void;
  clearCompleted: () => void;
  startDownload: (id: string) => void;
  isDuplicateDownload: (url: string, quality: string, type: string) => boolean;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // Enhanced duplicate detection with better key matching
  const isDuplicateDownload = useCallback((url: string, quality: string, type: string) => {
    return downloads.some(download => {
      const isSameUrl = download.url === url || download.originalUrl === url;
      const isSameQuality = download.quality === quality;
      const isSameType = download.type === type;
      const isActiveDownload = ['pending', 'downloading', 'completed'].includes(download.status);
      
      return isSameUrl && isSameQuality && isSameType && isActiveDownload;
    });
  }, [downloads]);

  const addDownload = useCallback((item: Omit<DownloadItem, 'id' | 'progress' | 'status'>) => {
    // Enhanced duplicate check
    if (isDuplicateDownload(item.url, item.quality, item.type)) {
      // Show duplicate notification
      showNotification('This file is already downloaded or in progress!', 'warning');
      return;
    }

    const newItem: DownloadItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      status: 'pending',
      downloadedBytes: 0,
      totalBytes: 0,
      downloadSpeed: 0,
      timeRemaining: 0
    };
    
    setDownloads(prev => [newItem, ...prev]);
    
    // Auto start download with delay
    setTimeout(() => startDownload(newItem.id), 100);
  }, [isDuplicateDownload]);

  const removeDownload = useCallback((id: string) => {
    setDownloads(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setDownloads(prev => prev.filter(item => item.status !== 'completed'));
  }, []);

  const startDownload = useCallback((id: string) => {
    setDownloads(prev => prev.map(item => {
      if (item.id === id && item.status === 'pending') {
        // Start real download process
        downloadFileWithRealProgress(item);
        return { ...item, status: 'downloading' as const };
      }
      return item;
    }));
  }, []);

  // Real progress download function
  const downloadFileWithRealProgress = async (item: DownloadItem) => {
    try {
      // Enhanced iOS detection and handling
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      const isIOSSafari = isIOS && isSafari;
      
      // For iOS Safari, use direct download method immediately
      if (isIOSSafari) {
        await downloadForIOSDirectly(item);
        setDownloads(current => current.map(download => 
          download.id === item.id 
            ? { ...download, progress: 100, status: 'completed' as const }
            : download
        ));
        showNotification(`${item.title} download started on iOS!`, 'success');
        return;
      }
      
      const startTime = Date.now();
      
      // Get file info first
      const response = await fetch(item.url, { 
        method: 'HEAD',
        headers: {
          'Accept': '*/*',
          'User-Agent': navigator.userAgent,
          'Referer': window.location.origin,
        }
      });

      const totalBytes = parseInt(response.headers.get('content-length') || '0');
      
      // Update total size
      setDownloads(current => current.map(download => 
        download.id === item.id 
          ? { ...download, totalBytes }
          : download
      ));

      // Start actual download with progress tracking
      const downloadResponse = await fetch(item.url, {
        headers: {
          'Accept': '*/*',
          'User-Agent': navigator.userAgent,
          'Referer': window.location.origin,
        }
      });

      if (!downloadResponse.ok) {
        throw new Error(`HTTP ${downloadResponse.status}`);
      }

      const reader = downloadResponse.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const chunks: Uint8Array[] = [];
      let downloadedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        downloadedBytes += value.length;
        
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / 1000;
        const downloadSpeed = downloadedBytes / elapsedTime;
        const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
        const timeRemaining = totalBytes > 0 && downloadSpeed > 0 
          ? Math.round((totalBytes - downloadedBytes) / downloadSpeed) 
          : 0;

        // Update progress in real-time
        setDownloads(current => current.map(download => 
          download.id === item.id 
            ? { 
                ...download, 
                progress,
                downloadedBytes,
                downloadSpeed,
                timeRemaining,
                status: 'downloading' as const
              }
            : download
        ));

        // Small delay to prevent UI blocking
        if (downloadedBytes % (1024 * 100) === 0) { // Every 100KB
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      // Combine chunks and create blob
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combinedArray = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        combinedArray.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([combinedArray]);
      
      // Download the file
      await downloadBlobFile(blob, item);
      
      // Mark as completed
      setDownloads(current => current.map(download => 
        download.id === item.id 
          ? { ...download, progress: 100, status: 'completed' as const }
          : download
      ));

      showNotification(`${item.title} downloaded successfully!`, 'success');

    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback to simple download
      try {
        await fallbackDownload(item);
        setDownloads(current => current.map(download => 
          download.id === item.id 
            ? { ...download, progress: 100, status: 'completed' as const }
            : download
        ));
        showNotification(`${item.title} downloaded successfully!`, 'success');
      } catch (fallbackError) {
        setDownloads(current => current.map(download => 
          download.id === item.id 
            ? { ...download, status: 'error' as const }
            : download
        ));
        showNotification(`Failed to download ${item.title}`, 'error');
      }
    }
  };

  // Enhanced iOS direct download method
  const downloadForIOSDirectly = async (item: DownloadItem) => {
    try {
      const filename = createSafeFilename(item.title, item.platform, item.quality, item.extension);
      
      // Enhanced iOS direct download - force download without new tab
      const link = document.createElement('a');
      link.href = item.url;
      link.download = filename;
      // Remove target="_blank" to prevent new tab opening
      link.style.display = 'none';
      
      document.body.appendChild(link);
      
      // Enhanced iOS download trigger
      try {
        // Method 1: Direct click
        link.click();
      } catch (e) {
        // Method 2: Enhanced event simulation for iOS
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        });
        link.dispatchEvent(clickEvent);
      }
      
      // Method 3: iOS Safari specific download trigger
      if (link.click) {
        setTimeout(() => {
          link.click();
        }, 100);
      }
      
      // Clean up
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 100);
      
      // Show iOS success notification instead of instructions
      showIOSSuccessNotification(item.title);
      
    } catch (error) {
      console.error('iOS download error:', error);
      throw error;
    }
  };

  // iOS success notification
  const showIOSSuccessNotification = (title: string) => {
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="text-align: left;">
        <div style="font-weight: bold; margin-bottom: 8px;">✅ Download Started!</div>
        <div style="font-size: 14px; line-height: 1.4;">
          <strong>${title}</strong><br>
          • Download started automatically<br>
          • Check your Downloads folder<br>
          • Or Files app → Downloads
        </div>
      </div>
    `;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #34C759;
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      z-index: 10000;
      font-weight: 500;
      box-shadow: 0 4px 20px rgba(52,199,89,0.3);
      max-width: 320px;
      font-size: 13px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 5000);
  };

  // Enhanced blob download with device detection
  const downloadBlobFile = async (blob: Blob, item: DownloadItem) => {
    const filename = createSafeFilename(item.title, item.platform, item.quality, item.extension);
    
    // Device detection for optimal download method
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    try {
      if (isIOS) {
        // iOS Safari - enhanced method with better UX
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = filename;
        document.body.appendChild(link);
        
        // Enhanced click simulation for iOS
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        });
        link.dispatchEvent(clickEvent);
        
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        
        // Show iOS instruction
        showIOSDownloadInstruction(item.title);
      } else if (isAndroid || isMobile) {
        // Mobile devices - direct download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } else if ((window.navigator as any).msSaveOrOpenBlob) {
        // IE/Edge legacy
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
      } else {
        // Modern desktop browsers
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (error) {
      throw new Error('Failed to download file');
    }
  };

  // Fallback download method
  const fallbackDownload = async (item: DownloadItem) => {
    const filename = createSafeFilename(item.title, item.platform, item.quality, item.extension);
    const link = document.createElement('a');
    link.href = item.url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper functions
  const createSafeFilename = (title: string, platform: string, quality: string, extension: string): string => {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    return `${cleanTitle}_${platform}_${quality}.${extension}`;
  };

  const showNotification = (message: string, type: 'success' | 'warning' | 'error') => {
    const colors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: 500;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  };

  return (
    <DownloadContext.Provider value={{ 
      downloads, 
      addDownload, 
      removeDownload, 
      clearCompleted,
      startDownload,
      isDuplicateDownload
    }}>
      {children}
    </DownloadContext.Provider>
  );
};