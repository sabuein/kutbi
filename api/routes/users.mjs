"use strict";

import express from "express";
import multer from "multer";
import { getAll, addUser } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";

// userPasswords

const users = express.Router();

// Set up the multer middleware for handling file uploads
const upload = multer({ dest: "uploads/users/" });

users.param("id", idLogger);

users.route("/")
    .get((req, res) => getAll(req, res, "Users"))
    .post(upload.array("photo", 9), (req, res) => {
        const uploadedFiles = req.files;
        addUser(req, res);
    });

users.route("/:id")
    .get((req, res) => {
        res.json({ id: req.params.id });
    })
    .put((req, res) => {        
        res.status(200).send(`User with ID #${req.params.id} has been updated`);
    })
    .delete((req, res) => {
        res.status(200).send(`User with ID #${req.params.id} has been deleted`);
    });

export { users };