import './styles.css';
import { useEffect } from 'react';
import { loadThemePreferences } from '../lib/themes';

function App({ Component, pageProps }) {
  useEffect(() => {
    const applyPreferences = () => {
      const { template, customization } = loadThemePreferences();
      const root = document.documentElement;
      root.dataset.template = template;

      const mode = customization.mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : customization.mode;
      root.dataset.theme = mode;
      root.style.colorScheme = mode;
      const setToken = (name, value) => {
        if (value) root.style.setProperty(name, value);
        else root.style.removeProperty(name);
      };
      setToken('--primary', customization.primary);
      setToken('--secondary', customization.secondary);
      setToken('--accent', customization.accent);
      setToken('--bg', customization.background);
      setToken('--panel', customization.surface);
      setToken('--text', customization.text);
      setToken('--line', customization.border);
      setToken('--font-family', customization.font);
      root.style.setProperty('--radius', `${customization.radius}px`);
      root.style.setProperty('--heading-size', `${customization.headingSize}px`);
      root.style.setProperty('--body-size', `${customization.bodySize}px`);
      root.style.setProperty('--border-width', `${customization.borderIntensity}px`);
      root.style.setProperty('--shadow-enabled', customization.shadows ? '1' : '0');
      root.dataset.sidebar = customization.sidebar;
      root.dataset.spacing = customization.spacing;
      root.dataset.animation = customization.animation;
    };

    applyPreferences();
    window.addEventListener('deepwrite-theme-change', applyPreferences);
    window.addEventListener('storage', applyPreferences);
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemTheme = () => {
      if (loadThemePreferences().customization.mode === 'system') applyPreferences();
    };
    systemTheme.addEventListener?.('change', handleSystemTheme);
    return () => {
      window.removeEventListener('deepwrite-theme-change', applyPreferences);
      window.removeEventListener('storage', applyPreferences);
      systemTheme.removeEventListener?.('change', handleSystemTheme);
    };
  }, []);

  return <Component {...pageProps} />
}
export default App;
