// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import eligibilityRouter from "./eligibility";
import preauthRouter from "./preauth";
import claimRouter from "./claim";

import patientsRouter from "./patients";
import patientsUpdateRouter from "./patients_update";
import roomsRouter from "./rooms";
import doctorsRouter from "./doctors";
import servicesRouter from "./services";
import encountersRouter from "./encounters";
import appointmentsRouter from "./appointments";
import prescriptionsRouter from "./prescriptions";
import billingRouter from "./billing";

import authRouter from "./auth";
import adminRouter from "./admin";

console.log("Server file loaded");
dotenv.config();

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Insurance mocks
app.use("/nphies", eligibilityRouter);
app.use("/nphies", preauthRouter);
app.use("/nphies", claimRouter);

// Core APIs
app.use("/", patientsRouter);
app.use("/", patientsUpdateRouter);
app.use("/", roomsRouter);
app.use("/", doctorsRouter);
app.use("/", servicesRouter);
app.use("/", encountersRouter);
app.use("/", appointmentsRouter);
app.use("/", prescriptionsRouter);
app.use("/", billingRouter);
app.use("/", adminRouter);

// Auth
app.use("/auth", authRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
