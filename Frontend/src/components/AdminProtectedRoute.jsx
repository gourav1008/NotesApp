import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4">
                <LoaderIcon className="animate-spin w-12 h-12 text-primary" />
                <p className="text-base-content/70 animate-pulse">Verifying admin access...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        toast.error('Please login to access the admin dashboard', {
            icon: '🔒',
            duration: 4000
        });
        return <Navigate to="/login" replace />;
    }

    if (!user || !user.isAdmin) {
        toast.error('Access denied. This area requires admin privileges', {
            icon: '⚠️',
            duration: 4000
        });
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
