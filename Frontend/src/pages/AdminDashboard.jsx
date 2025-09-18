import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon, NotebookIcon, MessageSquareIcon, ArrowLeftIcon, XIcon } from 'lucide-react';
import NotesManagement from '../components/NotesManagement';
import UserList from '../components/UserList';
import MessagingInterface from '../components/MessagingInterface';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [selectedUserId, setSelectedUserId] = useState(null);

    const tabs = [
        { id: 'users', label: 'All Users', icon: <UsersIcon className="h-5 w-5" /> },
        { id: 'messages', label: 'User Messages', icon: <MessageSquareIcon className="h-5 w-5" /> }
    ];

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
                                <UserList onUserSelect={setSelectedUserId} />
                            </div>
                        )}

                        {activeTab === 'users' && selectedUserId && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="card-title">User Notes</h2>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setSelectedUserId(null)}
                                    >
                                        <XIcon className="h-4 w-4" />
                                        Back to Users
                                    </button>
                                </div>
                                <NotesManagement userId={selectedUserId} />
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div>
                                <h2 className="card-title mb-4">User Messages</h2>
                                <MessagingInterface />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;