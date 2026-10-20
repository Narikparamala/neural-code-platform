import React from 'react';
import { Home, Compass } from 'lucide-react';

interface NotFoundProps {
  onHome: () => void;
}

export default function NotFound({ onHome }: NotFoundProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Compass className="w-16 h-16 text-purple-400 mb-4" />
      <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">404</p>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">This path doesn&apos;t exist</h1>
      <p className="text-gray-400 max-w-md mb-8">
        The page you asked for isn&apos;t part of CosmicSpirit0. The labs are still here though.
      </p>
      <button
        type="button"
        onClick={onHome}
        className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
      >
        <Home className="w-5 h-5" /> Back to home
      </button>
    </div>
  );
}
