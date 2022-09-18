import React from "react";
import { useRoutes } from "react-router-dom";
import Dashboard from '../pages/Dashboard';
import Create from '../pages/Create';
import Recipients from '../pages/Recipients'; // 管理收件人
import PrepareDocument from '../pages/PrepareDocument';
import Review from '../pages/Review';
import SignPage from '../pages/SignPage';
import Test from '../pages/Test';

const Index = () => {
    let element = useRoutes([
        { path: "/", element: <Dashboard /> },
        { path: "create", element: <Create /> },
        { path: "recipients", element: <Recipients /> },
        { path: "prepare-document", element: <PrepareDocument /> },
        { path: "signPage/:id", element: <SignPage /> },
        { path: "review", element: <Review /> },
        { path: "test", element: <Test /> },
    ]);

    return element;
}

export default Index;
