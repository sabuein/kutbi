"use strict";

import express from "express";
import hbs from "hbs";
import cors from "cors";
import bodyParser from "body-parser";
import { mainLogger } from "./helpers.mjs";
import { authors, books, users } from "./routes.mjs";

const app = express();

app.set("view engine", "hbs");

hbs.registerPartials("../views/partials", function (err) {
    console.log(`Error with hbs:`);
});

app.use(mainLogger);
app.use(cors({ origin: ["http://localhost:5500", "http://127.0.0.1:5500"] }));

// Use the body-parser middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded());

app.use("/authors", authors);
app.use("/books", books);
app.use("/users", users);

export { app };