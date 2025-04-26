import React from 'react';
import '../styles/Sidebar.css';
import { useTheme } from '../ThemeContext';

function Sidebar({ onSelectPanel, activePanel }) {
    const { theme, toggleTheme } = useTheme();

    const panels = [
        { id: 'FocusMode', label: 'Focus Mode' },
        { id: 'BreakMode', label: 'Break Mode' },
        { id: 'CommandCenter', label: 'Command Center' },
        { id: 'SignalWatcher', label: 'Signal Watcher' },
        { id: 'FlowBuilder', label: 'Flow Builder' },
    ];

    return (
        <div className="sidebar">
            <h2 className="sidebar-title">Nexus Pulse</h2>
            <ul className="sidebar-list">
                {panels.map((panel) => (
                    <li
                        key={panel.id}
                        className={`sidebar-item ${activePanel === panel.id ? 'active' : ''}`}
                        onClick={() => onSelectPanel(panel.id)}
                    >
                        {panel.label}
                    </li>
                ))}
            </ul>

            {/* THEME SWITCHER */}
            <div className="theme-switcher">
                <select value={theme} onChange={(e) => toggleTheme(e.target.value)}>
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="fallout">Fallout</option>
                    <option value="mario">Mario</option>
                    <option value="zelda">Zelda</option>
                </select>
            </div>
        </div>
    );
}

export default Sidebar;
