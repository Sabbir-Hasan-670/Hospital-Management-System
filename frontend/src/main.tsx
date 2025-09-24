import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home";
import FrontDeskPage from "./pages/FrontDesk";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";
import FinanceLogin from "./pages/FinanceLogin";
import FinanceDashboard from "./pages/FinanceDashboard";
import ITLogin from "./pages/ITLogin";
import ITDashboard from "./pages/ITDashboard";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/frontdesk" element={<FrontDeskPage />} />

      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

      <Route path="/finance/login" element={<FinanceLogin />} />
      <Route path="/finance/dashboard" element={<FinanceDashboard />} />

      <Route path="/it/login" element={<ITLogin />} />
      <Route path="/it/dashboard" element={<ITDashboard />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);
