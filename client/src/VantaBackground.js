import { fixGoogleDriveUrl } from './utils/googleDrive';
import { useTheme } from './context/ThemeContext';
import { useSystem } from './context/SystemContext';

export default function VantaBackground() {
  const ref = useRef(null);
  const { theme } = useTheme();
  const { config } = useSystem();

  const rawUrl = config?.backgroundUrl;
  const backgroundUrl = fixGoogleDriveUrl(rawUrl);
  const hasImage = !!backgroundUrl;

  useEffect(() => {
    // Only init Vanta if NO background image is set
    if (hasImage) return;
    
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
        color: theme === 'dark' ? 0x0 : 0xe2e8f0,
        shininess: 30,
        waveHeight: 15,
        waveSpeed: 0.5
      });
    }

    return () => {
      if (vantaEffect && typeof vantaEffect.destroy === 'function') {
        vantaEffect.destroy();
      }
    };
  }, [theme, hasImage]);

  return (
    <>
      {/* Fallback Vanta Layer or Custom Image Layer */}
      <div 
        ref={ref} 
        className="fixed inset-0 z-[-1] w-full h-full transition-opacity duration-1000"
        style={hasImage ? {
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1
        } : {}}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 z-[-1] bg-black/10 dark:bg-black/40 pointer-events-none" />
    </>
  );
}

