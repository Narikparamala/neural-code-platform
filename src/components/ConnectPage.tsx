import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Instagram, MessageCircle, Youtube } from 'lucide-react';

const ConnectPage: React.FC = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      handle: '@cosmicspirit0official',
      url: 'https://instagram.com/cosmicspirit0official',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      description: 'Follow us for daily consciousness insights and neural training tips'
    },
    {
      name: 'Telegram',
      handle: '@cs0telegram',
      url: 'https://t.me/cs0telegram',
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-600',
      description: 'Join our community for real-time discussions and support'
    },
    {
      name: 'YouTube',
      handle: '@cosmicspirit0',
      url: 'https://www.youtube.com/@cosmicspirit0',
      icon: Youtube,
      color: 'from-red-500 to-pink-600',
      description: 'Watch tutorials, research updates, and consciousness exploration guides'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <img 
            src="https://res.cloudinary.com/doourcehz/image/upload/w_128,h_128,c_fill,f_webp,q_auto/v1762704996/download_1_t0xokx.jpg" 
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
          Join our growing community of consciousness explorers and neural researchers. 
          Stay updated with the latest developments in brainwave entrainment technology.
        </p>
      </motion.div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <h2 className="text-2xl font-bold mb-6 text-center">Join Our Growing Community</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-2">1000+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
            <div className="text-gray-400">Sessions Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-gray-400">Community Support</div>
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
        <h2 className="text-2xl font-bold mb-4">Ready to Explore Consciousness?</h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Connect with us on your preferred platform and become part of a community dedicated to 
          advancing human consciousness through cutting-edge neural technology.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-purple-600/20 rounded-full text-sm">Neural Research</span>
          <span className="px-4 py-2 bg-blue-600/20 rounded-full text-sm">Consciousness Exploration</span>
          <span className="px-4 py-2 bg-green-600/20 rounded-full text-sm">Community Support</span>
          <span className="px-4 py-2 bg-yellow-600/20 rounded-full text-sm">Advanced Technology</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectPage;