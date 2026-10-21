import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Zap, Users, Target, ExternalLink, Copy, Check } from 'lucide-react';

const SponsorshipPage: React.FC = () => {
  const [copiedPayPal, setCopiedPayPal] = useState(false);

  const projectFeatures = [
    {
      icon: Brain,
      title: 'Open audio experiments',
      description: 'Binaural beats, isochronic tones and spatial audio, generated live in the browser with no account and no upload.'
    },
    {
      icon: Zap,
      title: 'Honest labelling',
      description: 'Every lab states what the signal is and what the evidence does and does not show. No “unlock your brain” claims.'
    },
    {
      icon: Target,
      title: 'A real practice loop',
      description: 'Guided sessions, attention games, self-ratings and a public idea board that shapes what gets built next.'
    },
    {
      icon: Users,
      title: 'Free and open source',
      description: 'The code and the running costs are public. Community submissions are moderated by a named maintainer.'
    }
  ];

  const sponsorshipTiers = [
    {
      name: 'Listener',
      amount: '$3 / month',
      benefits: ['Keeps hosting and maintenance running', 'Supporter wall (only with permission)', 'Cancel any time']
    },
    {
      name: 'Explorer',
      amount: '$10 / month',
      benefits: ['All Listener benefits', 'Early preset packs', 'Monthly research notes with sources']
    },
    {
      name: 'Patron',
      amount: '$25 / month',
      benefits: ['All Explorer benefits', 'Behind-the-scenes build log', 'Quarterly community listening session']
    }
  ];

  const sponsorPackages = [
    {
      name: 'Community Sponsor',
      price: 'From $100 / month',
      points: [
        'Logo on the sponsor page',
        'One mention in the newsletter',
        'Support for one monthly community experiment',
        'Monthly performance report with real numbers'
      ]
    },
    {
      name: 'Lab Sponsor',
      price: 'From $250 / month',
      points: [
        '“Supported by” attribution inside one lab',
        'Co-created preset collection, clearly labelled',
        'Branded educational content, separated from findings',
        'Launch announcement and analytics report'
      ]
    },
    {
      name: 'Research / Education Partner',
      price: 'Project based',
      points: [
        'Support for evidence summaries or open datasets',
        'No control over results or conclusions',
        'Public methodology and limitations',
        'Sponsor kept separate from scientific claims'
      ]
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
            Support open sound exploration
          </h1>
        </div>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          CosmicSpirit0 is free and stays free. Contributions pay for hosting, accessibility work,
          audio assets and the time it takes to keep the evidence honest. No locked safety information,
          no artificial urgency.
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
        <h2 className="text-2xl font-bold mb-6 text-center">Support tiers</h2>
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

      {/* Sponsor packages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
        id="sponsor-packages"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Sponsor packages</h2>
        <p className="text-center text-sm text-gray-400 mb-6 max-w-2xl mx-auto">
          For brands and creators. Every package is clearly labelled, measured with real numbers, and
          never placed inside an active listening session.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sponsorPackages.map((pkg) => (
            <div
              key={pkg.name}
              className="p-6 rounded-xl border border-purple-500/30 bg-purple-900/10"
            >
              <h3 className="text-lg font-bold text-purple-300">{pkg.name}</h3>
              <div className="text-sm text-gray-400 mb-3">{pkg.price}</div>
              <ul className="space-y-2">
                {pkg.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <a
            href="mailto:narikparamala@gmail.com?subject=CosmicSpirit0%20sponsorship"
            className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold text-sm"
          >
            Request the one-page sponsor deck
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
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