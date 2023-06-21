"use strict";

import express from "express";
import { login, recover, register, validateAuthHeader, validateAuthCookie, clearAuthTokens, clearAuthCookies } from "../modules/auth.mjs";
import { roles, checkPermission } from "../modules/roles.mjs";

const accounts = express.Router();

// Browse, Read, Edit, Add, Copy, Delete

accounts
    .route("/")
    .post((req, res) => {
        console.log("Redirecting from /accounts to /accounts/signup");
        res.redirect(301, "/accounts/signup");
    });

accounts
    .route("/signup")
    .post(register, async (req, res) => {
        const types = ["subscriber", "user"];
        if (!types.includes(req.account.type)) return res.status(500).json({ error: "Server error" });
        const account = req.account;
        setHeaders(res, { accessToken: account.accessToken, refreshToken: account.refreshToken });
        setCookies(res, { accessToken: account.accessToken, refreshToken: account.refreshToken });
        return res.status(201).json(account);
    });

accounts
    .route("/signin")
    .post(login, (req, res) => {
        const types = ["subscriber", "user"];
        if (!types.includes(req.account.type)) return res.status(500).json({ error: "We couldn't locate your Kutbi account" });
        const account = req.account;
        setHeaders(res, { accessToken: account.accessToken, refreshToken: account.refreshToken });
        setCookies(res, { accessToken: account.accessToken, refreshToken: account.refreshToken });
        console.log(`Details: A Kutbi account of type ${account.type} (#${account.guid}) have successfully retrieved and logged in.\r\n`);
        return res.status(200).json(account);
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

const setCookies = (response, account) => {
    response.cookie("accessToken", account.accessToken, {
        httpOnly: false,
        secure: true,
        maxAge: 3600000, // One hour in milliseconds
        signed: false
    });

    response.cookie("refreshToken", account.refreshToken, {
        httpOnly: false,
        secure: true,
        maxAge: 2629800000, // One month in milliseconds
        signed: false
    });
};

const setHeaders = (response, account) => {
    response.set("Authorization", `Bearer ${account.accessToken}`);
    // response.set("Cache-Control", ``);
    // response.set("Content-Security-Policy", ``);
};

export { accounts };

// /google.com//