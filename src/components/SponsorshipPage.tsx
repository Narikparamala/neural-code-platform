import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Zap, Users, Target, ExternalLink, Copy, Check } from 'lucide-react';

const SponsorshipPage: React.FC = () => {
  const [copiedPayPal, setCopiedPayPal] = useState(false);

  const projectFeatures = [
    {
      icon: Brain,
      title: 'Advanced Neural Technology',
      description: 'Cutting-edge brainwave entrainment using binaural beats, isochronic tones, and spatial audio'
    },
    {
      icon: Zap,
      title: 'Real-time Monitoring',
      description: 'Live frequency analysis and session tracking with AI-powered insights'
    },
    {
      icon: Target,
      title: 'Personalized Training',
      description: 'Customizable frequency protocols tailored to individual consciousness exploration goals'
    },
    {
      icon: Users,
      title: 'Open Source & Free',
      description: 'Completely free platform dedicated to advancing human consciousness research'
    }
  ];

  const sponsorshipTiers = [
    {
      name: 'Consciousness Explorer',
      amount: '$5-25',
      benefits: ['Support development', 'Early access to features', 'Community recognition']
    },
    {
      name: 'Neural Researcher',
      amount: '$25-100',
      benefits: ['All Explorer benefits', 'Priority support', 'Feature requests', 'Beta testing access']
    },
    {
      name: 'Cosmic Patron',
      amount: '$100+',
      benefits: ['All Researcher benefits', 'Direct developer contact', 'Custom feature development', 'Project roadmap input']
    }
  ];

  const copyPayPalLink = () => {
    navigator.clipboard.writeText('paypal.me/ParamalaKiran');
    setCopiedPayPal(true);
    setTimeout(() => setCopiedPayPal(false), 2000);
  };

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
          <Heart className="w-12 h-12 text-red-400" />
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Support Our Mission
          </h1>
        </div>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Help us advance consciousness research and neural technology. Your support enables us to keep this 
          platform free and continuously improve the tools for exploring human potential.
        </p>
      </motion.div>

      {/* Project Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Why This Project Matters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg"
            >
              <feature.icon className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sponsorship Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sponsorship Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sponsorshipTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors"
            >
              <h3 className="text-xl font-bold mb-2 text-purple-400">{tier.name}</h3>
              <div className="text-2xl font-bold mb-4">{tier.amount}</div>
              <ul className="space-y-2">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/30"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Support Us Today</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PhonePe QR Code */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <span>PhonePe / UPI</span>
            </h3>
            <div className="bg-white p-4 rounded-lg inline-block">
              <img 
                src="https://res.cloudinary.com/doourcehz/image/upload/w_400,h_400,c_fit,f_webp,q_auto/v1762696930/IMG_20251109_193025_hprtai.png" 
                alt="PhonePe QR Code" 
                width={192}
                height={192}
                loading="lazy"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">Scan QR code with any UPI app</p>
          </div>

          {/* PayPal */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">PayPal</h3>
            <div className="space-y-4">
              <a
                href="https://paypal.me/ParamalaKiran"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                paypal.me/ParamalaKiran
              </a>
              <div className="flex items-center justify-center gap-2">
                <code className="px-3 py-2 bg-gray-700 rounded text-sm">paypal.me/ParamalaKiran</code>
                <button
                  onClick={copyPayPalLink}
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                  title="Copy PayPal link"
                >
                  {copiedPayPal ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-300 mb-4">
            Every contribution, no matter the size, helps us continue developing this free platform 
            for consciousness exploration and neural research.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-green-600/20 rounded-full">100% Open Source</span>
            <span className="px-3 py-1 bg-blue-600/20 rounded-full">No Ads</span>
            <span className="px-3 py-1 bg-purple-600/20 rounded-full">Community Driven</span>
            <span className="px-3 py-1 bg-yellow-600/20 rounded-full">Research Focused</span>
          </div>
        </div>
      </motion.div>

      {/* Thank You Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center bg-gray-800/30 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold mb-3">Thank You for Your Support! 🙏</h2>
        <p className="text-gray-300">
          Your contribution directly supports the development of advanced consciousness exploration tools 
          and helps keep this platform free for everyone interested in neural research and personal development.
        </p>
      </motion.div>
    </div>
  );
};

export default SponsorshipPage;