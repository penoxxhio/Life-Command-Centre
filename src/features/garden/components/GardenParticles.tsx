import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ParticleConfig {
  count: number;
  type: 'sunlight' | 'rain' | 'sparkle';
}

export const GardenParticles: React.FC<ParticleConfig> = ({ count, type }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      size: 4 + Math.random() * 8,
    }));
  }, [count]);

  const getParticle = (p: typeof particles[0]) => {
    switch (type) {
      case 'sunlight':
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-amber-300"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              filter: 'blur(1px)',
            }}
            animate={{
              y: [-20, 300],
              opacity: [0, 0.6, 0],
              x: [0, Math.random() * 20 - 10],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
      case 'rain':
        return (
          <motion.div
            key={p.id}
            className="absolute w-0.5 bg-sky-300 rounded-full"
            style={{
              left: `${p.x}%`,
              height: p.size * 2,
            }}
            animate={{
              y: [-20, 400],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: p.duration * 0.6,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
      case 'sparkle':
        return (
          <motion.div
            key={p.id}
            className="absolute text-amber-400"
            style={{
              left: `${p.x}%`,
              top: `${20 + Math.random() * 60}%`,
              fontSize: p.size,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
              rotate: [0, 180],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
            }}
          >
            ✦
          </motion.div>
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(getParticle)}
    </div>
  );
};
