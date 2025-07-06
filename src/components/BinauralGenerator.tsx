import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface BinauralGeneratorProps {
  baseFreq: number;
  deltaFreq: number;
  audioMode: 'binaural' | 'isochronic' | 'mono';
  leftEarEnabled: boolean;
  rightEarEnabled: boolean;
  beatPatternEnabled: boolean;
}

const BinauralGenerator = forwardRef<any, BinauralGeneratorProps>(
  ({ baseFreq, deltaFreq, audioMode, leftEarEnabled, rightEarEnabled, beatPatternEnabled }, ref) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const leftOscRef = useRef<OscillatorNode | null>(null);
    const rightOscRef = useRef<OscillatorNode | null>(null);
    const isoOscRef = useRef<OscillatorNode | null>(null);
    const leftGainRef = useRef<GainNode | null>(null);
    const rightGainRef = useRef<GainNode | null>(null);
    const isoGainRef = useRef<GainNode | null>(null);
    const isPlayingRef = useRef(false);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (isPlayingRef.current) return;

        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          const ctx = audioContextRef.current;

          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          if (audioMode === 'binaural') {
            // Create binaural beat setup
            leftOscRef.current = ctx.createOscillator();
            rightOscRef.current = ctx.createOscillator();
            leftGainRef.current = ctx.createGain();
            rightGainRef.current = ctx.createGain();

            const leftPanner = ctx.createStereoPanner();
            const rightPanner = ctx.createStereoPanner();

            leftOscRef.current.frequency.value = baseFreq;
            rightOscRef.current.frequency.value = baseFreq + deltaFreq;

            leftGainRef.current.gain.value = leftEarEnabled ? 0.1 : 0;
            rightGainRef.current.gain.value = rightEarEnabled ? 0.1 : 0;

            leftPanner.pan.value = -1;
            rightPanner.pan.value = 1;

            leftOscRef.current.connect(leftGainRef.current);
            leftGainRef.current.connect(leftPanner);
            leftPanner.connect(ctx.destination);

            rightOscRef.current.connect(rightGainRef.current);
            rightGainRef.current.connect(rightPanner);
            rightPanner.connect(ctx.destination);

            leftOscRef.current.start();
            rightOscRef.current.start();

          } else if (audioMode === 'isochronic') {
            // Create isochronic tone
            isoOscRef.current = ctx.createOscillator();
            isoGainRef.current = ctx.createGain();

            isoOscRef.current.frequency.value = baseFreq;
            isoGainRef.current.gain.value = 0;

            isoOscRef.current.connect(isoGainRef.current);
            isoGainRef.current.connect(ctx.destination);

            // Create pulsing effect at delta frequency
            const pulseFreq = deltaFreq;
            let isOn = false;
            const pulseInterval = 1000 / (pulseFreq * 2); // Half period for on/off

            const pulse = () => {
              if (!isPlayingRef.current) return;
              
              isOn = !isOn;
              const targetGain = isOn && beatPatternEnabled ? 0.1 : 0;
              
              if (isoGainRef.current) {
                isoGainRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.01);
              }
              
              setTimeout(pulse, pulseInterval);
            };

            isoOscRef.current.start();
            pulse();

          } else if (audioMode === 'mono') {
            // Create mono neural tone
            leftOscRef.current = ctx.createOscillator();
            leftGainRef.current = ctx.createGain();

            leftOscRef.current.frequency.value = deltaFreq;
            leftGainRef.current.gain.value = (leftEarEnabled || rightEarEnabled) ? 0.1 : 0;

            leftOscRef.current.connect(leftGainRef.current);
            leftGainRef.current.connect(ctx.destination);

            leftOscRef.current.start();
          }

          isPlayingRef.current = true;
        } catch (error) {
          console.error('Error starting audio:', error);
        }
      },

      stop: () => {
        if (!isPlayingRef.current) return;

        try {
          if (leftOscRef.current) {
            leftOscRef.current.stop();
            leftOscRef.current = null;
          }
          if (rightOscRef.current) {
            rightOscRef.current.stop();
            rightOscRef.current = null;
          }
          if (isoOscRef.current) {
            isoOscRef.current.stop();
            isoOscRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
        } catch (error) {
          console.error('Error stopping audio:', error);
        }

        isPlayingRef.current = false;
      },

      updateFrequencies: (newBaseFreq: number, newDeltaFreq: number) => {
        if (isPlayingRef.current) {
          if (audioMode === 'binaural' && leftOscRef.current && rightOscRef.current) {
            leftOscRef.current.frequency.value = newBaseFreq;
            rightOscRef.current.frequency.value = newBaseFreq + newDeltaFreq;
          } else if (audioMode === 'isochronic' && isoOscRef.current) {
            isoOscRef.current.frequency.value = newBaseFreq;
          } else if (audioMode === 'mono' && leftOscRef.current) {
            leftOscRef.current.frequency.value = newDeltaFreq;
          }
        }
      }
    }));

    // Update audio parameters when props change
    React.useEffect(() => {
      if (isPlayingRef.current) {
        if (audioMode === 'binaural' && leftGainRef.current && rightGainRef.current) {
          leftGainRef.current.gain.value = leftEarEnabled ? 0.1 : 0;
          rightGainRef.current.gain.value = rightEarEnabled ? 0.1 : 0;
        } else if (audioMode === 'mono' && leftGainRef.current) {
          leftGainRef.current.gain.value = (leftEarEnabled || rightEarEnabled) ? 0.1 : 0;
        }
      }
    }, [leftEarEnabled, rightEarEnabled, beatPatternEnabled, audioMode]);

    React.useEffect(() => {
      if (isPlayingRef.current) {
        if (audioMode === 'binaural' && leftOscRef.current && rightOscRef.current) {
          leftOscRef.current.frequency.value = baseFreq;
          rightOscRef.current.frequency.value = baseFreq + deltaFreq;
        } else if (audioMode === 'isochronic' && isoOscRef.current) {
          isoOscRef.current.frequency.value = baseFreq;
        } else if (audioMode === 'mono' && leftOscRef.current) {
          leftOscRef.current.frequency.value = deltaFreq;
        }
      }
    }, [baseFreq, deltaFreq, audioMode]);

    return null;
  }
);

BinauralGenerator.displayName = 'BinauralGenerator';

export default BinauralGenerator;