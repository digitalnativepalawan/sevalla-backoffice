import React, { useState, useEffect, useMemo, useRef } from 'react';
import Button from '../components/ui/Button';
import { getTasks, addTaskComment, addTaskAttachment, addTask } from '../services/mockApi';
import { Task, TaskStatus, TaskPriority } from '../types';
import { PlusIcon, UserCircleIcon, CalendarIcon, FlagIcon, ClipboardListIcon, CogIcon, ExclamationCircleIcon, CheckCircleIcon, ChatBubbleLeftIcon, PaperClipIcon, PhotoIcon } from '../components/Icons';
import { formatDate, formatTimeAgo } from '../utils/formatters';
import Modal from '../components/ui/Modal';

const assigneeMap: { [key: string]: string } = {
    'staff-1': 'John Doe',
    'manager-1': 'Jane Smith',
    'admin': 'Admin User',
};

const statusConfig = {
    [TaskStatus.TODO]: { title: 'To Do', color: 'text-gray-400', icon: ClipboardListIcon },
    [TaskStatus.IN_PROGRESS]: { title: 'In Progress', color: 'text-blue-400', icon: CogIcon },
    [TaskStatus.BLOCKED]: { title: 'Blocked', color: 'text-red-400', icon: ExclamationCircleIcon },
    [TaskStatus.DONE]: { title: 'Done', color: 'text-green-400', icon: CheckCircleIcon },
};

const priorityConfig = {
    [TaskPriority.LOW]: { label: 'Low', color: 'text-gray-400' },
    [TaskPriority.MEDIUM]: { label: 'Medium', color: 'text-yellow-400' },
    [TaskPriority.HIGH]: { label: 'High', color: 'text-red-400' },
};

