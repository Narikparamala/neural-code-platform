import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Zap, Users, Target, ExternalLink, Copy, Check } from 'lucide-react';
import { useSiteSettings } from '../lib/siteSettings';
import SponsorLeadForm from './SponsorLeadForm';

const SponsorshipPage: React.FC<{ onNavigate?: (lab: string) => void }> = ({ onNavigate }) => {
  const settings = useSiteSettings();

  // paypal.me supports preset one-time amounts: paypal.me/<user>/<amount>USD
  const supportHref = (usd?: number) => {
    const base = (settings.support_url || '').replace(/\/$/, '');
    if (usd && base.includes('paypal.me')) return `${base}/${usd}USD`;
    return base;
  };
  const supportLabel = settings.support_url.replace(/^https?:\/\//, '').replace(/\/$/, '');
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
      description: 'Plain-language research notes explain what each signal is and what the evidence does and does not show. No “unlock your brain” claims.'
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
      usd: 3,
      benefits: ['Keeps hosting and maintenance running', 'Supporter wall (only with permission)', 'Cancel any time']
    },
    {
      name: 'Explorer',
      amount: '$10 / month',
      usd: 10,
      benefits: ['All Listener benefits', 'Early preset packs', 'Monthly research notes with sources']
    },
    {
      name: 'Patron',
      amount: '$25 / month',
      usd: 25,
      benefits: ['All Explorer benefits', 'Behind-the-scenes build log', 'Quarterly community listening session']
    }
  ];

  const sponsorPackages = [
    {
      name: 'Community Sponsor',
      price: 'From $100 / month',
      points: [
        'Logo + link on the sponsor page (live in 1–3 days)',
        'One newsletter mention to confirmed subscribers',
        'Acknowledgement in one monthly build log',
        'Monthly numbers report — what we can actually measure'
      ]
    },
    {
      name: 'Lab Sponsor',
      price: 'From $250 / month',
      points: [
        'Everything in Community',
        '“Supported by” line inside one lab',
        'Co-created preset pack, clearly labelled',
        'Educational write-up, brand checked for factual accuracy only'
      ]
    },
    {
      name: 'Research / Education Partner',
      price: 'Project based',
      points: [
        'Support for an evidence summary or open dataset',
        'Public acknowledgement in the finished write-up',
        'Methodology and limitations published in full',
        'No control over findings or conclusions'
      ]
    }
  ];

  const deliverables = [
    { label: 'Logo + link on the sponsor page', community: true, lab: true, research: true },
    { label: 'One newsletter mention to confirmed subscribers', community: true, lab: true, research: false },
    { label: 'Acknowledgement in a monthly build log', community: true, lab: true, research: true },
    { label: '“Supported by” line inside one lab', community: false, lab: true, research: false },
    { label: 'Co-created preset pack, labelled as sponsored', community: false, lab: true, research: false },
    { label: 'Educational write-up (brand reviews accuracy only)', community: false, lab: true, research: true },
    { label: 'Public acknowledgement in research notes', community: false, lab: false, research: true },
    { label: 'Monthly numbers report (real counts, no estimates)', community: true, lab: true, research: true },
    { label: 'Renew or stop at day 30 — no lock-in', community: true, lab: true, research: true }
  ];

  const timeline = [
    {
      when: 'Day 0',
      what: 'Payment or invoice is agreed, we confirm the exact placement, and you send a logo file plus the destination URL.'
    },
    {
      when: '1–3 business days',
      what: 'Your logo, link or “Supported by” line goes live. You get the live URL and a screenshot.'
    },
    {
      when: 'First send after signup',
      what: 'The newsletter mention goes out (Community and Lab). Only to people who confirmed by email.'
    },
    {
      when: 'Monthly, by the 5th',
      what: 'A one-page report with confirmed subscribers, emails sent, published stories, approved reviews and ideas. Nothing is estimated or invented.'
    },
    {
      when: 'Day 30',
      what: 'Renew, change package, or stop. No cancellation fee and no long contract.'
    }
  ];

  const boundaries = [
    'No control over findings, moderation or safety notes.',
    'No access to the subscriber list or anyone’s email address.',
    'No ads or sponsor audio inside an active listening session.',
    'No health, medical or performance claims, and no implied endorsement.'
  ];

  const copyPayPalLink = () => {
    navigator.clipboard.writeText(settings.support_url);
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
              <a
                href={supportHref(tier.usd)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 w-full min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold text-sm"
              >
                <Heart className="w-4 h-4" aria-hidden="true" /> Give ${tier.usd} (one-time)
              </a>
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
        <p className="text-xs text-gray-500 text-center mt-4 max-w-2xl mx-auto">
          Tiers are monthly targets. Buttons send a one-time amount today; if you want a recurring
          invoice, use the form below or email and we will set it up manually.
        </p>
        <div className="text-center mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('deck')}
            className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold text-sm"
          >
            Open the one-page sponsor deck
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </button>
          <a
            href="mailto:narikparamala@gmail.com?subject=CosmicSpirit0%20sponsorship"
            className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-lg border border-gray-600 hover:border-gray-500 font-semibold text-sm"
          >
            Email instead
          </a>
        </div>
      </motion.div>

      {/* What sponsors get */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.52 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-700"
        id="sponsor-deliverables"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">What sponsors actually get</h2>
        <p className="text-center text-sm text-gray-400 mb-6 max-w-2xl mx-auto">
          This is the complete inventory — what goes live, when, and how it is measured. No impression
          inflation and no vanity metrics.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-600 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="py-3 pr-4 font-semibold">Deliverable</th>
                <th className="py-3 px-3 font-semibold text-center">Community<br /><span className="normal-case font-normal">$100+/mo</span></th>
                <th className="py-3 px-3 font-semibold text-center">Lab<br /><span className="normal-case font-normal">$250+/mo</span></th>
                <th className="py-3 pl-3 font-semibold text-center">Research<br /><span className="normal-case font-normal">project-based</span></th>
              </tr>
            </thead>
            <tbody>
              {deliverables.map((row) => (
                <tr key={row.label} className="border-b border-gray-700/60 last:border-0">
                  <td className="py-3 pr-4 text-gray-200">{row.label}</td>
                  {[row.community, row.lab, row.research].map((included, i) => (
                    <td key={i} className="py-3 px-3 text-center">
                      {included ? (
                        <Check className="w-5 h-5 text-green-400 inline" aria-label="Included" />
                      ) : (
                        <span className="text-gray-600" aria-label="Not included">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Packages are monthly unless marked project-based. One-time support is welcome and treated
          with the same honesty, but placements need a monthly commitment to stay live.
        </p>

        <h3 className="text-lg font-semibold mt-8 mb-3">Fulfilment timeline</h3>
        <ol className="space-y-3">
          {timeline.map((step, i) => (
            <li key={step.when} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-purple-200">{step.when}</div>
                <p className="text-sm text-gray-300">{step.what}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-900/40 rounded-lg p-5 border border-gray-700/70">
            <h3 className="font-semibold mb-2">How the numbers are measured</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Confirmed subscribers and emails sent/failed: straight from the database and the sender log.</li>
              <li>• Stories, approved reviews and ideas: counted from moderation tables.</li>
              <li>• Link clicks: only if we add a click counter. We will say “not tracked” until then.</li>
              <li>• Not tracked: individual listening sessions, personal data, ad impressions, or pixels.</li>
            </ul>
          </div>
          <div className="bg-gray-900/40 rounded-lg p-5 border border-gray-700/70">
            <h3 className="font-semibold mb-2">What sponsors never get</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              {boundaries.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-red-400" aria-hidden="true">×</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-5">
          Reality check: this is an early-stage project. Numbers may be small. The report will show
          that, because a sponsor who stays after seeing real numbers is worth more than one sold on
          fiction.
        </p>
      </motion.div>

      {/* Lead form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <SponsorLeadForm />
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/30"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Ways to give</h2>
        
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
                href={settings.support_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                {supportLabel}
              </a>
              <div className="flex items-center justify-center gap-2">
                <code className="px-3 py-2 bg-gray-700 rounded text-sm">{supportLabel}</code>
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
            Every contribution, no matter the size, keeps hosting and maintenance paid and the site
            free for everyone.
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
        <h2 className="text-xl font-bold mb-3">Thank you for supporting the project</h2>
        <p className="text-gray-300">
          Your contribution goes toward hosting, audio assets, accessibility fixes and the time it
          takes to keep the research notes accurate. It never buys influence over findings.
        </p>
      </motion.div>
    </div>
  );
};

export default SponsorshipPage;