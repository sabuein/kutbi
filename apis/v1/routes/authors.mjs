"use strict";

import express from "express";
import multer from "multer";
import { getAllAuthors, addAuthor } from "../modules/data.mjs";
import { idLogger, isEmptyObject, pad } from "../modules/helpers.mjs";
import { requireAuth } from "../modules/auth.mjs";

const authors = express.Router();

// Set up the multer middleware for handling file uploads
const upload = multer({ dest: "uploads/authors/" });

authors.param("id", idLogger);

authors
    .route("/")
    .get(requireAuth, getAllAuthors, async (req, res) => {
        const i = req.app.locals.index;
        try {
            // Retrieve access token from a cookie named "accessToken"
            const cookies = req.app.locals.cookies;
            if (!cookies || isEmptyObject(cookies)) throw Error(`No cookies are available. Please proceed with either logging in or registering.`);
            console.log(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/authors$ The retrieval of ${req.authors.length} authors was completed successfully.`);
            return res.status(200).json(({
                status: 200,
                message: `The retrieval of ${req.authors.length} authors was completed successfully.`,
                result: JSON.parse(JSON.stringify(req.authors)),
                time: + Date.now()
            }));
        } catch (error) {
            console.error(`${+ Date.now()}:${pad(i, 5)}:@kutbi:~/authors$ ${error.message.split(". ")[0]}`);
            // return response.status(401).json({ status: 401, message: error.message, time: + Date.now() });
        }
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
    .route("/matrix")
    .post((req, res) => {
        const i = req.app.locals.index;
        try {
            const authors = req.app.locals.fakeData.authors;
            if (!!authors) {
                // console.log(authors);
                // console.log(JSON.stringify(authors, null, 2));
                // return res.redirect(301, "/authors");
                return addAuthor();
            }
        } catch (error) {
            console.error(error);
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