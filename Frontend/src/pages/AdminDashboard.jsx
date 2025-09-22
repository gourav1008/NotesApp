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
    UserIcon,
    ShieldIcon
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
    // Removed unused state variable isMobileMenuOpen

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
        <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <Link 
                        to="/" 
                        className="btn btn-ghost btn-sm gap-2 hover:gap-3 transition-all duration-200 min-h-10 h-auto px-3 py-2"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>Back to Notes</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                            <ShieldIcon className="w-4 h-4 text-secondary-content" />
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content">Admin Dashboard</h1>
                    </div>
                </div>

                {/* Responsive Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`btn ${
                                activeTab === tab.id 
                                    ? 'btn-primary' 
                                    : 'btn-ghost hover:bg-base-200'
                            } w-full gap-2 transition-all duration-200`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            <span className="text-sm sm:text-base">{tab.label}</span>
                            {tab.id === 'users' && (
                                <div className="badge badge-sm badge-ghost">12</div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300/50">
                    <div className="card-body p-4 sm:p-6 lg:p-8">
                        {activeTab === 'users' && !selectedUserId && (
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-base-content">All Users</h2>
                                        <p className="text-sm text-base-content/70 mt-1">Manage user accounts and permissions</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="badge badge-primary badge-md gap-2">
                                            <UserIcon className="w-3 h-3" />
                                            Active Users
                                        </div>
                                        <div className="badge badge-ghost badge-md">
                                            Management
                                        </div>
                                    </div>
                                </div>
                                <UserList 
                                    onUserSelect={handleUserSelect} 
                                    onUserAction={handleUserAction}
                                />
                            </div>
                        )}

                        {activeTab === 'users' && selectedUserId && (
                            <div>
                                {/* Mobile User Header */}
                                <div className="sm:hidden mb-6">
                                    <button
                                        className="btn btn-ghost btn-sm gap-2 mb-4 hover:gap-3 transition-all duration-200"
                                        onClick={handleBackToUsers}
                                    >
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        Back to Users
                                    </button>
                                    {selectedUser && (
                                        <div className="bg-base-200/50 backdrop-blur-sm p-4 rounded-xl mb-4 border border-base-300/30">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold">
                                                            {selectedUser.name}
                                                        </span>
                                                        {selectedUser.isBlocked && (
                                                            <div className="badge badge-error badge-sm gap-1">
                                                                <XIcon className="w-3 h-3" />
                                                                Blocked
                                                            </div>
                                                        )}
                                                        {selectedUser.isAdmin && (
                                                            <div className="badge badge-primary badge-sm gap-1">
                                                                <ShieldIcon className="w-3 h-3" />
                                                                Admin
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-base-content/70 mt-1">{selectedUser.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="join w-full mb-4">
                                        <button
                                            className={`join-item btn btn-sm flex-1 ${
                                                !showAdminNotes ? 'btn-primary' : 'btn-ghost'
                                            }`}
                                            onClick={() => setShowAdminNotes(false)}
                                        >
                                            <NotebookIcon className="w-4 h-4" />
                                            User Notes
                                        </button>
                                        <button
                                            className={`join-item btn btn-sm flex-1 ${
                                                showAdminNotes ? 'btn-primary' : 'btn-ghost'
                                            }`}
                                            onClick={() => setShowAdminNotes(true)}
                                        >
                                            <StickyNoteIcon className="w-4 h-4" />
                                            Admin Notes
                                        </button>
                                    </div>
                                </div>

                                {/* Desktop User Header */}
                                <div className="hidden sm:block mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl sm:text-2xl font-bold">
                                                {showAdminNotes ? 'Admin Notes' : 'User Notes'}
                                            </h2>
                                            <div className="badge badge-ghost">User Management</div>
                                        </div>
                                        <button
                                            className="btn btn-ghost btn-sm gap-2 hover:gap-3 transition-all duration-200"
                                            onClick={handleBackToUsers}
                                        >
                                            <XIcon className="w-4 h-4" />
                                            Close
                                        </button>
                                    </div>
                                    
                                    {selectedUser && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">
                                                            {selectedUser.name}
                                                        </span>
                                                        {selectedUser.isBlocked && (
                                                            <div className="badge badge-error badge-sm gap-1">
                                                                <XIcon className="w-3 h-3" />
                                                                Blocked
                                                            </div>
                                                        )}
                                                        {selectedUser.isAdmin && (
                                                            <div className="badge badge-primary badge-sm gap-1">
                                                                <ShieldIcon className="w-3 h-3" />
                                                                Admin
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-base-content/70">{selectedUser.email}</p>
                                                </div>
                                            </div>
                                            <div className="join">
                                                <button
                                                    className={`join-item btn btn-sm gap-2 ${
                                                        !showAdminNotes ? 'btn-primary' : 'btn-ghost'
                                                    }`}
                                                    onClick={() => setShowAdminNotes(false)}
                                                >
                                                    <NotebookIcon className="w-4 h-4" />
                                                    User Notes
                                                </button>
                                                <button
                                                    className={`join-item btn btn-sm gap-2 ${
                                                        showAdminNotes ? 'btn-primary' : 'btn-ghost'
                                                    }`}
                                                    onClick={() => setShowAdminNotes(true)}
                                                >
                                                    <StickyNoteIcon className="w-4 h-4" />
                                                    Admin Notes
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-base-content">User Messages</h2>
                                    <div className="badge badge-info badge-sm sm:badge-md">
                                        Communication
                                    </div>
                                </div>
                                <MessagingInterface />
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div>
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-base-content">Admin Action Logs</h2>
                                    <div className="badge badge-warning badge-sm sm:badge-md">
                                        Audit Trail
                                    </div>
                                </div>
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