import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function AppRouter() {
    const userID = localStorage.getItem('userID');

    return (
        <Routes>
            <Route path="/login"    element={userID ? <Navigate to="/tasks" /> : <Login />} />
            <Route path="/register" element={userID ? <Navigate to="/tasks" /> : <Register />} />
            <Route path="/tasks"    element={userID ? <App /> : <Navigate to="/login" />} />
            <Route path="*"         element={<Navigate to={userID ? "/tasks" : "/login"} />} />
        </Routes>
    );
}
