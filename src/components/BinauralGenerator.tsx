import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface BinauralGeneratorProps {
  baseFreq: number;
  deltaFreq: number;
  audioMode: 'binaural' | 'isochronic' | 'mono';
  leftEarEnabled: boolean;
  rightEarEnabled: boolean;
  beatPatternEnabled: boolean;
}

type NodeRefs = {
  left?: OscillatorNode;
  right?: OscillatorNode;
  mono?: OscillatorNode;
  carrier?: OscillatorNode;
  lfo?: OscillatorNode;
  leftGain?: GainNode;
  rightGain?: GainNode;
  monoGain?: GainNode;
  isoGain?: GainNode;
  lfoDepth?: GainNode;
};

const BinauralGenerator = forwardRef<any, BinauralGeneratorProps>(
  (props, ref) => {
    const { baseFreq, deltaFreq, audioMode, leftEarEnabled, rightEarEnabled, beatPatternEnabled } = props;
    const ctxRef = useRef<AudioContext | null>(null);
    const isPlayingRef = useRef(false);
    const nodesRef = useRef<OscillatorNode[]>([]);
    const partsRef = useRef<AudioNode[]>([]);
    const refs = useRef<NodeRefs>({});
    const propsRef = useRef(props);
    propsRef.current = props;

    const clearGraph = () => {
      nodesRef.current.forEach((node) => {
        try {
          node.stop();
        } catch {
          /* already stopped */
        }
        try {
          node.disconnect();
        } catch {
          /* already detached */
        }
      });
      partsRef.current.forEach((node) => {
        try {
          node.disconnect();
        } catch {
          /* already detached */
        }
      });
      nodesRef.current = [];
      partsRef.current = [];
      refs.current = {};
    };

    const buildGraph = () => {
      const p = propsRef.current;
      let ctx = ctxRef.current;
      if (!ctx || ctx.state === 'closed') {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ctxRef.current = ctx;
      }
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const dest = ctx.destination;

      if (p.audioMode === 'binaural') {
        const left = ctx.createOscillator();
        const right = ctx.createOscillator();
        const leftGain = ctx.createGain();
        const rightGain = ctx.createGain();
        const leftPan = ctx.createStereoPanner();
        const rightPan = ctx.createStereoPanner();

        left.frequency.value = p.baseFreq;
        right.frequency.value = p.baseFreq + (p.beatPatternEnabled ? p.deltaFreq : 0);
        leftGain.gain.value = p.leftEarEnabled ? 0.1 : 0;
        rightGain.gain.value = p.rightEarEnabled ? 0.1 : 0;
        leftPan.pan.value = -1;
        rightPan.pan.value = 1;

        left.connect(leftGain).connect(leftPan).connect(dest);
        right.connect(rightGain).connect(rightPan).connect(dest);
        left.start();
        right.start();

        nodesRef.current.push(left, right);
        partsRef.current.push(leftGain, rightGain, leftPan, rightPan);
        refs.current = { left, right, leftGain, rightGain };
        return;
      }

      if (p.audioMode === 'isochronic') {
        const carrier = ctx.createOscillator();
        const isoGain = ctx.createGain();
        carrier.frequency.value = p.baseFreq;

        if (p.beatPatternEnabled) {
          const lfo = ctx.createOscillator();
          const lfoDepth = ctx.createGain();
          lfo.type = 'square';
          lfo.frequency.value = Math.max(0.1, p.deltaFreq);
          // Oscillate the carrier between silence and full gain without
          // touching any volume parameter.
          isoGain.gain.value = 0.05;
          lfoDepth.gain.value = 0.05;
          lfo.connect(lfoDepth).connect(isoGain.gain);
          lfo.start();
          nodesRef.current.push(lfo);
          partsRef.current.push(lfoDepth);
          refs.current.lfo = lfo;
          refs.current.lfoDepth = lfoDepth;
        } else {
          isoGain.gain.value = 0.1;
        }

        carrier.connect(isoGain).connect(dest);
        carrier.start();
        nodesRef.current.push(carrier);
        partsRef.current.push(isoGain);
        refs.current.carrier = carrier;
        refs.current.isoGain = isoGain;
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = p.deltaFreq;
      gain.gain.value = p.leftEarEnabled || p.rightEarEnabled ? 0.1 : 0;
      osc.connect(gain).connect(dest);
      osc.start();
      nodesRef.current.push(osc);
      partsRef.current.push(gain);
      refs.current = { mono: osc, monoGain: gain };
    };

    const start = () => {
      if (isPlayingRef.current) return;
      clearGraph();
      try {
        buildGraph();
        isPlayingRef.current = true;
      } catch (error) {
        // AudioContext creation can fail on a locked-down browser.
        clearGraph();
        isPlayingRef.current = false;
        console.error('Error starting audio:', error);
      }
    };

    const stop = (closeContext = true) => {
      clearGraph();
      isPlayingRef.current = false;
      if (closeContext) {
        const ctx = ctxRef.current;
        ctxRef.current = null;
        if (ctx && ctx.state !== 'closed') {
          ctx.close().catch(() => undefined);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      play: start,
      stop: () => stop(true),
      updateFrequencies: () => {
        if (!isPlayingRef.current) return;
        clearGraph();
        buildGraph();
      },
    }));

    // Mode, beat and ear changes rebuild the graph; frequency changes are
    // applied directly so dragging a slider does not click or leak nodes.
    const previous = useRef({ audioMode, beatPatternEnabled });
    useEffect(() => {
      if (!isPlayingRef.current) {
        previous.current = { audioMode, beatPatternEnabled };
        return;
      }
      const modeChanged = previous.current.audioMode !== audioMode;
      const beatChanged = previous.current.beatPatternEnabled !== beatPatternEnabled;
      previous.current = { audioMode, beatPatternEnabled };

      if (modeChanged || beatChanged) {
        clearGraph();
        buildGraph();
        return;
      }

      const ctx = ctxRef.current;
      if (!ctx || ctx.state === 'closed') return;
      const now = ctx.currentTime;

      if (audioMode === 'binaural' && refs.current.left && refs.current.right) {
        refs.current.left.frequency.setTargetAtTime(baseFreq, now, 0.03);
        refs.current.right.frequency.setTargetAtTime(
          baseFreq + (beatPatternEnabled ? deltaFreq : 0),
          now,
          0.03
        );
        refs.current.leftGain?.gain.setTargetAtTime(leftEarEnabled ? 0.1 : 0, now, 0.02);
        refs.current.rightGain?.gain.setTargetAtTime(rightEarEnabled ? 0.1 : 0, now, 0.02);
      } else if (audioMode === 'isochronic' && refs.current.carrier) {
        refs.current.carrier.frequency.setTargetAtTime(baseFreq, now, 0.03);
        refs.current.lfo?.frequency.setTargetAtTime(Math.max(0.1, deltaFreq), now, 0.03);
      } else if (audioMode === 'mono' && refs.current.mono) {
        refs.current.mono.frequency.setTargetAtTime(deltaFreq, now, 0.03);
        refs.current.monoGain?.gain.setTargetAtTime(
          leftEarEnabled || rightEarEnabled ? 0.1 : 0,
          now,
          0.02
        );
      }
    }, [baseFreq, deltaFreq, audioMode, leftEarEnabled, rightEarEnabled, beatPatternEnabled]);

    // Navigating away or unmounting must always silence the generator.
    useEffect(() => {
      return () => {
        stop(true);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
  }
);

BinauralGenerator.displayName = 'BinauralGenerator';

export default BinauralGenerator;
