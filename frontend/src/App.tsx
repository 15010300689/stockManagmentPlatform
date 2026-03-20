import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AppRoutes from './routes';

const theme = {
    token: {
        borderRadius: 2,
    },
};

function App(): JSX.Element {
    return (
        <ConfigProvider theme={theme}>
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                }}
            >
                <AppRoutes />
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;
