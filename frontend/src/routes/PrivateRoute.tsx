import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../auth';

interface PrivateRouteProps {
    children: JSX.Element;
}

function PrivateRoute({ children }: PrivateRouteProps): JSX.Element {
    const location = useLocation();
    return isAuthenticated()
        ? children
        : <Navigate to="/login" state={{ from: location }} replace />;
}

export default PrivateRoute;
