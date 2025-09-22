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
    StickyNoteIcon,
    SearchIcon,
    EyeIcon
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
        <div className="space-y-4 sm:space-y-6">
            {/* Mobile Search Section */}
            <div className="sm:hidden">
                <div className="form-control w-full mb-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="input input-bordered input-sm w-full pl-9 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
                    </div>
                </div>
                <div className="flex gap-2 mb-3">
                    <select
                        className="select select-bordered select-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        className="select select-bordered select-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="email-asc">Email A-Z</option>
                        <option value="notesCount-desc">Most Notes</option>
                    </select>
                </div>
            </div>

            {/* Desktop Search and Filters */}
            <div className="hidden sm:flex flex-col lg:flex-row gap-4 items-center">
                <div className="form-control flex-1 w-full">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="input input-bordered w-full pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-50" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <select
                        className="select select-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="admin">Admin</option>
                    </select>
                    
                    <select
                        className="select select-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="email-asc">Email A-Z</option>
                        <option value="notesCount-desc">Most Notes</option>
                    </select>
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-base-content/70 mb-4">
                Showing {filteredAndSortedUsers.length} of {users.length} users
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filteredAndSortedUsers.map((user) => (
                    <div key={user._id} className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300/50 h-full">
                        <div className="card-body p-3 sm:p-4">
                            {/* Mobile Layout */}
                            <div className="sm:hidden">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="avatar placeholder">
                                        <div className="bg-primary text-primary-content rounded-full w-8">
                                            <span className="text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                                        <p className="text-xs text-base-content/70 truncate">{user.email}</p>
                                    </div>
                                    {getUserStatusBadge(user)}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                    <div className="bg-base-200 p-2 rounded">
                                        <span className="text-base-content/60">Notes</span>
                                        <p className="font-semibold">{user.notesCount || 0}</p>
                                    </div>
                                    <div className="bg-base-200 p-2 rounded">
                                        <span className="text-base-content/60">Joined</span>
                                        <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        className="btn btn-primary btn-xs flex-1 gap-1"
                                        onClick={() => onUserSelect(user._id)}
                                    >
                                        <EyeIcon className="w-3 h-3" />
                                        View
                                    </button>
                                    {canPerformAction(user, 'block') && (
                                        <button
                                            className={`btn btn-xs gap-1 ${
                                                user.isBlocked ? 'btn-success' : 'btn-warning'
                                            }`}
                                            onClick={() => openConfirmDialog(user.isBlocked ? 'unblock' : 'block', user, user.isBlocked ? 'unblock' : 'block')}
                                            disabled={actionLoading}
                                        >
                                            {user.isBlocked ? (
                                                <UserCheckIcon className="w-3 h-3" />
                                            ) : (
                                                <UserXIcon className="w-3 h-3" />
                                            )}
                                        </button>
                                    )}
                                    {canPerformAction(user, 'delete') && (
                                        <button
                                            className="btn btn-error btn-xs gap-1"
                                            onClick={() => openConfirmDialog('delete', user, 'delete')}
                                            disabled={actionLoading}
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden sm:block">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar placeholder">
                                            <div className="bg-primary text-primary-content rounded-full w-10 sm:w-12">
                                                <span className="text-sm sm:text-lg">{user.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base sm:text-lg">{user.name}</h3>
                                            <p className="text-xs sm:text-sm opacity-70">{user.email}</p>
                                        </div>
                                    </div>
                                    {getUserStatusBadge(user)}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <StickyNoteIcon className="h-4 w-4 opacity-60" />
                                        <span className="opacity-70">Notes:</span>
                                        <span className="font-semibold">{userStats[user._id]?.totalNotes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4 opacity-60" />
                                        <span className="opacity-70">Joined:</span>
                                        <span className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-primary btn-sm flex-1 gap-2"
                                        onClick={() => onUserSelect(user._id)}
                                    >
                                        <EyeIcon className="h-4 w-4" />
                                        View Profile
                                    </button>
                                    
                                    {canPerformAction(user, user.isBlocked ? 'unblock' : 'block') && (
                                        <button
                                            className={`btn btn-sm gap-2 ${
                                                user.isBlocked ? 'btn-success' : 'btn-warning'
                                            }`}
                                            onClick={() => openConfirmDialog(user.isBlocked ? 'unblock' : 'block', user, user.isBlocked ? 'unblock' : 'block')}
                                            disabled={actionLoading === user._id}
                                        >
                                            {user.isBlocked ? (
                                                <><UserCheckIcon className="h-4 w-4" /> Unblock</>
                                            ) : (
                                                <><UserXIcon className="h-4 w-4" /> Block</>
                                            )}
                                        </button>
                                    )}
                                    
                                    {canPerformAction(user, 'delete') && (
                                        <button
                                            className="btn btn-error btn-sm gap-2"
                                            onClick={() => openConfirmDialog('delete', user, 'delete')}
                                            disabled={actionLoading === user._id}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
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

export default UserList;
