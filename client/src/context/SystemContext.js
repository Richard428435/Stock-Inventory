import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SystemContext = createContext();

export const useSystem = () => useContext(SystemContext);

export const SystemProvider = ({ children }) => {
  const [config, setConfig] = useState({
    churchName: 'Chariot of Fire Faith Assembly',
    logoUrl: '/pictures/Logoo_02-removebg-preview.png',
    backgroundUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b'
  });
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      const res = await api.get('/system');
      const loadedConfig = res.data;
      setConfig(loadedConfig);
      applyTheme(loadedConfig);
    } catch (err) {
      console.error('Failed to load system config', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const applyTheme = (conf) => {
    const root = document.documentElement;
    if (conf.backgroundUrl) {
      root.style.setProperty('--bg-image', `url(${conf.backgroundUrl})`);
    } else {
      root.style.removeProperty('--bg-image');
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const res = await api.put('/system', newConfig);
      setConfig(res.data);
      applyTheme(res.data);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <SystemContext.Provider value={{ config, updateConfig, loading }}>
        {children}
    </SystemContext.Provider>
  );
};
