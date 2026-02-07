import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute component - protects routes based on authentication and role
 * @param {Object} props
 * @param {import("react").ReactNode} props.children
 * @param {string} props.allowedRole - Role required to access the route (e.g., 'COMPANY', 'CLIENT')
 */
export const ProtectedRoute = ({ children, allowedRole }) => {
    const location = useLocation();
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user");

    // 1. Not logged in -> Redirect to Login
    if (!token || !userStr) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const user = JSON.parse(userStr);

        // 2. Role mismatch -> Redirect to appropriate dashboard
        if (allowedRole && user.role !== allowedRole) {
            console.warn(`Access denied: User role ${user.role} is not ${allowedRole}`);
            return <Navigate to={user.role === "CLIENT" ? "/client/dashboard" : "/dashboard"} replace />;
        }

        return children;
    } catch (e) {
        console.error("Error parsing user in ProtectedRoute", e);
        return <Navigate to="/login" replace />;
    }
};
