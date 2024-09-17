import React from "react";
import ReactDOM from "react-dom/client";
import { LoginPage } from "./LoginPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Lobby } from "./Lobby";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<LoginPage />} />
                <Route path="/lobby" element={<Lobby />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
