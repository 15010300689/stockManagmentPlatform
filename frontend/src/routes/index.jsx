import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Login from '../pages/Login';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from './PrivateRoute';
import ProductManagement from '../pages/ProductManagement';
import AccountManagement from '../pages/AccountManagement';
import PermissionManagement from '../pages/PermissionManagement';
import RoleManagement from '../pages/RoleManagement';
import UserManagement from '../pages/UserManagement';

function AppRoutes() {
    return (
        <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/product">
                <MainLayout>
                    <ProductManagement />
                </MainLayout>
            </PrivateRoute>
            <PrivateRoute path="/account">
                <MainLayout>
                    <AccountManagement />
                </MainLayout>
            </PrivateRoute>
            <PrivateRoute path="/permission">
                <MainLayout>
                    <PermissionManagement />
                </MainLayout>
            </PrivateRoute>
            <PrivateRoute path="/role">
                <MainLayout>
                    <RoleManagement />
                </MainLayout>
            </PrivateRoute>
            <PrivateRoute path="/user">
                <MainLayout>
                    <UserManagement />
                </MainLayout>
            </PrivateRoute>
            <PrivateRoute exact path="/">
                <MainLayout>
                    <ProductManagement />
                </MainLayout>
            </PrivateRoute>
            <Redirect to="/" />
        </Switch>
    );
}

export default AppRoutes;
