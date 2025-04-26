import React, { useState, useEffect } from 'react';
import '../styles/FocusMode.css';
import { useTheme } from '../ThemeContext';
import { getFontForTheme } from '../ThemeFonts';
import TaskCard from './TaskCard';

// Theme-based styles
const getButtonStyle = (theme) => {
    const styles = {
        cyberpunk: { backgroundColor: '#00ffe7', color: '#0e0e0e', borderRadius: '12px', boxShadow: '0 0 10px #00ffe7' },
        fallout: { backgroundColor: '#f1f100', color: '#2e2e2e', fontFamily: 'Courier New, Courier, monospace', border: '2px dashed #f1f100' },
        mario: { backgroundColor: '#ff4500', color: '#ffffff', fontFamily: '"Press Start 2P", cursive', fontSize: '10px', border: '3px solid #000', borderRadius: '6px' },
        zelda: { backgroundColor: '#99ff99', color: '#003300', fontFamily: 'Georgia, serif', fontSize: '18px', borderRadius: '50px', boxShadow: '0 0 5px #99ff99' },
    };
    return styles[theme] || {};
};

const getPriorityColor = (priority) => {
    const colors = {
        High: '#ff4c4c',
        Medium: '#ffc107',
        Low: '#4caf50',
    };
    return colors[priority] || '#333';
};

const getStreakStyle = (theme) => {
    const styles = {
        cyberpunk: { color: '#00ffe7', fontFamily: 'Orbitron, sans-serif' },
        fallout: { color: '#f1f100', fontFamily: 'Courier New, Courier, monospace' },
        mario: { color: '#ff4500', fontFamily: '"Press Start 2P", cursive', fontSize: '12px' },
        zelda: { color: '#99ff99', fontFamily: 'Cinzel Decorative, serif' },
    };
    return styles[theme] || {};
};

function FocusMode() {
    const { theme } = useTheme();

    const [task, setTask] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [tag, setTag] = useState('Work');
    const [priority, setPriority] = useState('Medium');

    const [tasks, setTasks] = useState(() => {
        const stored = localStorage.getItem('focusTasks');
        return stored ? JSON.parse(stored) : [];
    });

    const [focusedTaskId, setFocusedTaskId] = useState(null);
    const [isFocusPaused, setIsFocusPaused] = useState(false);
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('focusStreak')) || 0);
    const [lastActiveDate, setLastActiveDate] = useState(localStorage.getItem('focusLastActiveDate') || null);

    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isWorkSession, setIsWorkSession] = useState(true);

    const [dailyWorkSeconds, setDailyWorkSeconds] = useState(0);
    const [dailyTaskWork, setDailyTaskWork] = useState([]);

    // Handle streak tracking
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (!lastActiveDate) {
            setStreak(1);
        } else {
            const yesterday = new Date(lastActiveDate);
            yesterday.setDate(yesterday.getDate() + 1);
            const formattedYesterday = yesterday.toISOString().split('T')[0];

            if (today === formattedYesterday) {
                setStreak((prev) => prev + 1);
            } else if (today > lastActiveDate) {
                setStreak(1);
            }
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

    // Timer for Pomodoro
    useEffect(() => {
        let timer;
        if (isRunning && !isFocusPaused) {
            timer = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        setIsWorkSession((prevSession) => !prevSession);
                        return prev <= 0 ? (isWorkSession ? 5 * 60 : 25 * 60) : prev;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, isWorkSession, isFocusPaused]);

    // Timer for tracking focus time on task
    useEffect(() => {
        let interval;
        if (focusedTaskId && !isFocusPaused) {
            interval = setInterval(() => {
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === focusedTaskId ? { ...task, timeSpent: (task.timeSpent || 0) + 1 } : task
                    )
                );
                setDailyWorkSeconds(prev => prev + 1);
                setDailyTaskWork(prev => {
                    const existing = prev.find(entry => entry.taskId === focusedTaskId);
                    if (existing) {
                        return prev.map(entry =>
                            entry.taskId === focusedTaskId ? { ...entry, seconds: entry.seconds + 1 } : entry
                        );
                    } else {
                        return [...prev, { taskId: focusedTaskId, seconds: 1 }];
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [focusedTaskId, isFocusPaused]);

    const formatTime = () => {
        const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
        const seconds = (secondsLeft % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleAddTask = () => {
        if (!task.trim()) return;
        const newTask = {
            id: Date.now(),
            text: task,
            completed: false,
            priority: priority,
            tag: tag,
            dueDate: dueDate,
            subtasks: [],
            timeSpent: 0,
            details: ''
        };
        setTasks((prev) => [...prev, newTask]);
        setTask('');
    };

    const handleToggleComplete = (id) => {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id
                    ? { ...t, completed: !t.completed }
                    : t
            )
        );
        if (focusedTaskId === id) {
            setFocusedTaskId(null);
            setIsFocusPaused(false);
        }
    };

    const handleStartFocus = (id) => {
        if (focusedTaskId !== id) {
            setFocusedTaskId(id);
            setIsFocusPaused(false);
        }
        if (!isRunning) {
            setIsRunning(true); // Auto-start the main Pomodoro timer if it’s not already running
        }
    };


    const handleDeleteTask = (id) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        if (focusedTaskId === id) {
            setFocusedTaskId(null);
            setIsFocusPaused(false);
        }
    };

    const handleToggleSubtask = (taskId, subtaskIndex) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id === taskId) {
                    const updatedSubtasks = task.subtasks.map((sub, idx) =>
                        idx === subtaskIndex ? { ...sub, completed: !sub.completed } : sub
                    );
                    return { ...task, subtasks: updatedSubtasks };
                }
                return task;
            })
        );
    };

    const handleAddSubtask = (taskId, text) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? { ...task, subtasks: [...task.subtasks, { text, completed: false }] }
                    : task
            )
        );
    };

    const handleReset = () => {
        setIsRunning(false);
        setSecondsLeft(isWorkSession ? 25 * 60 : 5 * 60);
    };

    const handleStartPause = () => {
        setIsRunning((prev) => !prev);
    };

    const handleEndDay = () => {
        console.log('--- End of Day Report ---');
        console.log('Total Work Time Today:', Math.floor(dailyWorkSeconds / 60), 'minutes');
        console.log('Per Task Breakdown:');
        dailyTaskWork.forEach((entry) => {
            const task = tasks.find(t => t.id === entry.taskId);
            console.log(`- ${task ? task.text : 'Unknown Task'}: ${Math.floor(entry.seconds / 60)} minutes`);
        });
        console.log('--------------------------');
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

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    style={{
                        ...getButtonStyle(theme),
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                    onClick={handleEndDay}
                >
                    End Day & View Report
                </button>
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
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ fontFamily: getFontForTheme(theme) }}
                />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ fontFamily: getFontForTheme(theme) }}
                >
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                </select>
                <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    style={{ fontFamily: getFontForTheme(theme) }}
                >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Personal">Personal</option>
                    <option value="Fitness">Fitness</option>
                </select>
                <button
                    className="add-task-btn"
                    style={getButtonStyle(theme)}
                    onClick={handleAddTask}
                >
                    Add
                </button>
            </div>

            <div className="task-list">
                {tasks.map((t) => (
                    <TaskCard
                        key={t.id}
                        task={t}
                        theme={theme}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        onToggleSubtask={handleToggleSubtask}
                        onAddSubtask={handleAddSubtask}
                        onStartFocus={handleStartFocus}
                        focusedTaskId={focusedTaskId}
                        isFocusPaused={isFocusPaused}
                        onPauseFocus={() => setIsFocusPaused(true)}
                        onResumeFocus={() => setIsFocusPaused(false)}
                        onStopFocus={() => {
                            setFocusedTaskId(null);
                            setIsFocusPaused(false);
                        }}
                        onUpdateTask={(id, updates) => {
                            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default FocusMode;
