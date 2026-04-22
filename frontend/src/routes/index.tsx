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
            <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/product" element={<ProductManagement />} />
                    <Route path="/account" element={<AccountManagement />} />
                    <Route path="/permission" element={<Navigate to="/permission/menu" replace />} />
                    <Route path="/permission/menu" element={<PermissionManagement />} />
                    <Route path="/role" element={<RoleManagement />} />
                    <Route path="/user" element={<UserManagement />} />
                    <Route path="/storeManagement" element={<StoreManagement />} />
                    <Route path="/positionManagement" element={<PositionManagement />} />
                    <Route path="/unitManagement" element={<UnitManagement />} />
                    <Route path="/currencyManagement" element={<CurrencyManagement />} />
                    <Route path="/transportManagement" element={<TransportManagement />} />
                </Route>
            </Route>
            <Route path="/" element={<Navigate to="/product" replace />} />
            <Route path="*" element={<Navigate to="/product" replace />} />
        </Routes>
    );
}

export default AppRoutes;
