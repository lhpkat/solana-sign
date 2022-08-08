import React from "react";
import { useRoutes } from "react-router-dom";
import Dashboard from '../pages/Dashboard';
import Create from '../pages/Create';
import Recipients from '../pages/Recipients'; // 管理收件人
import PrepareDocument from '../pages/PrepareDocument';
import Review from '../pages/Review';

const Index = () => {
    let element = useRoutes([
        { path: "/", element: <Dashboard /> },
        { path: "create", element: <Create /> },
        { path: "recipients", element: <Recipients /> },
        { path: "prepare-document", element: <PrepareDocument /> },
        { path: "review", element: <Review /> },
    ]);

    return element;
}

export default Index;
