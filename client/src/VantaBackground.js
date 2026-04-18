import { useEffect, useRef } from 'react';
import { useTheme } from './context/ThemeContext';
import { useSystem } from './context/SystemContext';

export default function VantaBackground() {
  const ref = useRef(null);
  const { theme } = useTheme();
  const { config } = useSystem();

  useEffect(() => {
    if (config?.backgroundUrl) return;
    
    let vantaEffect;

    if (typeof window !== 'undefined' && window.VANTA && window.VANTA.WAVES && ref.current) {
      vantaEffect = window.VANTA.WAVES({
        el: ref.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: theme === 'dark' ? 0x0 : 0xe2e8f0
      });
    }

    return () => {
      if (vantaEffect && typeof vantaEffect.destroy === 'function') {
        vantaEffect.destroy();
      }
    };
  }, [theme, config?.backgroundUrl]);

  if (config?.backgroundUrl) return null;

  return <div ref={ref} className="fixed inset-0 z-[-1] w-full h-full" />;
}