const NewTaskForm: React.FC<{
    onClose: () => void;
    onTaskAdded: (newTask: Task) => void;
}> = ({ onClose, onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState('staff-1');
    const [priority, setPriority] = useState(TaskPriority.MEDIUM);
    const [dueDate, setDueDate] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [urlInput, setUrlInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addToCalendar, setAddToCalendar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulate upload and get a URL.
            // In a real app, this would upload to a server.
            const fakeUrl = `https://picsum.photos/seed/${Math.random()}/200/300`; // Using picsum for placeholder
            setAttachments(prev => [...prev, fakeUrl]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddUrl = () => {
        if (urlInput.trim()) {
            setAttachments(prev => [...prev, urlInput.trim()]);
            setUrlInput('');
        }
    };

    const handleRemoveAttachment = (urlToRemove: string) => {
        setAttachments(prev => prev.filter(url => url !== urlToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const newTaskData = {
                title,
                description,
                assignee,
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                attachments: attachments.length > 0 ? attachments : undefined,
                comments: [],
            };
            // The status, createdBy, etc., will be set by the API
            const newTask = await addTask(newTaskData); 
            onTaskAdded(newTask);
            onClose();
        } catch (error) {
            console.error("Failed to add task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClasses = "bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#8A5CF6] focus:border-[#8A5CF6] outline-none";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs text-gray-400 mb-1 block">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required autoFocus />
            </div>
            <div>
                <label className="text-xs text-gray-400 mb-1 block">Description (optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Assignee</label>
                    <select value={assignee} onChange={e => setAssignee(e.target.value)} className={inputClasses}>
                        {Object.entries(assigneeMap).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={inputClasses}>
                        {Object.entries(priorityConfig).map(([level, {label}]) => (
                            <option key={level} value={level}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="flex items-center">
                <input
                    id="addToCalendar"
                    type="checkbox"
                    checked={addToCalendar}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setAddToCalendar(isChecked);
                        if (!isChecked) {
                            setDueDate('');
                        }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[#8A5CF6] focus:ring-[#8A5CF6] bg-[#0D0D12]"
                />
                <label htmlFor="addToCalendar" className="ml-2 text-sm text-gray-300">
                    Add to Company Calendar
                </label>
            </div>
            
            {addToCalendar && (
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
                    <input 
                        type="date" 
                        value={dueDate} 
                        onChange={e => setDueDate(e.target.value)} 
                        className={inputClasses} 
                        required 
                    />
                </div>
            )}

            <div>
                <label className="text-xs text-gray-400 mb-1 block">Attachments</label>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input type="url" placeholder="Paste image URL (e.g., from Google)" value={urlInput} onChange={e => setUrlInput(e.target.value)} className={inputClasses} />
                        <Button type="button" variant="secondary" onClick={handleAddUrl} disabled={!urlInput.trim()}>Add URL</Button>
                        <Button type="button" variant="secondary" leftIcon={<PhotoIcon/>} onClick={() => fileInputRef.current?.click()}>Upload</Button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    </div>
                    {attachments.map((url, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#0D0D12] p-2 rounded-lg">
                            <div className="flex items-center gap-2 truncate">
                                <img src={url} alt="attachment preview" className="h-8 w-8 rounded object-cover flex-shrink-0" />
                                <span className="text-sm text-blue-400 truncate">{url}</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveAttachment(url)} className="text-gray-400 hover:text-white text-lg">&times;</button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isSubmitting || !title.trim()}>
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
};

const TaskDetailModal: React.FC<{
    task: Task | null;
    onClose: () => void;
    onUpdate: (updatedTask: Task) => void;
}> = ({ task, onClose, onUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);


    if (!task) return null;
    
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Assume current user is 'admin' for simplicity
            const updatedTask = await addTaskComment(task.id, newComment, 'admin');
            onUpdate(updatedTask);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attachmentUrl.trim()) return;
        try {
            const updatedTask = await addTaskAttachment(task.id, attachmentUrl);
            onUpdate(updatedTask);
            setAttachmentUrl('');
        } catch (error) { 
            console.error('Failed to add link attachment:', error);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            // In a real app, this would involve uploading the file to a server/storage
            // and getting a URL back. Here we just simulate it with a placeholder.
            const fakeUrl = `local-file/${file.name}`; 
            const updatedTask = await addTaskAttachment(task.id, fakeUrl);
            onUpdate(updatedTask);
            if(fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) { 
             console.error('Failed to add file attachment:', error);
        }
    };
    
    const priority = priorityConfig[task.priority];
    const assigneeName = assigneeMap[task.assignee] || task.assignee;

    return (
        <Modal isOpen={!!task} onClose={onClose} title={task.title} size="lg">
            <div className="space-y-6">
                 <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-300" title="Assignee">
                        <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span>{assigneeName}</span>
                    </div>
                    {task.dueDate && (
                        <div className="flex items-center text-gray-300" title="Due Date">
                            <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{formatDate(task.dueDate)}</span>
                        </div>
                    )}
                    <div className={`flex items-center font-medium ${priority.color}`} title="Priority">
                        <FlagIcon className="h-5 w-5 mr-2" />
                        <span>{priority.label}</span>
                    </div>
                </div>

                {task.description && (
                    <div>
                        <h4 className="font-semibold text-white mb-2">Description</h4>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{task.description}</p>
                    </div>
                )}
                 
                 <div>
                    <h4 className="font-semibold text-white mb-3">Attachments</h4>
                    <div className="space-y-2">
                        {task.attachments?.map((att, index) => (
                             <a key={index} href={att} target="_blank" rel="noopener noreferrer" className="flex items-center bg-[#0D0D12] p-2 rounded-lg hover:bg-[#2D2D3A] transition-colors">
                                <PaperClipIcon className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-blue-400 truncate">{att.startsWith('local-file/') ? att.substring(11) : att}</span>
                            </a>
                        ))}
                    </div>
                    <form onSubmit={handleAddLink} className="mt-4 flex gap-2 items-center">
                        <input
                            type="url"
                            value={attachmentUrl}
                            onChange={(e) => setAttachmentUrl(e.target.value)}
                            placeholder="Add a link..."
                            className="flex-grow bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#8A5CF6] focus:border-[#8A5CF6] outline-none"
                        />
                        <Button type="submit" variant="secondary" disabled={!attachmentUrl.trim()}>Add Link</Button>
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>Upload</Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    </form>
                </div>

                <div>
                    <h4 className="font-semibold text-white mb-3 pt-4 border-t border-[#2D2D3A]">Comments</h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {task.comments && task.comments.length > 0 ? (
                            task.comments.slice().reverse().map((comment, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <UserCircleIcon className="h-8 w-8 text-gray-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="flex items-baseline space-x-2">
                                            <p className="font-semibold text-white text-sm">{assigneeMap[comment.userId] || comment.userId}</p>
                                            <p className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</p>
                                        </div>
                                        <p className="text-sm text-gray-300 bg-[#0D0D12] p-2 rounded-lg mt-1 whitespace-pre-wrap">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic">No comments yet.</p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-[#2D2D3A]">
                    <div className="flex items-start space-x-3">
                        <UserCircleIcon className="h-8 w-8 text-gray-500 flex-shrink-0" />
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={2}
                                className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#8A5CF6] focus:border-[#8A5CF6] outline-none transition"
                            />
                            <div className="mt-2 text-right">
                                <Button type="submit" variant="primary" disabled={!newComment.trim() || isSubmitting}>
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

const TaskCard: React.FC<{ task: Task; onClick: (task: Task) => void; }> = ({ task, onClick }) => {
    const assigneeName = assigneeMap[task.assignee] || task.assignee;
    const priority = priorityConfig[task.priority];
    
    return (
        <div onClick={() => onClick(task)} className="bg-[#1A1A23] border border-[#2D2D3A] p-4 rounded-lg shadow-md cursor-pointer hover:bg-[#2D2D3A] transition-colors duration-200">
            <p className="font-semibold text-white text-sm mb-2">{task.title}</p>
            {task.description && <p className="text-xs text-gray-400 mt-2 mb-3 line-clamp-2">{task.description}</p>}
            <div className="flex justify-between items-center mt-4">
                 <div className="flex items-center space-x-4 text-xs text-gray-400">
                    {task.attachments && task.attachments.length > 0 && (
                        <div className="flex items-center" title="Attachments">
                            <PaperClipIcon className="h-4 w-4 mr-1" />
                            <span>{task.attachments.length}</span>
                        </div>
                    )}
                    {task.comments && task.comments.length > 0 && (
                        <div className="flex items-center" title="Comments">
                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                            <span>{task.comments.length}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs text-gray-400" title={`Assignee: ${assigneeName}`}>
                        <UserCircleIcon className="h-5 w-5" />
                    </div>
                    <div className={`flex items-center text-xs font-medium ${priority.color}`} title={`Priority: ${priority.label}`}>
                        <FlagIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{ status: TaskStatus; tasks: Task[]; onTaskClick: (task: Task) => void }> = ({ status, tasks, onTaskClick }) => {
    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <div className="bg-[#14141B] rounded-lg p-3 w-80 flex-shrink-0 flex flex-col">
            <div className="flex justify-between items-center mb-4 px-1">
                <div className={`flex items-center font-semibold ${config.color}`}>
                    <StatusIcon className="h-5 w-5 mr-2" />
                    <h3 className="text-white">{config.title}</h3>
                </div>
                <span className="text-sm text-gray-400 bg-[#0D0D12] px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {tasks.map(task => <TaskCard key={task.id} task={task} onClick={onTaskClick} />)}
            </div>
        </div>
    );
};

const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getTasks();
            setTasks(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const tasksByStatus = useMemo(() => {
        return tasks.reduce((acc, task) => {
            if (!acc[task.status]) {
                acc[task.status] = [];
            }
            acc[task.status].push(task);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks]);
    
    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        if (selectedTask?.id === updatedTask.id) {
            setSelectedTask(updatedTask); // Keep modal view in sync if it's open
        }
    };
    
    const handleTaskAdded = (newTask: Task) => {
        setTasks(prev => [newTask, ...prev]);
    };


    return (
        <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold text-white">Tasks Board</h1>
                    <p className="text-gray-400 mt-1">Organize, assign, and track your team's work.</p>
                </div>
                <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => setIsNewTaskModalOpen(true)}>New Task</Button>
            </div>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">Loading tasks...</div>
            ) : (
                <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                    {(Object.keys(statusConfig) as TaskStatus[]).map(status => (
                        <KanbanColumn key={status} status={status} tasks={tasksByStatus[status] || []} onTaskClick={handleTaskClick} />
                    ))}
                </div>
            )}
             <TaskDetailModal
                task={selectedTask}
                onClose={handleCloseModal}
                onUpdate={handleTaskUpdate}
            />
            <Modal
                isOpen={isNewTaskModalOpen}
                onClose={() => setIsNewTaskModalOpen(false)}
                title="Create New Task"
                size="lg"
            >
                <NewTaskForm
                    onClose={() => setIsNewTaskModalOpen(false)}
                    onTaskAdded={handleTaskAdded}
                />
            </Modal>
        </div>
    );
};

export default Tasks;
