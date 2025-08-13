// DownloadHelper.ts
import { detectDevice, getOptimalDownloadMethod } from './deviceDetection';

export interface DownloadOptions {
  url: string;
  filename: string;
  type: 'video' | 'audio';
  platform: string;
}

export const DownloadHelper = async (options: DownloadOptions): Promise<boolean> => {
  const { url, filename } = options;
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

/** ===================== iOS Safari ===================== **/
const downloadForIOSSafari = async (url: string, filename: string): Promise<boolean> => {
  try {
    // First try the standard download method
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.target = '_blank';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    
    // Create and dispatch click event
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    anchor.dispatchEvent(clickEvent);
    
    // For iOS 13+ we need to use this approach
    setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 200);
    
    document.body.removeChild(anchor);
    showIOSSuccessNotification(filename);
    return true;
  } catch (error) {
    console.error('iOS download failed:', error);
    // Fallback to opening in new tab
    window.open(url, '_blank');
    return false;
  }
};

const showIOSSuccessNotification = (filename: string) => {
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="text-align: left;">
      <div style="font-weight: bold; margin-bottom: 8px;">✅ Download Started</div>
      <div style="font-size: 14px; line-height: 1.4;">
        <strong>${filename}</strong><br>
        • Tap and hold the preview to save<br>
        • Check Files app → Downloads folder
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
  setTimeout(() => { if (document.body.contains(toast)) document.body.removeChild(toast); }, 5000);
};

/** ===================== Android Chrome ===================== **/
const downloadForAndroidChrome = async (url: string, filename: string): Promise<boolean> => {
  try {
    // First try the fetch + blob method
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': '*/*' },
      credentials: 'include'
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Force click for Android
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      link.dispatchEvent(clickEvent);
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
      return true;
    }

    throw new Error('Fetch failed');
  } catch {
    // Fallback to simple anchor click
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(clickEvent);
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 1000);
    return true;
  }
};

/** ===================== Desktop Safari ===================== **/
const downloadForDesktopSafari = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Safari has issues with blob downloads, so we use a direct link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Force click for better reliability
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(clickEvent);
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 1000);
    return true;
  } catch {
    return false;
  }
};

/** ===================== Desktop Modern ===================== **/
const downloadForDesktopModern = async (url: string, filename: string): Promise<boolean> => {
  try {
    // For modern browsers, use fetch + blob approach
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': '*/*' },
      credentials: 'include',
      mode: 'cors',
    });

    if (response.ok) {
      const blob = await response.blob();

      // IE/Edge special case
      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveOrOpenBlob(blob, filename);
        return true;
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Force click for better reliability
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      link.dispatchEvent(clickEvent);
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
      return true;
    }

    throw new Error('Fetch failed');
  } catch {
    // Fallback to simple anchor click
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(clickEvent);
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 1000);
    return true;
  }
};

/** ===================== Fallback ===================== **/
const downloadFallback = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Final fallback - just open in new tab
    window.open(url, '_blank');
    return true;
  } catch {
    console.error('All download methods failed');
    return false;
  }
};

/** ===================== Utility ===================== **/
export const createSafeFilename = (title: string, platform: string, quality: string, extension: string): string => {
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_').substring(0, 50);
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
