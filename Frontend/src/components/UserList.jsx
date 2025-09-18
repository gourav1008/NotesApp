import React, { useState, useEffect } from 'react';
import { UserIcon, ClockIcon, BookOpenIcon, ChevronRightIcon } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const UserList = ({ onUserSelect }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const [usersResponse, statsResponse] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/user-stats')
            ]);

            setUsers(usersResponse.data);
            setUserStats(statsResponse.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="form-control">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        className="input input-bordered w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => {
                    const stats = userStats[user._id] || { totalNotes: 0, lastUpdate: null };
                    return (
                        <div
                            key={user._id}
                            className="card bg-base-200 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full"
                            onClick={() => onUserSelect(user._id)}
                        >
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-full w-12">
                                                <span className="text-xl">{user.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{user.name}</h3>
                                            <p className="text-base-content/70">{user.email}</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon className="h-6 w-6 opacity-50" />
                                </div>
                                <div className="divider my-2"></div>
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <BookOpenIcon className="h-4 w-4" />
                                        <span>{stats.totalNotes} notes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4" />
                                        <span>
                                            {stats.lastUpdate
                                                ? `Last update: ${new Date(stats.lastUpdate).toLocaleDateString()}`
                                                : 'No notes yet'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 opacity-30" />
                    <p className="mt-4 text-lg">No users found</p>
                </div>
            )}
        </div>
    );
};

export default UserList;