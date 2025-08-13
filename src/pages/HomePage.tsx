import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Zap, Shield, Smartphone, Globe, Heart } from 'lucide-react';

const HomePage = () => {
  const platforms = [
    {
      name: 'TikTok',
      path: '/tiktok',
      color: 'from-pink-500 to-rose-500',
      icon: '🎵',
      description: 'Download TikTok videos without watermark in HD quality'
    },
    {
      name: 'Facebook',
      path: '/facebook',
      color: 'from-blue-600 to-blue-700',
      icon: '📘',
      description: 'Save Facebook videos and reels in multiple formats'
    },
    {
      name: 'Instagram',
      path: '/instagram',
      color: 'from-pink-500 via-purple-500 to-orange-500',
      icon: '📷',
      description: 'Download Instagram videos, reels, and IGTV content'
    },
    {
      name: 'X (Twitter)',
      path: '/x',
      color: 'from-gray-800 to-black',
      icon: '🐦',
      description: 'Download X videos and GIFs in high quality'
    },
    {
      name: 'YouTube',
      path: '/youtube',
      color: 'from-red-600 to-red-700',
      icon: '📺',
      description: 'Download YouTube videos in MP4, MP3, and various qualities'
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Download videos in seconds with our optimized servers'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Safe & Secure',
      description: 'No malware, no ads, completely safe to use'
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile Friendly',
      description: 'Works perfectly on all devices and screen sizes'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'No Registration',
      description: 'Start downloading immediately, no account needed'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Download Videos from
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Any Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Free online video downloader supporting TikTok, YouTube, Facebook, and X (Twitter). 
              High quality downloads, no watermarks, unlimited use.
            </p>
          </motion.div>

          {/* Platform Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
          >
            {platforms.map((platform, index) => (
              <Link
                key={platform.name}
                to={platform.path}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-8 rounded-2xl bg-gradient-to-br ${platform.color} text-white shadow-xl overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="relative z-10">
                    <div className="text-4xl mb-4">{platform.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{platform.name}</h3>
                    <p className="text-white/80 text-sm">{platform.description}</p>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Downloader?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide the fastest, safest, and most reliable video downloading experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-white/80 dark:bg-gray-700/50 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full" />
            </div>
            <div className="relative z-10">
              <Download className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Start Downloading Now
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join millions of users who trust our platform for their video downloads
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {platforms.slice(0, 2).map((platform) => (
                  <Link
                    key={platform.name}
                    to={platform.path}
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    <span className="mr-2">{platform.icon}</span>
                    Download from {platform.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;