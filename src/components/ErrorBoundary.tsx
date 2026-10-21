import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  onHome?: () => void;
};

type State = {
  error: Error | null;
};

/**
 * Keeps one broken lab from blanking the entire app. Also recovers from the
 * classic "old page + new deploy" chunk error by reloading once.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('Lab crashed:', error);

    const isChunkError = /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
      error.message || ''
    );
    if (isChunkError) {
      const key = 'cs0-chunk-reload';
      try {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
        }
      } catch {
        /* ignore */
      }
    }
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onHome?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="max-w-2xl mx-auto my-10 rounded-2xl border border-amber-500/40 bg-amber-950/30 p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-xl font-bold mb-2">This page hit an error</h2>
        <p className="text-sm text-gray-300 mb-4">
          Reloading usually fixes it — most often this happens right after an update, or when 3D
          graphics are unavailable on this device.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Reload page
          </button>
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg border border-gray-600 hover:border-gray-500 font-semibold"
          >
            <Home className="w-4 h-4" aria-hidden="true" /> Back home
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-500 break-words">{this.state.error.message}</p>
      </div>
    );
  }
}
