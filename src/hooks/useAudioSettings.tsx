import React, { createContext, useContext, useState } from 'react';

const AudioSettingsContext = createContext<any>(null);

export const AudioSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState({ muted: false, volume: 0.8 });
  
  const toggleMute = () => setSettings(s => ({ ...s, muted: !s.muted }));
  const setVolume = (v: number) => setSettings(s => ({ ...s, volume: v }));
  const playAlertSound = (severity: string) => console.log('Playing sound:', severity);

  return (
    <AudioSettingsContext.Provider value={{ settings, toggleMute, setVolume, playAlertSound }}>
      {children}
    </AudioSettingsContext.Provider>
  );
};

export const useAudioSettings = () => useContext(AudioSettingsContext);
