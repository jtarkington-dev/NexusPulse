import React, { useState, useEffect } from 'react';
import '../styles/FocusMode.css';
import { useTheme } from '../ThemeContext';
import { getFontForTheme } from '../ThemeFonts';

const getButtonStyle = (theme) => {
    switch (theme) {
        case 'cyberpunk':
            return {
                backgroundColor: '#00ffe7',
                color: '#0e0e0e',
                borderRadius: '12px',
                boxShadow: '0 0 10px #00ffe7',
            };
        case 'fallout':
            return {
                backgroundColor: '#f1f100',
                color: '#2e2e2e',
                fontFamily: 'Courier New, Courier, monospace',
                borderRadius: '0px',
                border: '2px dashed #f1f100',
            };
        case 'mario':
            return {
                backgroundColor: '#ff4500',
                color: '#ffffff',
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '10px',
                border: '3px solid #000',
                borderRadius: '6px',
            };
        case 'zelda':
            return {
                backgroundColor: '#99ff99',
                color: '#003300',
                fontFamily: 'Georgia, serif',
                fontSize: '18px',
                borderRadius: '50px',
                boxShadow: '0 0 5px #99ff99',
            };
        default:
            return {};
    }
};

const getAddButtonStyle = (theme) => {
    switch (theme) {
        case 'cyberpunk':
            return {
                backgroundColor: '#00ffe7',
                color: '#0e0e0e',
                borderRadius: '8px',
                fontWeight: 'bold',
            };
        case 'fallout':
            return {
                backgroundColor: '#f1f100',
                color: '#2e2e2e',
                fontFamily: 'Courier New, Courier, monospace',
                borderRadius: '4px',
            };
        case 'mario':
            return {
                backgroundColor: '#ff4500',
                color: '#ffffff',
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '10px',
                borderRadius: '6px',
            };
        case 'zelda':
            return {
                backgroundColor: '#99ff99',
                color: '#003300',
                fontFamily: 'Cinzel Decorative, serif',
                fontSize: '16px',
                borderRadius: '20px',
            };
        default:
            return {};
    }
};

const getStreakStyle = (theme) => {
    switch (theme) {
        case 'cyberpunk':
            return {
                color: '#00ffe7',
                fontFamily: 'Orbitron, sans-serif',
            };
        case 'fallout':
            return {
                color: '#f1f100',
                fontFamily: 'Courier New, Courier, monospace',
            };
        case 'mario':
            return {
                color: '#ff4500',
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '12px',
            };
        case 'zelda':
            return {
                color: '#99ff99',
                fontFamily: 'Cinzel Decorative, serif',
            };
        default:
            return {};
    }
};

function FocusMode() {
    const [task, setTask] = useState('');
    const [tasks, setTasks] = useState(() => {
        const stored = localStorage.getItem('focusTasks');
        return stored ? JSON.parse(stored) : [];
    });

    const [streak, setStreak] = useState(() => {
        return parseInt(localStorage.getItem('focusStreak')) || 0;
    });

    const [lastActiveDate, setLastActiveDate] = useState(() => {
        return localStorage.getItem('focusLastActiveDate') || null;
    });

    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isWorkSession, setIsWorkSession] = useState(true);

    const { theme } = useTheme();

    // Load streak on first mount
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];

        if (lastActiveDate) {
            if (today > lastActiveDate) {
                const yesterday = new Date(lastActiveDate);
                yesterday.setDate(yesterday.getDate() + 1);
                const formattedYesterday = yesterday.toISOString().split('T')[0];

                if (today === formattedYesterday) {
                    setStreak((prev) => prev + 1);
                } else {
                    setStreak(0);
                }
            }
        } else {
            setStreak(1);
        }

        setLastActiveDate(today);
    }, []);

    useEffect(() => {
        localStorage.setItem('focusTasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('focusStreak', streak.toString());
        localStorage.setItem('focusLastActiveDate', lastActiveDate);
    }, [streak, lastActiveDate]);

    useEffect(() => {
        let timer;
        if (isRunning) {
            timer = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev === 0) {
                        clearInterval(timer);
                        // Switch work/break session
                        if (isWorkSession) {
                            setIsWorkSession(false);
                            setSecondsLeft(5 * 60); // 5 minute break
                        } else {
                            setIsWorkSession(true);
                            setSecondsLeft(25 * 60); // 25 minute work session
                        }
                        return prev;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, isWorkSession]);

    const handleAddTask = () => {
        if (task.trim() === '') return;
        const newTask = { id: Date.now(), text: task, completed: false };
        setTasks((prevTasks) => [...prevTasks, newTask]);
        setTask('');
    };

    const handleToggleTask = (id) => {
        setTasks((prevTasks) =>
            prevTasks.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
            )
        );
    };

    const formatTime = () => {
        const minutes = Math.floor(secondsLeft / 60)
            .toString()
            .padStart(2, '0');
        const seconds = (secondsLeft % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleStartPause = () => {
        setIsRunning((prev) => !prev);
    };

    const handleReset = () => {
        setIsRunning(false);
        setSecondsLeft(isWorkSession ? 25 * 60 : 5 * 60);
    };

    return (
        <div className="focus-mode">
            <h1>Focus Mode</h1>

            <div className={`pomodoro-timer ${theme}-theme`}>
                <h2>{isWorkSession ? 'Work Session' : 'Break Session'}</h2>
                <div className="timer-display">{formatTime()}</div>
                <div className="timer-controls">
                    <button
                        className="timer-btn"
                        style={getButtonStyle(theme)}
                        onClick={handleStartPause}
                    >
                        {isRunning ? 'Pause' : 'Start'}
                    </button>
                    <button
                        className="timer-btn"
                        style={getButtonStyle(theme)}
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="streak-counter">
                <p style={getStreakStyle(theme)}>
                    🔥 Current Streak: {streak} {streak === 1 ? 'day' : 'days'}
                </p>
            </div>

            <div className="task-input">
                <input
                    type="text"
                    placeholder="Enter a focus task..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                />
                <button
                    className="add-task-btn"
                    style={getAddButtonStyle(theme)}
                    onClick={handleAddTask}
                >
                    Add
                </button>
            </div>

            <ul className="task-list">
                {tasks.map((t) => (
                    <li
                        key={t.id}
                        className={t.completed ? 'completed task-item' : 'task-item'}
                        style={{ fontFamily: getFontForTheme(theme) }}
                        onClick={() => handleToggleTask(t.id)}
                    >
                        {t.text}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FocusMode;
