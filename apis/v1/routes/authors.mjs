"use strict";

import express from "express";
import multer from "multer";
import { getAllAuthors, addAuthor } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";

const authors = express.Router();

// Set up the multer middleware for handling file uploads
const upload = multer({ dest: "uploads/authors/" });

authors.param("id", idLogger);

authors
    .route("/")
    .get(getAllAuthors, (req, res) => res.status(200).json((JSON.parse(JSON.stringify(req.authors)))))
    .post(upload.single("photo"), addAuthor, (req, res) => {
        // Redirect the user back to the referrering page
        const referrer = req.details.referrer;
        if (req.author && referrer) {
            res.status(201).redirect(referrer); // Created
        } else if (req.author) {
            res.json({
                status: 201,
                id: result.insertId,
                record: "author",
                details: req.author
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
