import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import FocusMode from './components/FocusMode';
import BreakMode from './components/BreakMode';
import CommandCenter from './components/CommandCenter';
import SignalWatcher from './components/SignalWatcher';
import FlowBuilder from './components/FlowBuilder';
import { useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { getFontForTheme } from './ThemeFonts';



function App() {
  const [selectedPanel, setSelectedPanel] = useState('FocusMode');
  const { theme } = useTheme();

  useEffect(() => {
    document.body.className = theme;
    document.body.style.fontFamily = getFontForTheme(theme); // 💥 Add this
  }, [theme]);

  const renderPanel = () => {
    switch (selectedPanel) {
      case 'FocusMode':
        return <FocusMode />;
      case 'BreakMode':
        return <BreakMode />;
      case 'CommandCenter':
        return <CommandCenter />;
      case 'SignalWatcher':
        return <SignalWatcher />;
      case 'FlowBuilder':
        return <FlowBuilder />;
      default:
        return <FocusMode />;
    }
  };

  return (
    <div className="app">
      <Sidebar onSelectPanel={setSelectedPanel} activePanel={selectedPanel} />
      <div className="panel">
        {renderPanel()}
      </div>
    </div>
  );
}

export default App;
