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
    // First try the most direct method that works across platforms
    return await forceDirectDownload(url, filename);
  } catch (error) {
    console.error('Direct download failed, trying platform-specific method:', error);
    try {
      switch (method) {
        case 'ios-safari':
          return await downloadForIOSSafari(url, filename);
        case 'android-chrome':
          return await downloadForAndroidChrome(url, filename);
        case 'desktop-safari':
          return await downloadForDesktopSafari(url, filename);
        default:
          return await downloadForDesktopModern(url, filename);
      }
    } catch (fallbackError) {
      console.error('Platform-specific download failed:', fallbackError);
      return await downloadFallback(url, filename);
    }
  }
};

/** ===================== Universal Direct Download ===================== **/
const forceDirectDownload = async (url: string, filename: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      // First try fetch + blob method (works on most modern browsers)
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({ 'Content-Type': 'application/octet-stream' })
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        
        // Append to body (required for Firefox)
        document.body.appendChild(a);
        
        // Programmatically click the link
        a.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        resolve(true);
      })
      .catch(error => {
        console.error('Fetch blob method failed:', error);
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/** ===================== iOS Safari ===================== **/
const downloadForIOSSafari = async (url: string, filename: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // iOS requires a more complex approach
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.display = 'none';
      iframe.sandbox = 'allow-scripts allow-same-origin allow-downloads';
      
      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(iframe);
          showIOSSuccessNotification(filename);
          resolve(true);
        }, 1000);
      };
      
      document.body.appendChild(iframe);
    } catch (error) {
      console.error('iOS iframe method failed:', error);
      window.open(url, '_blank');
      resolve(false);
    }
  });
};

/** ===================== Android Chrome ===================== **/
const downloadForAndroidChrome = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Create a hidden form and submit it
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = url;
    form.target = '_blank';
    form.style.display = 'none';
    
    document.body.appendChild(form);
    form.submit();
    
    setTimeout(() => {
      document.body.removeChild(form);
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Android form method failed:', error);
    window.open(url, '_blank');
    return false;
  }
};

/** ===================== Desktop Safari ===================== **/
const downloadForDesktopSafari = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Safari sometimes needs this approach
    window.location.href = url;
    return true;
  } catch (error) {
    console.error('Desktop Safari method failed:', error);
    return false;
  }
};

/** ===================== Desktop Modern ===================== **/
const downloadForDesktopModern = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Try using the HTML5 download attribute
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
    return true;
  } catch (error) {
    console.error('Modern desktop method failed:', error);
    return false;
  }
};

/** ===================== Fallback ===================== **/
const downloadFallback = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Final fallback - open in new tab
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Popup blocked, redirect current page
      window.location.href = url;
    }
    return true;
  } catch (error) {
    console.error('All download methods failed:', error);
    return false;
  }
};

/** ===================== iOS Notification ===================== **/
const showIOSSuccessNotification = (filename: string) => {
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="text-align: center;">
      <div style="font-weight: bold; margin-bottom: 8px;">📥 Download Started</div>
      <div style="font-size: 14px; line-height: 1.4;">
        Tap <strong>Share</strong> → <strong>Save to Files</strong><br>
        Save as: <strong>${filename}</strong>
      </div>
    </div>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #007AFF;
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    z-index: 10000;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0,122,255,0.3);
    max-width: 300px;
    font-size: 13px;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 5000);
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
