import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, AlertCircle, CheckCircle2, Copy, ExternalLink, Play, Music, FileVideo, Clock, Eye, Heart } from 'lucide-react';
import { useDownload } from '../contexts/DownloadContext';

interface VideoDownloaderProps {
  title: string;
  description: string;
  placeholder: string;
  platform: string;
  platformIcon: string;
  platformColor: string;
  url: string;
  setUrl: (url: string) => void;
  isLoading: boolean;
  videoData: any;
  error: string;
  onDownload: () => void;
  onDownloadFile: (downloadUrl: any) => void;
  keywords: string[];
  features: string[];
}

const VideoDownloader: React.FC<VideoDownloaderProps> = ({
  title,
  description,
  placeholder,
  platform,
  platformIcon,
  platformColor,
  url,
  setUrl,
  isLoading,
  videoData,
  error,
  onDownload,
  onDownloadFile,
  keywords,
  features
}) => {
  const { isDuplicateDownload } = useDownload();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
    const toast = document.createElement('div');
    toast.textContent = 'URL copied to clipboard!';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: 500;
    `;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  const handleDownloadClick = (downloadUrl: any) => {
    // iOS direct download handling
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    
    if (isIOS) {
      // For iOS, show success message
      const toast = document.createElement('div');
      toast.innerHTML = `
        <div style="text-align: left;">
          <div style="font-weight: bold; margin-bottom: 8px;">✅ iOS Download Started</div>
          <div style="font-size: 14px; line-height: 1.4;">
            Download started automatically!<br>
            Check your Downloads folder<br>
            or Files app → Downloads
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
      }, 4000);
    }
    
    onDownloadFile(downloadUrl);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${platformColor} rounded-2xl text-white text-2xl mb-6`}>
            {platformIcon}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === 'Enter' && onDownload()}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownload}
              disabled={isLoading}
              className={`px-8 py-4 bg-gradient-to-r ${platformColor} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Processing...' : 'Download'}</span>
            </motion.button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2 text-red-700 dark:text-red-400"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Video Information & Download Options */}
        <AnimatePresence>
          {videoData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-6"
            >
              {/* Video Info Card */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  {videoData.detail?.thumbnail && (
                    <div className="flex-shrink-0">
                      <img
                        src={videoData.detail.thumbnail}
                        alt="Video thumbnail"
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Video Details */}
                  <div className="flex-1 space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {videoData.detail?.title || 'Video'}
                    </h2>
                    {videoData.detail?.author && (
                      <p className="text-gray-600 dark:text-gray-400">
                        By: {videoData.detail.author}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {videoData.detail?.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(videoData.detail.duration)}</span>
                        </div>
                      )}
                      {videoData.detail?.view_count && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{videoData.detail.view_count.toLocaleString()} views</span>
                        </div>
                      )}
                      {videoData.detail?.like_count && (
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{videoData.detail.like_count.toLocaleString()} likes</span>
                        </div>
                      )}
                      {videoData.detail?.owner?.edge_followed_by?.count && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">👥</span>
                          <span>{videoData.detail.owner.edge_followed_by.count.toLocaleString()} followers</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Download Options
                </h3>

                <div className="space-y-3">
                  {videoData.downloadUrls?.map((downloadUrl: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors gap-4"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${downloadUrl.type === 'audio' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          {downloadUrl.type === 'audio' ? (
                            <Music className={`w-5 h-5 ${downloadUrl.type === 'audio' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                          ) : (
                            <FileVideo className={`w-5 h-5 ${downloadUrl.type === 'audio' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {downloadUrl.label || downloadUrl.quality || `${downloadUrl.type} - ${downloadUrl.extension?.toUpperCase()}`}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="capitalize">{downloadUrl.type}</span>
                            <span>•</span>
                            <span className="uppercase">{downloadUrl.extension || downloadUrl.ext}</span>
                            {downloadUrl.data_size && (
                              <>
                                <span>•</span>
                                <span>{formatFileSize(downloadUrl.data_size)}</span>
                              </>
                            )}
                            {downloadUrl.width && downloadUrl.height && (
                              <>
                                <span>•</span>
                                <span>{downloadUrl.width}x{downloadUrl.height}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(downloadUrl.url)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownloadClick(downloadUrl)}
                          className={`px-4 py-2 bg-gradient-to-r ${platformColor} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 whitespace-nowrap`}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features & Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Features */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {platform} Downloader Features
            </h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SEO Keywords */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Popular Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoDownloader;