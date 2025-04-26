import React, { useState } from 'react';
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

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High':
            return '#ff4c4c';
        case 'Medium':
            return '#ffc107';
        case 'Low':
            return '#4caf50';
        default:
            return '#333';
    }
};

function TaskCard({
    task,
    theme,
    onToggleComplete,
    onDelete,
    onToggleSubtask,
    onAddSubtask,
    onStartFocus,
    focusedTaskId,
    isFocusPaused,
    onPauseFocus,
    onResumeFocus,
    onStopFocus,
    onUpdateTask
}) {

    const [expanded, setExpanded] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');
    const [editingDetails, setEditingDetails] = useState(false);
    const [editedDetails, setEditedDetails] = useState(task.details || '');

    const isOverdue = () => {
        if (!task.dueDate || task.completed) return false;
        const today = new Date().toISOString().split('T')[0];
        return today > task.dueDate;
    };

    const handleSaveDetails = () => {
        onUpdateTask(task.id, { details: editedDetails });
        setEditingDetails(false);
    };

    return (
        <div
            className="task-card"
            style={{
                fontFamily: getFontForTheme(theme),
                backgroundColor: isOverdue() ? '#ff7f7f' : getPriorityColor(task.priority),
                color: '#000',
                border: isOverdue() ? '2px solid red' : '2px solid #ccc',
                marginBottom: '10px',
                padding: '12px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'default'
            }}
        >
            {/* Top Bar */}
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpanded(prev => !prev)}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleComplete(task.id)}
                        style={{ marginRight: '10px' }}
                    />
                    <span style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? '#888' : '#000',
                        transition: 'all 0.2s ease'
                    }}>
                        {task.text}
                    </span>
                    {task.tag && (
                        <span
                            style={{
                                marginLeft: '10px',
                                backgroundColor: '#eee',
                                padding: '2px 6px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            {task.tag}
                        </span>
                    )}
                </div>

                {/* Always show Time Spent */}
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {Math.floor((task.timeSpent || 0) / 60).toString().padStart(2, '0')}:
                    {((task.timeSpent || 0) % 60).toString().padStart(2, '0')}
                </div>
            </div>

            {/* Expandable Section */}
            <div
                style={{
                    maxHeight: expanded ? '1000px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease',
                    backgroundColor: expanded ? '#f9f9f9' : 'transparent',
                    padding: expanded ? '10px' : '0',
                    borderRadius: expanded ? '8px' : '0',
                    marginTop: expanded ? '10px' : '0',
                    opacity: expanded ? 1 : 0,
                    transitionProperty: 'max-height, opacity',
                }}
            >
                {expanded && (
                    <>
                        {/* Due Date */}
                        {task.dueDate && (
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                Due: {task.dueDate}
                            </div>
                        )}

                        {/* Details */}
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Details:</strong>
                            {editingDetails ? (
                                <>
                                    <textarea
                                        value={editedDetails}
                                        onChange={(e) => setEditedDetails(e.target.value)}
                                        rows={3}
                                        style={{ width: '100%', marginTop: '5px', padding: '8px' }}
                                    />
                                    <button
                                        style={{
                                            ...getButtonStyle(theme),
                                            marginTop: '5px',
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleSaveDetails}
                                    >
                                        Save Details
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ marginTop: '5px', marginBottom: '5px' }}>
                                        {task.details || 'No details yet.'}
                                    </div>
                                    <button
                                        style={{
                                            ...getButtonStyle(theme),
                                            padding: '2px 6px',
                                            fontSize: '12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            marginTop: '3px'
                                        }}
                                        onClick={() => setEditingDetails(true)}
                                    >
                                        Edit Details
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Focus Button(s) */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '10px' }}>
                            {focusedTaskId === task.id ? (
                                <>
                                    <button
                                        style={{
                                            ...getButtonStyle(theme),
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isFocusPaused) {
                                                onResumeFocus();
                                            } else {
                                                onPauseFocus();
                                            }
                                        }}
                                    >
                                        {isFocusPaused ? 'Resume Focus' : 'Pause Focus'}
                                    </button>

                                    <button
                                        style={{
                                            ...getButtonStyle(theme),
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            border: '2px solid #e74c3c'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStopFocus();
                                        }}
                                    >
                                        Stop Focus
                                    </button>
                                </>
                            ) : (
                                <button
                                    style={{
                                        ...getButtonStyle(theme),
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onStartFocus(task.id);
                                    }}
                                >
                                    Start Focus
                                </button>
                            )}
                        </div>

                        {/* Checklist */}
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Checklist:</strong>
                            <ul style={{ listStyleType: 'none', paddingLeft: '0', marginTop: '5px' }}>
                                {task.subtasks.map((subtask, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: '#fff',
                                            margin: '5px 0',
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            textDecoration: subtask.completed ? 'line-through' : 'none',
                                            color: subtask.completed ? '#888' : '#000'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={subtask.completed}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onToggleSubtask(task.id, index);
                                            }}
                                            style={{ marginRight: '10px' }}
                                        />
                                        {subtask.text}
                                    </li>
                                ))}
                            </ul>

                            {/* New Subtask Input */}
                            <div style={{ display: 'flex', marginTop: '5px' }}>
                                <input
                                    type="text"
                                    placeholder="New subtask..."
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    style={{ padding: '5px', flex: '1' }}
                                />
                                <button
                                    style={{
                                        ...getButtonStyle(theme),
                                        marginLeft: '5px',
                                        padding: '5px 8px',
                                        borderRadius: '5px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (newSubtask.trim()) {
                                            onAddSubtask(task.id, newSubtask);
                                            setNewSubtask('');
                                        }
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Delete Task */}
                        <button
                            style={{
                                ...getButtonStyle(theme),
                                marginTop: '10px',
                                padding: '5px 12px',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                border: '2px solid #e74c3c'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                        >
                            Delete Task
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default TaskCard;
