import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../components/DashboardPage";
import CreateRoom, { JoinRoom } from "../components/roomTool";
import SignUp from "../user/SignUp";
import  {  VerifyPage,Login } from "../user/Login";
import {AuthContext} from "../context/AuthContext";
import FullControl from "../components/MusicRoomUI";
import ErrorPage from "../components/ErrorPage";
import FullControlsss from "../components/custom";
import AboutPage from "../components/AboutPage";
const AppRoutes = () => {
    const { accessToken } = useContext(AuthContext);
    return (
        <Routes>
            <Route
                path="/"
                element={
                    accessToken ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <SignUp />
                    )
                }
            />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="/join-room" element={<JoinRoom />} />
            <Route path="/room/:id" element={<FullControl />} />
            <Route path="/404" element={<ErrorPage/>}/>
        </Routes>
    );
};

export default AppRoutes;
