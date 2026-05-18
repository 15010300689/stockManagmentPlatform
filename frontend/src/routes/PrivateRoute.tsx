import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getMenuPaths, isAuthenticated } from '../auth';

interface PrivateRouteProps {
    children?: JSX.Element;
}

function PrivateRoute({ children }: PrivateRouteProps): JSX.Element {
    const location = useLocation();
    const menuPaths = getMenuPaths();
    const currentPath = location.pathname;
    // 首页 / 与 /welcome 不依赖菜单权限
    const isPublicAuthedPage = currentPath === '/'
        || currentPath === '/no-access'
        || currentPath === '/welcome';
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isPublicAuthedPage) {
        return children || <Outlet />;
    }

    if (menuPaths.length === 0) {
        return <Navigate to="/no-access" replace />;
    }

    const isPermissionEntry = currentPath === '/permission' && menuPaths.includes('/permission/menu');
    const isAllowed = menuPaths.includes(currentPath) || isPermissionEntry;
    if (!isAllowed) {
        return <Navigate to="/no-access" replace />;
    }

    return children || <Outlet />;
}

export default PrivateRoute;
