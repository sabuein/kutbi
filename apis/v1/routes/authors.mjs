"use strict";

import express from "express";
import multer from "multer";
import { getAllAuthors, addAuthor } from "../modules/data.mjs";
import { idLogger, isEmptyObject } from "../modules/helpers.mjs";
import { requireAuth } from "../modules/auth.mjs";

const authors = express.Router();

// Set up the multer middleware for handling file uploads
const upload = multer({ dest: "uploads/authors/" });

authors.param("id", idLogger);

authors
    .route("/")
    .get(requireAuth, getAllAuthors, async (req, res) => {
        const i = req.app.locals.index;
        // Use the accessToken or perform authentication logic
        console.log(`${i}: The retrieval of all authors was successful.`);
        return res.status(200).json(({
            status: 200,
            message: "All authors have been retrieved successfully",
            result: JSON.parse(JSON.stringify(req.authors))
        }))
    })
    .post(upload.single("photo"), addAuthor, (req, res) => {
        // Redirect the user back to the referrering page
        const referrer = req.app.locals.log.referrer;
        if (req.author && referrer) {
            return res.status(201).redirect(referrer); // Created
        } else if (req.author) {
            return res.status(201).json({
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