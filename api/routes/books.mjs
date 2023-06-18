"use strict";

import express from "express";
import multer from "multer";
import { getAllBooks, addBook } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";

// bookAuthors
// bookImages
// bookGenres

const books = express.Router();

// Set up the multer middleware for handling file uploads
const upload = multer({ dest: "uploads/books/" });

books.param("id", idLogger);

books.route("/")
    .get(getAllBooks, (req, res) => {
        res.status(200).json({ message: "inshallah" });
    })
    .post(upload.array("photo", 9), (req, res) => {
        const uploadedFiles = req.files;
        addBook(req, res);
    });

books.route("/:id")
    .get((req, res) => {
        res.json({ id: req.params.id });
    })
    .put((req, res) => {        
        res.status(200).send(`Book with ID #${req.params.id} has been updated`);
    })
    .delete((req, res) => {
        res.status(200).send(`Book with ID #${req.params.id} has been deleted`);
    });

export { books };