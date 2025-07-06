import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface OscilloscopeVisualizationProps {
  baseFreq: number;
  deltaFreq: number;
  isPlaying: boolean;
  leftEarEnabled: boolean;
  rightEarEnabled: boolean;
  beatPatternEnabled: boolean;
  audioMode: 'binaural' | 'isochronic' | 'mono';
}

const OscilloscopeVisualization: React.FC<OscilloscopeVisualizationProps> = ({
  baseFreq,
  deltaFreq,
  isPlaying,
  leftEarEnabled,
  rightEarEnabled,
  beatPatternEnabled,
  audioMode
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = svgRef.current.clientWidth || 800;
    const containerHeight = svgRef.current.clientHeight || 400;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 2])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-2.5, 2.5])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale).ticks(8);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .append('text')
      .attr('x', width / 2)
      .attr('y', 45)
      .attr('fill', 'white')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Time (seconds)');

    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'white')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Amplitude');

    // Add grid
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8).tickSize(-height).tickFormat(() => ''))
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(6).tickSize(-width).tickFormat(() => ''))
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Create line generators
    const line = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveLinear);

    // Create paths for waveforms
    const leftPath = g.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#60A5FA')
      .attr('stroke-width', 2)
      .style('opacity', leftEarEnabled ? 1 : 0.3);

    const rightPath = g.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#34D399')
      .attr('stroke-width', 2)
      .style('opacity', rightEarEnabled ? 1 : 0.3);

    const beatPath = g.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#F59E0B')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', beatPatternEnabled ? 0.8 : 0.3);

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 150}, 20)`);

    if (audioMode === 'binaural') {
      legend.append('line')
        .attr('x1', 0).attr('x2', 20)
        .attr('y1', 0).attr('y2', 0)
        .attr('stroke', '#60A5FA')
        .attr('stroke-width', 2)
        .style('opacity', leftEarEnabled ? 1 : 0.3);
      legend.append('text')
        .attr('x', 25).attr('y', 5)
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(`Left: ${baseFreq}Hz`);

      legend.append('line')
        .attr('x1', 0).attr('x2', 20)
        .attr('y1', 15).attr('y2', 15)
        .attr('stroke', '#34D399')
        .attr('stroke-width', 2)
        .style('opacity', rightEarEnabled ? 1 : 0.3);
      legend.append('text')
        .attr('x', 25).attr('y', 20)
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(`Right: ${baseFreq + deltaFreq}Hz`);

      legend.append('line')
        .attr('x1', 0).attr('x2', 20)
        .attr('y1', 30).attr('y2', 30)
        .attr('stroke', '#F59E0B')
        .attr('stroke-width', 3)
        .style('opacity', beatPatternEnabled ? 0.8 : 0.3);
      legend.append('text')
        .attr('x', 25).attr('y', 35)
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(`Beat: ${deltaFreq}Hz`);
    } else if (audioMode === 'isochronic') {
      legend.append('line')
        .attr('x1', 0).attr('x2', 20)
        .attr('y1', 0).attr('y2', 0)
        .attr('stroke', '#F59E0B')
        .attr('stroke-width', 3);
      legend.append('text')
        .attr('x', 25).attr('y', 5)
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(`Isochronic: ${deltaFreq}Hz`);
    } else {
      legend.append('line')
        .attr('x1', 0).attr('x2', 20)
        .attr('y1', 0).attr('y2', 0)
        .attr('stroke', '#60A5FA')
        .attr('stroke-width', 2);
      legend.append('text')
        .attr('x', 25).attr('y', 5)
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(`Mono: ${deltaFreq}Hz`);
    }

    let startTime = Date.now();

    const animate = () => {
      if (!isPlaying) return;

      const currentTime = (Date.now() - startTime) / 1000;
      const points = 400;
      const duration = 2;

      const leftData: [number, number][] = [];
      const rightData: [number, number][] = [];
      const beatData: [number, number][] = [];

      for (let i = 0; i < points; i++) {
        const t = (i / points) * duration;
        const phase = (currentTime + t) * 2 * Math.PI;
        
        if (audioMode === 'binaural') {
          const leftAmp = Math.sin(baseFreq * phase / 20) * (leftEarEnabled ? 1 : 0.3);
          const rightAmp = Math.sin((baseFreq + deltaFreq) * phase / 20) * (rightEarEnabled ? 1 : 0.3);
          const beatAmp = (leftAmp + rightAmp) / 2 * (beatPatternEnabled ? 1 : 0.3);

          leftData.push([t, leftAmp]);
          rightData.push([t, rightAmp]);
          beatData.push([t, beatAmp]);
        } else if (audioMode === 'isochronic') {
          const pulsePhase = deltaFreq * phase / 20;
          const envelope = Math.sin(pulsePhase) > 0 ? 1 : 0;
          const carrier = Math.sin(baseFreq * phase / 20);
          const isoAmp = carrier * envelope * (beatPatternEnabled ? 1 : 0.3);

          beatData.push([t, isoAmp]);
          leftData.push([t, 0]);
          rightData.push([t, 0]);
        } else {
          const monoAmp = Math.sin(deltaFreq * phase / 20);
          leftData.push([t, monoAmp]);
          rightData.push([t, 0]);
          beatData.push([t, 0]);
        }
      }

      leftPath.datum(leftData).attr('d', line);
      rightPath.datum(rightData).attr('d', line);
      beatPath.datum(beatData).attr('d', line);

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      startTime = Date.now();
      animate();
    }

    // Handle resize
    const handleResize = () => {
      const newWidth = svgRef.current?.clientWidth || 800;
      const newHeight = svgRef.current?.clientHeight || 400;
      svg.attr('width', newWidth).attr('height', newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [baseFreq, deltaFreq, isPlaying, leftEarEnabled, rightEarEnabled, beatPatternEnabled, audioMode]);

  return (
    <div className="w-full h-full min-h-[300px] lg:min-h-[400px]">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="border border-gray-600 rounded-lg bg-gray-900/50"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default OscilloscopeVisualization;