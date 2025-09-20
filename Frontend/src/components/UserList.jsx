import React, { useState, useEffect } from 'react';
import { 
    UserIcon, 
    ClockIcon, 
    BookOpenIcon, 
    ChevronRightIcon,
    ShieldIcon,
    ShieldOffIcon,
    TrashIcon,
    FilterIcon,
    SortAscIcon,
    SortDescIcon,
    UserCheckIcon,
    UserXIcon,
    StickyNoteIcon
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import ConfirmationDialog from './ConfirmationDialog';

const UserList = ({ onUserSelect, onUserAction }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, blocked, admin
    const [sortBy, setSortBy] = useState('createdAt'); // createdAt, name, email, notesCount
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        type: '',
        user: null,
        action: null
    });
    const [actionLoading, setActionLoading] = useState(null);

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

    const handleUserAction = async (action, userId, data = {}) => {
        setActionLoading(userId);
        try {
            let response;
            switch (action) {
                case 'block':
                    response = await api.patch(`/admin/users/${userId}/block`, data);
                    toast.success('User blocked successfully');
                    break;
                case 'unblock':
                    response = await api.patch(`/admin/users/${userId}/unblock`, data);
                    toast.success('User unblocked successfully');
                    break;
                case 'delete':
                    response = await api.delete(`/admin/users/${userId}`, { data });
                    toast.success('User deleted successfully');
                    break;
                default:
                    throw new Error('Invalid action');
            }
            
            // Refresh users list
            await fetchUsers();
            
            // Notify parent component if needed
            if (onUserAction) {
                onUserAction(action, userId, response.data);
            }
        } catch (error) {
            console.error(`Error ${action} user:`, error);
            toast.error(error.response?.data?.message || `Failed to ${action} user`);
        } finally {
            setActionLoading(null);
            setConfirmDialog({ isOpen: false, type: '', user: null, action: null });
        }
    };

    const openConfirmDialog = (type, user, action) => {
        setConfirmDialog({
            isOpen: true,
            type,
            user,
            action
        });
    };

    const handleConfirmAction = () => {
        const { action, user } = confirmDialog;
        const data = {};
        
        if (action === 'delete') {
            data.confirmation = 'DELETE';
        }
        
        handleUserAction(action, user._id, data);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    const filteredAndSortedUsers = users
        .filter(user => {
            // Text search filter
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Status filter
            let matchesStatus = true;
            switch (statusFilter) {
                case 'active':
                    matchesStatus = !user.isBlocked && !user.isAdmin;
                    break;
                case 'blocked':
                    matchesStatus = user.isBlocked;
                    break;
                case 'admin':
                    matchesStatus = user.isAdmin;
                    break;
                default:
                    matchesStatus = true;
            }
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'notesCount':
                    aValue = userStats[a._id]?.totalNotes || 0;
                    bValue = userStats[b._id]?.totalNotes || 0;
                    break;
                default: // createdAt
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const getUserStatusBadge = (user) => {
        if (user.isAdmin) {
            return (
                <div className="badge badge-primary gap-1">
                    <ShieldIcon className="h-3 w-3" />
                    Admin
                </div>
            );
        }
        if (user.isBlocked) {
            return (
                <div className="badge badge-error gap-1">
                    <UserXIcon className="h-3 w-3" />
                    Blocked
                </div>
            );
        }
        return (
            <div className="badge badge-success gap-1">
                <UserCheckIcon className="h-3 w-3" />
                Active
            </div>
        );
    };

    const canPerformAction = (user, action) => {
        if (user.isAdmin) return false; // Can't perform actions on admin users
        
        switch (action) {
            case 'block':
                return !user.isBlocked;
            case 'unblock':
                return user.isBlocked;
            case 'delete':
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="form-control">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="input input-bordered input-sm w-full pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Status Filter */}
                        <div className="form-control">
                            <select 
                                className="select select-bordered select-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Users</option>
                                <option value="active">Active Users</option>
                                <option value="blocked">Blocked Users</option>
                                <option value="admin">Admin Users</option>
                            </select>
                        </div>
                        
                        {/* Sort By */}
                        <div className="form-control">
                            <select 
                                className="select select-bordered select-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="createdAt">Date Created</option>
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                                <option value="notesCount">Notes Count</option>
                            </select>
                        </div>
                        
                        {/* Sort Order */}
                        <div className="form-control">
                            <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                {sortOrder === 'asc' ? (
                                    <><SortAscIcon className="h-4 w-4" /> Ascending</>
                                ) : (
                                    <><SortDescIcon className="h-4 w-4" /> Descending</>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Results count */}
                    <div className="text-sm opacity-70 mt-2">
                        Showing {filteredAndSortedUsers.length} of {users.length} users
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredAndSortedUsers.map(user => {
                    const stats = userStats[user._id] || { totalNotes: 0, lastUpdate: null };
                    const isActionLoading = actionLoading === user._id;
                    
                    return (
                        <div
                            key={user._id}
                            className="card bg-base-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="card-body p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="avatar placeholder">
                                            <div className={`rounded-full w-12 ${
                                                user.isAdmin 
                                                    ? 'bg-primary text-primary-content'
                                                    : user.isBlocked 
                                                        ? 'bg-error text-error-content'
                                                        : 'bg-neutral text-neutral-content'
                                            }`}>
                                                <span className="text-xl">{user.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold">{user.name}</h3>
                                                {getUserStatusBadge(user)}
                                            </div>
                                            <p className="text-base-content/70 text-sm">{user.email}</p>
                                            
                                            <div className="flex items-center gap-4 mt-2 text-xs opacity-70">
                                                <div className="flex items-center gap-1">
                                                    <BookOpenIcon className="h-3 w-3" />
                                                    <span>{stats.totalNotes} notes</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ClockIcon className="h-3 w-3" />
                                                    <span>
                                                        {stats.lastUpdate
                                                            ? `Updated ${new Date(stats.lastUpdate).toLocaleDateString()}`
                                                            : 'No activity'}
                                                    </span>
                                                </div>
                                                {user.isBlocked && user.blockedAt && (
                                                    <div className="flex items-center gap-1 text-error">
                                                        <UserXIcon className="h-3 w-3" />
                                                        <span>Blocked {new Date(user.blockedAt).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2">
                                        {/* View Notes */}
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => onUserSelect(user._id)}
                                            title="View user notes"
                                        >
                                            <StickyNoteIcon className="h-4 w-4" />
                                        </button>
                                        
                                        {/* Block/Unblock */}
                                        {canPerformAction(user, 'block') && (
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => openConfirmDialog('block', user, 'block')}
                                                disabled={isActionLoading}
                                                title="Block user"
                                            >
                                                {isActionLoading ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <ShieldOffIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        )}
                                        
                                        {canPerformAction(user, 'unblock') && (
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => openConfirmDialog('unblock', user, 'unblock')}
                                                disabled={isActionLoading}
                                                title="Unblock user"
                                            >
                                                {isActionLoading ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <ShieldIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        )}
                                        
                                        {/* Delete */}
                                        {canPerformAction(user, 'delete') && (
                                            <button
                                                className="btn btn-error btn-sm"
                                                onClick={() => openConfirmDialog('delete', user, 'delete')}
                                                disabled={isActionLoading}
                                                title="Delete user permanently"
                                            >
                                                {isActionLoading ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <TrashIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredAndSortedUsers.length === 0 && (
                <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 opacity-30" />
                    <p className="mt-4 text-lg">No users found</p>
                    <p className="text-sm opacity-70">Try adjusting your search or filters</p>
                </div>
            )}
            
            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'block'}
                onClose={() => setConfirmDialog({ isOpen: false, type: '', user: null, action: null })}
                onConfirm={handleConfirmAction}
                title="Block User"
                message={`Are you sure you want to block ${confirmDialog.user?.name}? They will not be able to access their account.`}
                confirmText="Block User"
                type="warning"
                isLoading={actionLoading !== null}
            />
            
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'unblock'}
                onClose={() => setConfirmDialog({ isOpen: false, type: '', user: null, action: null })}
                onConfirm={handleConfirmAction}
                title="Unblock User"
                message={`Are you sure you want to unblock ${confirmDialog.user?.name}? They will regain access to their account.`}
                confirmText="Unblock User"
                type="info"
                isLoading={actionLoading !== null}
            />
            
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete'}
                onClose={() => setConfirmDialog({ isOpen: false, type: '', user: null, action: null })}
                onConfirm={handleConfirmAction}
                title="Delete User Permanently"
                message={`This will permanently delete ${confirmDialog.user?.name} and all their data including notes, messages, and admin notes. This action cannot be undone.`}
                confirmText="Delete Permanently"
                type="danger"
                requiresTyping={true}
                typingConfirmation="DELETE"
                isLoading={actionLoading !== null}
            />
        </div>
    );
};

UserList.defaultProps = {
    onUserAction: null
};

export default UserList;