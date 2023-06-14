"use strict";

import express from "express";
import hbs from "hbs";
import cors from "cors";
import csrf from "csurf";
import bodyParser from "body-parser";
import { mainLogger } from "./helpers.mjs";
import { authors, books, dashboard, tokens, users } from "./routes.mjs";

const app = express();

app.set("view engine", "hbs");

hbs.registerPartials("/views/partials", function (err) {
    console.log(`Error with hbs:`);
});

app.use(cors({ origin: ["http://localhost:5500", "http://127.0.0.1:5500"] }));
app.use(csrf({ cookie: { sameSite: "lax" } }));
app.use(mainLogger);

/*
// Use the body-parser middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/authors", authors);
app.use("/books", books);
app.use("/dashboard", dashboard);
app.use("/tokens", tokens);
app.use("/users", users);

export { app };