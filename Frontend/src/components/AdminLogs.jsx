import React, { useState, useEffect } from 'react';
import { 
    ClockIcon, 
    UserIcon, 
    ShieldIcon,
    TrashIcon,
    UserXIcon,
    UserCheckIcon,
    StickyNoteIcon,
    FilterIcon,
    RefreshCwIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        actionType: '',
        dateFrom: '',
        dateTo: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0
    });
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, pagination.limit]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value)
                )
            });

            const response = await api.get(`/admin/logs?${params}`);
            setLogs(response.data.logs || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.total || 0,
                totalPages: response.data.totalPages || 0
            }));
        } catch (error) {
            console.error('Error fetching admin logs:', error);
            toast.error('Failed to fetch admin logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchLogs();
    };

    const clearFilters = () => {
        setFilters({
            actionType: '',
            dateFrom: '',
            dateTo: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
        setTimeout(fetchLogs, 0);
    };

    const getActionIcon = (actionType) => {
        switch (actionType) {
            case 'DELETE_USER':
                return <TrashIcon className="h-4 w-4 text-error" />;
            case 'BLOCK_USER':
                return <UserXIcon className="h-4 w-4 text-warning" />;
            case 'UNBLOCK_USER':
                return <UserCheckIcon className="h-4 w-4 text-success" />;
            case 'ADD_NOTE':
            case 'UPDATE_NOTE':
            case 'DELETE_NOTE':
                return <StickyNoteIcon className="h-4 w-4 text-info" />;
            default:
                return <ShieldIcon className="h-4 w-4 text-neutral" />;
        }
    };

    const getActionColor = (actionType) => {
        switch (actionType) {
            case 'DELETE_USER':
                return 'badge-error';
            case 'BLOCK_USER':
                return 'badge-warning';
            case 'UNBLOCK_USER':
                return 'badge-success';
            case 'ADD_NOTE':
            case 'UPDATE_NOTE':
            case 'DELETE_NOTE':
                return 'badge-info';
            default:
                return 'badge-neutral';
        }
    };

    const formatActionType = (actionType) => {
        return actionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ClockIcon className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Admin Action Logs</h3>
                    <div className="badge badge-neutral">{pagination.total}</div>
                </div>
                <button
                    className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`}
                    onClick={fetchLogs}
                    disabled={loading}
                >
                    {!loading && <RefreshCwIcon className="h-4 w-4" />}
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="form-control">
                            <label className="label label-text-alt">Action Type</label>
                            <select
                                className="select select-bordered select-sm"
                                value={filters.actionType}
                                onChange={(e) => handleFilterChange('actionType', e.target.value)}
                            >
                                <option value="">All Actions</option>
                                <option value="DELETE_USER">Delete User</option>
                                <option value="BLOCK_USER">Block User</option>
                                <option value="UNBLOCK_USER">Unblock User</option>
                                <option value="ADD_NOTE">Add Note</option>
                                <option value="UPDATE_NOTE">Update Note</option>
                                <option value="DELETE_NOTE">Delete Note</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label label-text-alt">From Date</label>
                            <input
                                type="date"
                                className="input input-bordered input-sm"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label label-text-alt">To Date</label>
                            <input
                                type="date"
                                className="input input-bordered input-sm"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label label-text-alt">&nbsp;</label>
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-primary btn-sm flex-1"
                                    onClick={applyFilters}
                                >
                                    <FilterIcon className="h-4 w-4" />
                                    Apply
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={clearFilters}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-2">
                {logs.map(log => (
                    <div key={log._id} className="card bg-base-100 shadow-sm">
                        <div className="card-body p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="mt-1">
                                        {getActionIcon(log.actionType)}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`badge ${getActionColor(log.actionType)} badge-sm`}>
                                                {formatActionType(log.actionType)}
                                            </div>
                                            <span className="text-sm opacity-70">
                                                by {log.adminId?.name || 'Unknown Admin'}
                                            </span>
                                            <span className="text-sm opacity-70">
                                                on {log.targetUserId?.name || 'Unknown User'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs opacity-60 mb-2">
                                            <ClockIcon className="h-3 w-3" />
                                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                                            <UserIcon className="h-3 w-3 ml-2" />
                                            <span>{log.targetUserId?.email || 'Unknown Email'}</span>
                                        </div>

                                        {expandedLog === log._id ? (
                                            <div className="bg-base-200 p-3 rounded text-sm">
                                                <strong>Details:</strong>
                                                <p className="mt-1 whitespace-pre-wrap">{log.details}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm line-clamp-2">{log.details}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <button
                                    className="btn btn-ghost btn-xs"
                                    onClick={() => setExpandedLog(
                                        expandedLog === log._id ? null : log._id
                                    )}
                                >
                                    {expandedLog === log._id ? (
                                        <ChevronUpIcon className="h-4 w-4" />
                                    ) : (
                                        <ChevronDownIcon className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {logs.length === 0 && (
                <div className="text-center py-8">
                    <ClockIcon className="mx-auto h-12 w-12 opacity-30" />
                    <p className="mt-4 text-lg">No admin logs found</p>
                    <p className="text-sm opacity-70">Admin actions will appear here</p>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center">
                    <div className="join">
                        <button
                            className="join-item btn btn-sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1 || loading}
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.page >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    className={`join-item btn btn-sm ${
                                        pageNum === pagination.page ? 'btn-active' : ''
                                    }`}
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={loading}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
                        <button
                            className="join-item btn btn-sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages || loading}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Results info */}
            <div className="text-center text-sm opacity-70">
                Showing {logs.length} of {pagination.total} logs
                {pagination.totalPages > 1 && (
                    <span> (Page {pagination.page} of {pagination.totalPages})</span>
                )}
            </div>
        </div>
    );
};

export default AdminLogs;
