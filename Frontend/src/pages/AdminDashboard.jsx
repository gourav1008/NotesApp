import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    UsersIcon, 
    NotebookIcon, 
    MessageSquareIcon, 
    ArrowLeftIcon, 
    XIcon,
    ClockIcon,
    StickyNoteIcon,
    UserIcon
} from 'lucide-react';
import NotesManagement from '../components/NotesManagement';
import UserList from '../components/UserList';
import MessagingInterface from '../components/MessagingInterface';
import AdminNotes from '../components/AdminNotes';
import AdminLogs from '../components/AdminLogs';
import api from '../lib/axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAdminNotes, setShowAdminNotes] = useState(false);

    const tabs = [
        { id: 'users', label: 'All Users', icon: <UsersIcon className="h-5 w-5" /> },
        { id: 'messages', label: 'User Messages', icon: <MessageSquareIcon className="h-5 w-5" /> },
        { id: 'logs', label: 'Admin Logs', icon: <ClockIcon className="h-5 w-5" /> }
    ];

    const handleUserSelect = async (userId) => {
        setSelectedUserId(userId);
        setShowAdminNotes(false);
        
        // Fetch user details
        try {
            const response = await api.get(`/admin/user-details/${userId}`);
            setSelectedUser(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleUserAction = (action, userId, data) => {
        // Handle user action results if needed
        console.log(`User ${action} completed for ${userId}:`, data);
    };

    const handleBackToUsers = () => {
        setSelectedUserId(null);
        setSelectedUser(null);
        setShowAdminNotes(false);
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <Link to="/" className="btn btn-ghost">
                        <ArrowLeftIcon className="h-5 w-5" />
                        Back to Notes
                    </Link>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </div>

                <div className="tabs tabs-boxed mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'tab-active' : ''} gap-2`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="card bg-base-100">
                    <div className="card-body">
                        {activeTab === 'users' && !selectedUserId && (
                            <div>
                                <h2 className="card-title mb-4">All Users</h2>
                                <UserList 
                                    onUserSelect={handleUserSelect} 
                                    onUserAction={handleUserAction}
                                />
                            </div>
                        )}

                        {activeTab === 'users' && selectedUserId && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <h2 className="card-title">
                                            {showAdminNotes ? 'Admin Notes' : 'User Notes'}
                                        </h2>
                                        {selectedUser && (
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="h-4 w-4" />
                                                <span className="text-sm opacity-70">
                                                    {selectedUser.name} ({selectedUser.email})
                                                </span>
                                                {selectedUser.isBlocked && (
                                                    <div className="badge badge-error badge-sm">Blocked</div>
                                                )}
                                                {selectedUser.isAdmin && (
                                                    <div className="badge badge-primary badge-sm">Admin</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className={`btn btn-sm ${
                                                showAdminNotes ? 'btn-ghost' : 'btn-primary'
                                            }`}
                                            onClick={() => setShowAdminNotes(false)}
                                        >
                                            <NotebookIcon className="h-4 w-4" />
                                            User Notes
                                        </button>
                                        <button
                                            className={`btn btn-sm ${
                                                showAdminNotes ? 'btn-primary' : 'btn-ghost'
                                            }`}
                                            onClick={() => setShowAdminNotes(true)}
                                        >
                                            <StickyNoteIcon className="h-4 w-4" />
                                            Admin Notes
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={handleBackToUsers}
                                        >
                                            <XIcon className="h-4 w-4" />
                                            Back to Users
                                        </button>
                                    </div>
                                </div>
                                
                                {showAdminNotes ? (
                                    <AdminNotes 
                                        userId={selectedUserId} 
                                        userName={selectedUser?.name}
                                    />
                                ) : (
                                    <NotesManagement userId={selectedUserId} />
                                )}
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div>
                                <h2 className="card-title mb-4">User Messages</h2>
                                <MessagingInterface />
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div>
                                <h2 className="card-title mb-4">Admin Action Logs</h2>
                                <AdminLogs />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;