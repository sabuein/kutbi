"use strict";

import express from "express";
import hbs from "hbs";
import { mainLogger, checkAccount } from "./helpers.mjs";
import { fakeData } from "./data.mjs";
import { admin, tokens, dashboard, users, accounts, books, authors, index } from "./routes.mjs";
import { User, Subscriber, Client } from "./classes.mjs";
import { readCookies } from "./auth.mjs";

const app = express();
const data = fakeData();

try {
    app.set("view engine", "hbs");

    hbs.registerPartials("/views/partials", function (err) {
        console.log(`TODO: Fix error with hbs.\r\n`);
    });

    // bodyParser.text({type: '*/*'})

    // app.use(express.text({ type: "*/*" }));
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: false }));

    app.locals.index = 0;
    app.locals.payload;
    app.locals.account = {};
    app.locals.cookies = {};
    app.locals.authenticated;
    app.locals.accountTypes = ["client", "subscriber", "user", "member"];
    app.locals.log;
    app.locals.logs = [];
    app.locals.loggedinAccounts = [];
    app.locals.refreshTokens = [];
    app.locals.stats = {
        accessTokens: 0,
        refreshTokens: 0,
        authCounter: 0,
        authValidation: 0,
        headers: 0,
        cookies: 0,
        resetAuth: 0,
        clearTokens: 0,
        clearCookies: 0,
        logins: 0,
        recoveries: 0,
        signups: 0,
        visitors: Client.total,
        subscribers: Subscriber.total,
        users: User.total
    };
    app.locals.fakeData = {
        authors: Object.entries(data.authors)
    };

    // Apply middleware to all routes
    app.use(mainLogger);
    app.use(checkAccount);
    // app.use(readCookies);
    app.use("/admin", admin);
    app.use("/tokens", tokens);
    app.use("/dashboard", dashboard);
    app.use("/users", users);
    app.use("/accounts", accounts);
    app.use("/books", books);
    app.use("/authors", authors);
    app.use("/", index);
} catch (error) {
    console.error(error);
    throw Error("The app got a problem.");
}

export { app };