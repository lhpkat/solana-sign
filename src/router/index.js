import React from "react";
import { useRoutes } from "react-router-dom";
import Dashboard from '../pages/Dashboard'

const Routes = () => {
    let element = useRoutes([
        {
            path: "/",
            element: <Dashboard />,
            children: [
            //   {
            //     path: "messages",
            //     element: <DashboardMessages />,
            //   },
            //   { path: "tasks", element: <DashboardTasks /> },
            ],
        },
        { path: "test", element: <div>123</div> },
    ]);
  
    return element;
}

export default Routes;
