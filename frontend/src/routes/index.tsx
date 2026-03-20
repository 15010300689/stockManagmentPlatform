import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from './PrivateRoute';
import ProductManagement from '../pages/ProductManagement';
import AccountManagement from '../pages/AccountManagement';
import PermissionManagement from '../pages/PermissionManagement';
import RoleManagement from '../pages/RoleManagement';
import UserManagement from '../pages/UserManagement';
import StoreManagement from '../pages/NStoreManagement';
import PositionManagement from '../pages/PositionManagement';
import UnitManagement from '../pages/UnitManagement';
import CurrencyManagement from '../pages/CurrencyManagement';
import TransportManagement from '../pages/TransportManagement';

function AppRoutes(): JSX.Element {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/product" element={<PrivateRoute><MainLayout><ProductManagement /></MainLayout></PrivateRoute>} />
            <Route path="/account" element={<PrivateRoute><MainLayout><AccountManagement /></MainLayout></PrivateRoute>} />
            <Route path="/permission" element={<Navigate to="/permission/menu" replace />} />
            <Route path="/permission/menu" element={<PrivateRoute><MainLayout><PermissionManagement /></MainLayout></PrivateRoute>} />
            <Route path="/role" element={<PrivateRoute><MainLayout><RoleManagement /></MainLayout></PrivateRoute>} />
            <Route path="/user" element={<PrivateRoute><MainLayout><UserManagement /></MainLayout></PrivateRoute>} />
            <Route path="/storeManagement" element={<PrivateRoute><MainLayout><StoreManagement /></MainLayout></PrivateRoute>} />
            <Route path="/positionManagement" element={<PrivateRoute><MainLayout><PositionManagement /></MainLayout></PrivateRoute>} />
            <Route path="/unitManagement" element={<PrivateRoute><MainLayout><UnitManagement /></MainLayout></PrivateRoute>} />
            <Route path="/currencyManagement" element={<PrivateRoute><MainLayout><CurrencyManagement /></MainLayout></PrivateRoute>} />
            <Route path="/transportManagement" element={<PrivateRoute><MainLayout><TransportManagement /></MainLayout></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/product" replace />} />
            <Route path="*" element={<Navigate to="/product" replace />} />
        </Routes>
    );
}

export default AppRoutes;
