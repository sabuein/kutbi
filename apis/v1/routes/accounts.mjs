"use strict";

import express from "express";
import { login, recover, register, setupAuth, validateAuthHeader, validateAuthCookie, clearAuthTokens, clearAuthCookies } from "../modules/auth.mjs";
import { roles, checkPermission } from "../modules/roles.mjs";

const accounts = express.Router();

// Browse, Read, Edit, Add, Copy, Delete
const accountTypes = ["subscriber", "user"];

accounts
    .route("/")
    .post((req, res) => {
        console.log("Redirecting from /accounts to /accounts/signup");
        res.redirect(301, "/accounts/signup");
    });

accounts
    .route("/signup")
    .post(register, setupAuth, async (req, res) => {
        if (!accountTypes.includes(req.account.type)) return res.status(500).json({ error: "Server error" });
        return res.status(201).json(req.account);
    });

accounts
    .route("/signin")
    .post(login, setupAuth, (req, res) => {
        if (!accountTypes.includes(req.account.type)) return res.status(500).json({ error: "We couldn't locate your Kutbi account" });
        console.log(`Details: A Kutbi account of type ${req.account.type} (#${req.account.guid}) have successfully retrieved and logged in.\r\n`);
        return res.status(200).json(req.account);
    });

accounts
    .route("/signin/recovery")
    .post(recover, (req, res) => {
        // TODO
    });

accounts
    .route("/logout")
    .delete(clearAuthTokens, async (req, res) => {
        console.log("TODO: Delete token from database");
        return res.status(204).json({ message: "Successfully deleted refresh token" });
    });

export { accounts };

// /google.com//