import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Trash2, CheckCircle2, AlertCircle, Minimize2, Maximize2, Pause, Play } from 'lucide-react';
import { useDownload } from '../contexts/DownloadContext';

const DownloadManager = () => {
  const { downloads, removeDownload, clearCompleted } = useDownload();
  const [isMinimized, setIsMinimized] = useState(false);

  if (downloads.length === 0) return null;

  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'pending');
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const errorDownloads = downloads.filter(d => d.status === 'error');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0 || !isFinite(seconds)) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <h3 className="font-semibold">Download Manager</h3>
          <div className="flex items-center space-x-1">
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
              {downloads.length}
            </span>
            {activeDownloads.length > 0 && (
              <span className="bg-green-500/80 px-2 py-1 rounded-full text-xs">
                {activeDownloads.length} active
              </span>
            )}
            {errorDownloads.length > 0 && (
              <span className="bg-red-500/80 px-2 py-1 rounded-full text-xs">
                {errorDownloads.length} failed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          {completedDownloads.length > 0 && (
            <button
              onClick={clearCompleted}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Clear completed downloads"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="max-h-96 overflow-y-auto"
          >
            <div className="p-4 space-y-3">
              {downloads.map((download) => (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {download.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{download.platform}</span>
                        <span>•</span>
                        <span>{download.quality}</span>
                        <span>•</span>
                        <span className="uppercase">{download.extension}</span>
                        <span>•</span>
                        <span className="capitalize">{download.type}</span>
                        {download.author && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-20">{download.author}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDownload(download.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Enhanced Status with Real Progress */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {download.status === 'downloading' && (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Downloading... {download.progress}%
                          </span>
                        </>
                      )}
                      {download.status === 'completed' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Download completed
                          </span>
                        </>
                      )}
                      {download.status === 'error' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-600 dark:text-red-400">
                            Download failed
                          </span>
                        </>
                      )}
                      {download.status === 'pending' && (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Preparing...
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Download Stats */}
                    {download.status === 'downloading' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        {download.downloadSpeed && download.downloadSpeed > 0 && (
                          <div>{formatSpeed(download.downloadSpeed)}</div>
                        )}
                        {download.timeRemaining && download.timeRemaining > 0 && (
                          <div>ETA: {formatTime(download.timeRemaining)}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Progress Bar with Size Info */}
                  {(download.status === 'downloading' || download.status === 'pending') && (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${download.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {download.downloadedBytes && download.totalBytes 
                            ? `${formatBytes(download.downloadedBytes)} / ${formatBytes(download.totalBytes)}`
                            : `${download.progress}%`
                          }
                        </span>
                        <span>{download.progress}%</span>
                      </div>
                    </div>
                  )}

                  {download.status === 'completed' && (
                    <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full" />
                    </div>
                  )}

                  {download.status === 'error' && (
                    <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full w-full" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Bar when minimized */}
      {isMinimized && activeDownloads.length > 0 && (
        <div className="p-2 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {activeDownloads.length} downloading...
            </span>
            <div className="flex space-x-2">
              {activeDownloads.slice(0, 3).map((download) => (
                <div key={download.id} className="w-8 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${download.progress}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DownloadManager;