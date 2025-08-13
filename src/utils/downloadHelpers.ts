// DownloadHelper.ts
export interface DownloadOptions {
  url: string;
  filename: string;
}

export const DownloadHelper = async (options: DownloadOptions): Promise<boolean> => {
  const { url, filename } = options;
  
  // Deteksi platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  try {
    // Utamakan metode fetch + blob untuk semua platform modern
    if (!isIOS && !isSafari) {
      return await fetchAndDownload(url, filename);
    }

    // Fallback untuk iOS dan Safari
    if (isIOS || isSafari) {
      return await iosSafariDownload(url, filename);
    }

    // Fallback untuk Android
    if (isAndroid) {
      return await androidDownload(url, filename);
    }

    // Fallback terakhir
    return await basicDownload(url, filename);
  } catch (error) {
    console.error('Download failed:', error);
    return await basicDownload(url, filename);
  }
};

/** ===================== METODE UTAMA ===================== **/
const fetchAndDownload = async (url: string, filename: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/octet-stream' }
    });

    if (!response.ok) throw new Error('Fetch failed');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);

    return true;
  } catch (error) {
    console.error('Fetch download failed:', error);
    throw error;
  }
};

/** ===================== METODE FALLBACK ===================== **/
const iosSafariDownload = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Metode 1: Membuka di tab baru (user harus manual tap-hold)
    const newWindow = window.open(url, '_blank');
    
    // Metode 2: Iframe sebagai fallback
    setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 200);

    showIOSInstructions(filename);
    return true;
  } catch (error) {
    console.error('iOS download failed:', error);
    throw error;
  }
};

const androidDownload = async (url: string, filename: string): Promise<boolean> => {
  try {
    // Coba metode fetch dulu
    try {
      return await fetchAndDownload(url, filename);
    } catch {
      // Fallback ke metode form submit
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = url;
      form.target = '_blank';
      form.style.display = 'none';
      document.body.appendChild(form);
      form.submit();
      setTimeout(() => document.body.removeChild(form), 1000);
      return true;
    }
  } catch (error) {
    console.error('Android download failed:', error);
    throw error;
  }
};

const basicDownload = async (url: string, filename: string): Promise<boolean> => {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
    return true;
  } catch (error) {
    console.error('Basic download failed:', error);
    window.open(url, '_blank');
    return false;
  }
};

/** ===================== UTILITAS ===================== **/
const showIOSInstructions = (filename: string) => {
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="text-align: center; padding: 10px;">
      <strong>Download ${filename}</strong><br>
      Tap <strong>Share</strong> icon → <strong>Save to Files</strong>
    </div>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #007AFF;
    color: white;
    padding: 10px 15px;
    border-radius: 10px;
    z-index: 10000;
    font-size: 14px;
    max-width: 80%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
};

export const createSafeFilename = (name: string, ext: string): string => {
  return `${name.replace(/[^a-zA-Z0-9\-_]/g, '').substring(0, 50)}.${ext}`;
};
