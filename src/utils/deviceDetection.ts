// Device detection utilities for optimal download experience
export const detectDevice = () => {
  const userAgent = navigator.userAgent;
  
  return {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/i.test(userAgent),
    isSafari: /^((?!chrome|android).)*safari/i.test(userAgent),
    isChrome: /Chrome/i.test(userAgent),
    isFirefox: /Firefox/i.test(userAgent),
    isEdge: /Edge/i.test(userAgent),
    isIE: /MSIE|Trident/i.test(userAgent),
    isMac: /Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent),
    isWindows: /Win32|Win64|Windows|WinCE/i.test(userAgent),
    isLinux: /Linux/i.test(userAgent)
  };
};

export const getOptimalDownloadMethod = () => {
  const device = detectDevice();
  
  if (device.isIOS) {
    return 'ios-safari';
  } else if (device.isAndroid) {
    return 'android-chrome';
  } else if (device.isSafari) {
    return 'desktop-safari';
  } else if (device.isChrome) {
    return 'desktop-chrome';
  } else if (device.isFirefox) {
    return 'desktop-firefox';
  } else if (device.isEdge) {
    return 'desktop-edge';
  } else {
    return 'fallback';
  }
};

export const supportedFormats = {
  video: ['mp4', 'webm', 'avi', 'mov', 'mkv', '3gp'],
  audio: ['mp3', 'aac', 'm4a', 'wav', 'ogg']
};

export const getFileTypeFromUrl = (url: string): 'video' | 'audio' => {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (supportedFormats.audio.includes(extension || '')) {
    return 'audio';
  }
  
  return 'video';
};