import React, { useMemo } from 'react';
import { fixGoogleDriveUrl } from './utils/googleDrive';
import { useTheme } from './context/ThemeContext';
import { useSystem } from './context/SystemContext';

export default function VantaBackground() {
  const { theme } = useTheme();
  const { config } = useSystem();

  const rawUrl = config?.backgroundUrl;
  const backgroundUrl = fixGoogleDriveUrl(rawUrl);
  const hasImage = !!backgroundUrl;

  // Generate 15 random glitters with complex animation timings (reduced from 40 for ultra-performance)
  const glitters = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      durY: `${Math.random() * 15 + 15}s`, // 15s to 30s float up
      durX: `${Math.random() * 5 + 3}s`,   // 3s to 8s sway
      durP: `${Math.random() * 4 + 2}s`,   // 2s to 6s pulse
      delay: `${Math.random() * -20}s`,    // Negative delay so they are already on screen
      size: `${Math.random() * 4 + 2}px`,  // 2px to 6px
      opacity: Math.random() * 0.6 + 0.4
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes glitterFloatY {
          0% { top: 110vh; }
          100% { top: -10vh; }
        }
        @keyframes glitterFloatX {
          0%, 100% { transform: translateX(-30px); }
          50% { transform: translateX(30px); }
        }
        @keyframes glitterPulse {
          0%, 100% { opacity: 0; scale: 0.5; }
          50% { opacity: var(--max-opacity); scale: 1.2; }
        }
        .lux-glitter {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, #fbbf24 0%, transparent 80%);
          box-shadow: 0 0 15px 3px rgba(245, 158, 11, 0.4);
          animation: 
            glitterFloatY var(--dur-y) linear infinite,
            glitterFloatX var(--dur-x) ease-in-out infinite,
            glitterPulse var(--dur-p) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      
      <div 
        className="fixed inset-0 z-[-1] w-full h-full transition-opacity duration-1000"
        style={hasImage ? {
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1
        } : {}}
      >
        {!hasImage && (
          <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark' ? 'bg-[#05030a]' : 'bg-slate-50'}`}>
            {/* Animated Blurred Orbs for Luxury Ambient Light (Optimized Blur and Removed mix-blend) */}
            <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/10 dark:bg-indigo-600/10 blur-[60px] animate-pulse" style={{ animationDuration: '10s' }}></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-900/10 dark:bg-amber-600/5 blur-[60px] animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
            <div className="absolute top-[30%] left-[50%] w-[50vw] h-[50vw] rounded-full bg-purple-900/10 dark:bg-purple-600/5 blur-[60px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
            
            {/* Glitters / Fireflies */}
            {glitters.map(g => (
              <div 
                key={g.id}
                className="lux-glitter"
                style={{
                  left: g.left,
                  width: g.size,
                  height: g.size,
                  '--dur-y': g.durY,
                  '--dur-x': g.durX,
                  '--dur-p': g.durP,
                  '--delay': g.delay,
                  '--max-opacity': g.opacity
                }}
              />
            ))}

            {/* Luxury Grain/Noise Texture (Optimized) */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'1\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
          </div>
        )}
      </div>
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 z-[-1] bg-black/10 dark:bg-black/40 pointer-events-none" />
    </>
  );
}

