import { detectDevice, getOptimalDownloadMethod } from './deviceDetection';

export interface DownloadOptions {
  url: string;
  filename: string;
  type: 'video' | 'audio';
  platform: string;
}

export const universalDownload = async (options: DownloadOptions): Promise<boolean> => {
  const { url, filename, type, platform } = options;
  const method = getOptimalDownloadMethod();
  
  try {
    switch (method) {
      case 'ios-safari':
        return await downloadForIOSSafari(url, filename);
      
      case 'android-chrome':
        return await downloadForAndroidChrome(url, filename);
      
      case 'desktop-safari':
        return await downloadForDesktopSafari(url, filename);
      
      case 'desktop-chrome':
      case 'desktop-firefox':
      case 'desktop-edge':
        return await downloadForDesktopModern(url, filename);
      
      default:
        return await downloadFallback(url, filename);
    }
  } catch (error) {
    console.error('Download failed:', error);
    return await downloadFallback(url, filename);
  }
};

const downloadForIOSSafari = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Direct iOS Safari download without new tab
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    // Remove target="_blank" to prevent new tab
    link.style.display = 'none';
    
    document.body.appendChild(link);
    
    // Multiple iOS download methods
    try {
      // Method 1: Direct click
      link.click();
    } catch (e) {
      // Method 2: Event simulation
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1
      });
      link.dispatchEvent(clickEvent);
    }
    
    // Method 3: Delayed click for iOS Safari
    setTimeout(() => {
      if (link.click) {
        link.click();
      }
    }, 50);
    
    document.body.removeChild(link);
    
    // Show success notification
    showIOSSuccessNotification(filename);
    
    return true;
  } catch (error) {
    return false;
  }
};

// iOS success notification
const showIOSSuccessNotification = (filename: string) => {
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="text-align: left;">
      <div style="font-weight: bold; margin-bottom: 8px;">✅ iOS Download</div>
      <div style="font-size: 14px; line-height: 1.4;">
        <strong>${filename}</strong><br>
        • Download started automatically<br>
        • Check Downloads folder<br>
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

const downloadForAndroidChrome = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Try fetch first for Android Chrome
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': navigator.userAgent,
      },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
      return true;
    }
    
    throw new Error('Fetch failed');
  } catch (error) {
    // Fallback for Android
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  }
};

const downloadForDesktopSafari = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Safari desktop - direct link with target blank
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    return false;
  }
};

const downloadForDesktopModern = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Modern desktop browsers - fetch and blob
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': navigator.userAgent,
        'Referer': window.location.origin,
      },
      mode: 'cors',
    });
    
    if (response.ok) {
      const blob = await response.blob();
      
      // Check for IE/Edge legacy
      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
        return true;
      }
      
      // Modern browsers
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
      return true;
    }
    
    throw new Error('Fetch failed');
  } catch (error) {
    // Fallback to direct link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  }
};

const downloadFallback = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Ultimate fallback - just open the URL
    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('All download methods failed:', error);
    return false;
  }
};

export const createSafeFilename = (title: string, platform: string, quality: string, extension: string): string => {
  // Remove special characters and limit length
  const cleanTitle = title
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  return `${cleanTitle}_${platform}_${quality}.${extension}`;
};

export const validateDownloadUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};