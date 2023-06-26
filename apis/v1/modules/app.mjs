"use strict";

import express from "express";
import hbs from "hbs";
import cors from "cors";
import bodyParser from "body-parser";
import { mainLogger } from "./helpers.mjs";
import { accounts, authors, books, dashboard, tokens, users, index } from "./routes.mjs";
import { User, Subscriber, Visitor } from "../models/classes.mjs";

const app = express();

try {
    app.set("view engine", "hbs");

    hbs.registerPartials("/views/partials", function (err) {
        console.log(`TODO: Fix error with hbs.\r\n`);
    });

    // app.use(cors({ origin: ["http://localhost:5500", "http://127.0.0.1:5500"] }));

    /*
    // Use the body-parser middleware to parse request bodies
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    */

    // bodyParser.text({type: '*/*'})

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.text({ type: "*/*" }));
    
    app.locals.index = 0;
    app.locals.accountTypes = ["subscriber", "user"];
    app.locals.loggedinAccounts = [];
    app.locals.refreshTokens = [];
    app.locals.stats = {
        accessTokens: 0,
        refreshTokens: 0,
        authCounter: 0,
        authValidation: 0,
        headers: 0,
        cookies: 0,
        clearTokens: 0,
        clearCookies: 0,
        logins: 0,
        recoveries: 0,
        signups: 0,
        visitors: Visitor.total,
        subscribers: Subscriber.total,
        users: User.total
    };

    app.use(mainLogger);
    app.use((req, res, next) => {
        const payload = (req.body) ? (typeof req.body === "string") ? (JSON.parse(req.body).account) : (req.body.account) : null;
        res.locals.account = payload;
        res.locals.authenticated = false;
        next();
    });

    app.use("/accounts", accounts);
    app.use("/authors", authors);
    app.use("/books", books);
    app.use("/dashboard", dashboard);
    app.use("/tokens", tokens);
    app.use("/users", users);
    app.use("/", index);
} catch (error) {
    console.error(error);
    throw Error("The app got a problem.");
}

export { app };