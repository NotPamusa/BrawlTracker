"use client";

import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  formatter?: (val: number) => string;
  disableGlow?: boolean;
  suppressFirstPulse?: boolean;
}

export default function CountUp({ end, duration = 2000, formatter, disableGlow = false, suppressFirstPulse = false }: CountUpProps) {
  const [count, setCount] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const countRef = useRef(0);
  const prevEndRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (end === prevEndRef.current && countRef.current === end) return;

    if (end > prevEndRef.current) setDirection('up');
    else if (end < prevEndRef.current) setDirection('down');

    const suppress = isFirstRender.current && suppressFirstPulse;
    isFirstRender.current = false;

    const start = countRef.current;
    const diff = end - start;
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Pulse Intensity Logic: Peak at 15% progress, fade to 0 by 70%
      let currentIntensity = 0;
      if (progress < 0.15) {
        currentIntensity = progress / 0.15;
      } else {
        currentIntensity = Math.max(0, 1 - (progress - 0.15) / 0.55);
      }
      if (!suppress) setIntensity(currentIntensity);

      // Easing function: easeOutQuint
      const easedProgress = 1 - Math.pow(1 - progress, 5);
      const currentCount = Math.round(start + easedProgress * diff);

      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(step);
      } else {
        prevEndRef.current = end;
        setIntensity(0);
      }
    };

    if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    animationRef.current = window.requestAnimationFrame(step);

    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, [end, duration]);

  const activeColor = direction === 'up' ? '#ff3e3e' : '#3eff3e'; // Vibrant Red/Green

  return (
    <span 
      style={{ 
        color: !disableGlow && intensity > 0 ? activeColor : 'inherit',
        textShadow: !disableGlow && intensity > 0 ? `0 0 ${20 * intensity}px ${activeColor}` : 'none',
        transition: 'color 0.1s ease-out, text-shadow 0.1s ease-out',
        display: 'inline-block'
      }}
    >
      {formatter ? formatter(count) : count}
    </span>
  );
}
