import React, { useState, useEffect } from 'react';
import { LoaderIcon, UserIcon, MailIcon, CalendarIcon } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            if (response.data && Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error('Invalid users data received:', response.data);
                setUsers([]);
                toast.error('Invalid users data received');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            toast.error(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <LoaderIcon className="animate-spin size-10" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="form-control flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="input input-bordered w-full pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 opacity-50" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                    <div key={user._id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="avatar placeholder">
                                    <div className="bg-neutral text-neutral-content rounded-full w-12">
                                        <span className="text-xl">{user.name?.charAt(0).toUpperCase() || '?'}</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{user.name || 'Unknown User'}</h3>
                                    <div className="flex items-center gap-2 text-sm opacity-70">
                                        <MailIcon className="size-4" />
                                        <span>{user.email || 'No email'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm opacity-70">
                                <CalendarIcon className="size-4" />
                                <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                            </div>

                            <div className="card-actions justify-end mt-4">
                                {user.isAdmin ? (
                                    <div className="badge badge-primary">Admin</div>
                                ) : (
                                    <div className="badge badge-ghost">User</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-lg opacity-70">No users found</p>
                </div>
            )}
        </div>
    );
};

export default UserManagement;