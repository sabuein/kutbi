"use strict";

import express from "express";
import cors from "cors";
import { getAll, addAuthor, addPublisher, addBook } from "./data.mjs";

const app = express();
const port = 3456;

app.use(cors({
    origin: "http://localhost:5500"
}));

// GET, POST, PUT, DELETE, etc.
const startEndPoints = () => {

    app.get("/books", (req, res) => {
        // Handle the request and send a response
        console.log(`Request received: ${req.url}`);
        getAll(req, res, "Books");
    });

    app.get("/authors", (req, res) => {
        console.log(`Request received: ${req.url}`);
        getAll(req, res, "Authors");
    });

    app.post("/authors/add", (req, res) => {
        const completeUrl = req.protocol + "://" + req.hostname + req.originalUrl;
        console.log("Complete URL:", completeUrl);
        console.log(`Request received: ${req.url}`);
        addAuthor(req, res);
    });
};

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export { startEndPoints };