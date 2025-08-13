import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DownloadProvider } from './contexts/DownloadContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import TikTokPage from './pages/TikTokPage';
import FacebookPage from './pages/FacebookPage';
import XPage from './pages/XPage';
import YouTubePage from './pages/YouTubePage';
import InstagramPage from './pages/InstagramPage';
import Footer from './components/Footer';
import DownloadManager from './components/DownloadManager';
import SEOHead from './components/SEOHead';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading Video Downloader...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <DownloadProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500">
            <SEOHead />
            <Header />
            <main className="pt-20">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tiktok" element={<TikTokPage />} />
                <Route path="/facebook" element={<FacebookPage />} />
                <Route path="/x" element={<XPage />} />
                <Route path="/youtube" element={<YouTubePage />} />
                <Route path="/instagram" element={<InstagramPage />} />
              </Routes>
            </main>
            <Footer />
            <DownloadManager />
          </div>
        </Router>
      </DownloadProvider>
    </ThemeProvider>
  );
}

export default App;