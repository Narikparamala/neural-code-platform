import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Brain, Play, RotateCcw, Timer, Target } from 'lucide-react';
import { SessionShareButton, SessionSavedNote, useSessionRecorder } from './SessionShare';

interface PopulationLabProps {
  onSessionUpdate: (data: any) => void;
}

type Side = 'left' | 'right';

const ROUND_SECONDS = 60;

const PopulationLab: React.FC<PopulationLabProps> = ({ onSessionUpdate }) => {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState<Side | null>(null);
  const [pressed, setPressed] = useState<Side | null>(null);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef<number | null>(null);

  // countdown
  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timerRef.current as number);
          setRunning(false);
          setFinished(true);
          setTarget(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [running]);

  // keep the best score up to date
  useEffect(() => {
    if (score > best) setBest(score);
    onSessionUpdate?.({ lab: 'game', score, hits, misses, timeLeft });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, timeLeft]);

  const pickTarget = (current: Side | null): Side =>
    current === 'left' ? 'right' : current === 'right' ? 'left' : Math.random() > 0.5 ? 'left' : 'right';

  const start = () => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setTimeLeft(ROUND_SECONDS);
    setFinished(false);
    setRunning(true);
    setTarget(pickTarget(null));
  };

  const handleHit = (side: Side) => {
    if (!running) return;
    setPressed(side);
    window.setTimeout(() => setPressed(null), 140);

    if (side === target) {
      setScore((s) => s + 1);
      setHits((h) => h + 1);
      setTarget(pickTarget(side));
    } else {
      setMisses((m) => m + 1);
      setScore((s) => Math.max(0, s - 1));
    }
  };

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
  const progress = ((ROUND_SECONDS - timeLeft) / ROUND_SECONDS) * 100;

  const lastSession = useSessionRecorder({
    lab: 'game',
    playing: running,
    details: { score, hits, misses, accuracy },
  });

  const clusterClass = (side: Side) => {
    const isTarget = running && target === side;
    const isPressed = pressed === side;
    const base =
      'relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center cursor-pointer transition-all select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/60';
    if (!running) return `${base} bg-gray-700/40 opacity-70 cursor-default`;
    if (isPressed) return `${base} scale-95 ${side === 'left' ? 'bg-purple-400' : 'bg-pink-400'} shadow-2xl`;
    if (isTarget)
      return `${base} ${side === 'left' ? 'bg-purple-500/70 shadow-purple-500/40' : 'bg-pink-500/70 shadow-pink-500/40'} shadow-2xl animate-pulse`;
    return `${base} bg-gray-700/50 hover:bg-gray-600/60`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Game Lab &mdash; Neural Cluster Dynamics
          </h1>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Neural Training Games</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Two neural clusters. One lights up at a time. Hit the active cluster before it switches &mdash;
            60 seconds to score as high as you can. Wrong taps cost a point.
          </p>

          {/* HUD */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto mb-6">
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Target className="w-3 h-3" /> Score
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">{score}</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Timer className="w-3 h-3" /> Time
              </div>
              <div className={`text-2xl sm:text-3xl font-bold ${timeLeft <= 10 && running ? 'text-red-400' : 'text-cyan-400'}`}>
                0:{String(timeLeft).padStart(2, '0')}
              </div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-xs text-gray-400">Best</div>
              <div className="text-2xl sm:text-3xl font-bold text-pink-400">{best}</div>
            </div>
          </div>

          {/* timer bar */}
          <div className="h-2 w-full max-w-xl mx-auto bg-gray-700 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="min-h-[22rem] bg-gray-900/50 rounded-lg flex items-center justify-center p-4">
            <div className="text-center w-full">
              <div className="flex flex-wrap gap-6 sm:gap-12 justify-center mb-8">
                <button
                  type="button"
                  aria-label="Activate left neural cluster"
                  aria-pressed={pressed === 'left'}
                  onClick={() => handleHit('left')}
                  className={clusterClass('left')}
                >
                  <Brain className={`w-14 h-14 sm:w-20 sm:h-20 ${running && target === 'left' ? 'text-white' : 'text-purple-400'}`} />
                  {running && target === 'left' && (
                    <span className="absolute -bottom-6 text-xs font-semibold text-purple-300">TAP</span>
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Activate right neural cluster"
                  aria-pressed={pressed === 'right'}
                  onClick={() => handleHit('right')}
                  className={clusterClass('right')}
                >
                  <Brain className={`w-14 h-14 sm:w-20 sm:h-20 ${running && target === 'right' ? 'text-white' : 'text-pink-400'}`} />
                  {running && target === 'right' && (
                    <span className="absolute -bottom-6 text-xs font-semibold text-pink-300">TAP</span>
                  )}
                </button>
              </div>

              {!running && !finished && (
                <div className="space-y-3">
                  <p className="text-gray-300">Ready for a 60-second attention round?</p>
                  <button
                    type="button"
                    onClick={start}
                    className="inline-flex items-center gap-2 px-8 py-4 min-h-[44px] bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                  >
                    <Play className="w-5 h-5" /> Start round
                  </button>
                </div>
              )}

              {running && (
                <p className="text-gray-400 text-sm">
                  Hit the glowing cluster &middot; {hits} hits &middot; {misses} misses
                </p>
              )}

              {finished && (
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-purple-300">
                    Round complete &mdash; {score} points
                  </p>
                  <p className="text-gray-300 text-sm">
                    Accuracy {accuracy}% &middot; {hits} hits &middot; {misses} misses
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={start}
                      className="inline-flex items-center gap-2 px-8 py-4 min-h-[44px] bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" /> Play again
                    </button>
                    <SessionShareButton
                      payload={{
                        kind: 'session',
                        badge: 'Game Lab round',
                        title: `${score} points`,
                        subtitle: `${accuracy}% accuracy · 60-second attention round`,
                        stats: [
                          { label: 'Score', value: String(score) },
                          { label: 'Accuracy', value: `${accuracy}%` },
                          { label: 'Hits', value: String(hits) },
                          { label: 'Misses', value: String(misses) },
                        ],
                        caption: `I scored ${score} points with ${accuracy}% accuracy in the CosmicSpirit0 Game Lab.`,
                      }}
                    />
                  </div>
                  <SessionSavedNote last={lastSession} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Score = hits minus misses. This is a simple reaction task, not a measure of attention or
              brain activity.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PopulationLab;
