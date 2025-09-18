import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <LoaderIcon className="animate-spin size-10" />
            </div>
        );
    }

    if (!isAuthenticated) {
        toast.error('Please login to access admin dashboard');
        return <Navigate to="/login" replace />;
    }

    if (!user || !user.isAdmin) {
        toast.error('Access denied. Admin privileges required');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
