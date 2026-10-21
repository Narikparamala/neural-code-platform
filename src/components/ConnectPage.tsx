import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Instagram, MessageCircle, Youtube, Music2 } from 'lucide-react';
import StoryWall from './StoryWall';
import { useSiteSettings } from '../lib/siteSettings';

const ConnectPage: React.FC = () => {
  const settings = useSiteSettings();

  const socialLinks = [
    {
      name: 'Instagram',
      handle: '@cosmicspirit0official',
      url: settings.instagram_url,
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      description: 'Short visual notes, session clips and behind-the-scenes updates'
    },
    {
      name: 'Telegram',
      handle: '@cs0telegram',
      url: settings.telegram_url,
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-600',
      description: 'Chat with other listeners and get new-lab announcements'
    },
    {
      name: 'YouTube',
      handle: '@cosmicspirit0',
      url: settings.youtube_url,
      icon: Youtube,
      color: 'from-red-500 to-pink-600',
      description: 'Walkthroughs, build logs and short explainers on sound and attention'
    },
    {
      name: 'TikTok',
      handle: '@cosmicspirit0',
      url: settings.tiktok_url,
      icon: Music2,
      color: 'from-slate-700 to-slate-900',
      description: '60-second experiments and quick explanations'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <img 
            src={settings.logo_url} 
            alt="CosmicSpirit0 logo" 
            width={64}
            height={64}
            className="w-16 h-16 rounded-full"
          />
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Connect with CosmicSpirit
          </h1>
        </div>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Follow updates, share what you notice, and read what other listeners experienced.
          No account needed.
        </p>
      </motion.div>

      {/* Social Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {socialLinks.map((link, index) => (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`block p-6 rounded-xl bg-gradient-to-br ${link.color} text-white shadow-2xl hover:shadow-3xl transition-all`}
          >
            <div className="flex items-center gap-3 mb-4">
              <link.icon className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">{link.name}</h3>
                <p className="text-sm opacity-90">{link.handle}</p>
              </div>
              <ExternalLink className="w-5 h-5 ml-auto opacity-70" />
            </div>
            <p className="text-sm opacity-90">{link.description}</p>
          </motion.a>
        ))}
      </div>

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Built to stay free</h2>
        <p className="text-center text-sm text-gray-400 mb-8">
          No inflated numbers. These are the real terms of the platform.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-2">4</div>
            <div className="text-gray-400">Labs live</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">$0</div>
            <div className="text-gray-400">Forever free</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-2">0</div>
            <div className="text-gray-400">Signups needed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">100%</div>
            <div className="text-gray-400">Audio generated in-browser</div>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/30 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Explore with us</h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Pick a platform below. Session audio never leaves your browser and stories are published
          only after review.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-purple-600/20 rounded-full text-sm">Open source</span>
          <span className="px-4 py-2 bg-blue-600/20 rounded-full text-sm">No account needed</span>
          <span className="px-4 py-2 bg-green-600/20 rounded-full text-sm">Moderated stories</span>
          <span className="px-4 py-2 bg-yellow-600/20 rounded-full text-sm">Free to use</span>
        </div>
      </motion.div>

      <StoryWall />
    </div>
  );
};

export default ConnectPage;