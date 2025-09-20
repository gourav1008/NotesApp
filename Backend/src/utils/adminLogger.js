import AdminLog from '../models/AdminLog.js';

/**
 * Log admin actions for audit trail
 * @param {String} adminId - ID of the admin performing the action
 * @param {String} actionType - Type of action being performed
 * @param {String} targetUserId - ID of the user being affected
 * @param {String} details - Additional details about the action
 */
export const logAdminAction = async (adminId, actionType, targetUserId, details) => {
    try {
        const log = new AdminLog({
            adminId,
            actionType,
            targetUserId,
            details
        });
        await log.save();
        console.log(`Admin action logged: ${actionType} by ${adminId} on ${targetUserId}`);
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // Don't throw error to prevent breaking the main operation
    }
};

/**
 * Get admin action logs with pagination and filtering
 * @param {Object} filters - Filters for the logs
 * @param {Number} page - Page number
 * @param {Number} limit - Number of logs per page
 */
export const getAdminLogs = async (filters = {}, page = 1, limit = 50) => {
    try {
        const skip = (page - 1) * limit;
        const query = {};

        // Apply filters
        if (filters.adminId) query.adminId = filters.adminId;
        if (filters.actionType) query.actionType = filters.actionType;
        if (filters.targetUserId) query.targetUserId = filters.targetUserId;
        if (filters.dateFrom) query.timestamp = { $gte: new Date(filters.dateFrom) };
        if (filters.dateTo) {
            query.timestamp = { 
                ...query.timestamp, 
                $lte: new Date(filters.dateTo) 
            };
        }

        const logs = await AdminLog.find(query)
            .populate('adminId', 'name email')
            .populate('targetUserId', 'name email')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AdminLog.countDocuments(query);

        return {
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Failed to get admin logs:', error);
        throw error;
    }
};

export default { logAdminAction, getAdminLogs };
