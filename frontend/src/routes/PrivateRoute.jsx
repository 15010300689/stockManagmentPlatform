import React, { useEffect, useState } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { isAuthenticated, authFetch, clearAuth } from '../auth';

const API_BASE = '/api';

function PrivateRoute({ children, ...rest }) {
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        // checkAuth();
    }, []);

    const checkAuth = async () => {
        if (!isAuthenticated()) {
            setIsValid(false);
            return;
        }

        try {
            const response = await authFetch(`${API_BASE}/verify`);
            const data = await response.json();
            if (response.ok && data.valid) {
                setIsValid(true);
            } else {
                clearAuth();
                setIsValid(false);
            }
        } catch (error) {
            console.error('验证token失败:', error);
            clearAuth();
            setIsValid(false);
        }
    };

    // if (isValid === null) {
    //     return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>加载中...</div>;
    // }

    return isValid ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

export default PrivateRoute;
