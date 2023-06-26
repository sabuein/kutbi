"use strict";

import express from "express";
import hbs from "hbs";
import cors from "cors";
import bodyParser from "body-parser";
import { mainLogger } from "./helpers.mjs";
import { admin, tokens, dashboard, users, accounts, books, authors, index } from "./routes.mjs";
import { User, Subscriber, Visitor } from "./classes.mjs";

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
    // app.use(express.urlencoded({ extended: true }));
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
    
    // Apply middleware to all routes
    // app.use(requireAuth);
    app.use(mainLogger);
    app.use((req, res, next) => {
        res.set("Access-Control-Allow-Origin", "http://localhost:5500");
        res.set("Access-Control-Request-Method", "GET, POST, PUT, DELETE, OPTIONS");
        res.set("Access-Control-Max-Age", "3600");
        res.set("Access-Control-Request-Headers", "Authorization");
        res.set("Access-Control-Allow-Headers", "Accept, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, User-Agent, Cookie");
        res.set("X-Powered-By", "Kutbi & Express.js");
        const payload = (req.body) ? (typeof req.body === "string") ? (JSON.parse(req.body).account) : (req.body.account) : null;
        res.locals.account = payload;
        res.locals.authenticated = false;
        next();
    });
    // app.all("/admin/*", requireAuthentication);
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