"use strict";

import express from "express";
import multer from "multer";
import { getAll, addAuthor } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";

const authors = express.Router();

// Set up the multer middleware for handling file uploads
const upload = multer({ dest: "uploads/authors/" });

authors.param("id", idLogger);

authors
    .route("/")
    .get((req, res) => {
        getAll(req, res, "Authors");
    })
    .post(upload.single("photo"), (req, res) => {
        const result = addAuthor(req, res);
        // Redirect the user back to the referring page
        const referer = req.headers.referer;
        if (result && referer) {
            res.status(201).redirect(referer); // Created
        } else if (result) {
            res.json({
                status: 201,
                id: result.insertId,
                record: "author",
            });
        }
    });

authors
    .route("/:id")
    .get((req, res) => {
        res.json({ id: req.params.id });
    })
    .put((req, res) => {
        res.status(200).send(`Author with ID #${req.params.id} has been updated`);
    })
    .delete((req, res) => {
        res.status(200).send(`Author with ID #${req.params.id} has been deleted`);
    });

export { authors };
