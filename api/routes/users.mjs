"use strict";

import express from "express";
import multer from "multer";
import { getAll, addUser } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";
import { authorize, authenticateToken, tokenize, deleteToken } from "../modules/auth.mjs";

// userPasswords

const users = express.Router();

// Set up the multer middleware for handling file uploads
const upload = multer({ dest: "uploads/users/" });

users.param("id", idLogger);

const tempPosts = [
    {
        username: "sabuein",
        post: "As-salamu alaykum, world!"
    },
    {
        username: "ovellio",
        post: "Good morning, world!"
    },
    {
        username: "sabuein",
        post: "Marhaba, world!"
    },
    {
        username: "ovellio",
        post: "Bonjour, world!"
    }
];

users.route("/")
    .get(authenticateToken, async (req, res) => {
        const user = await req.user;
        res.json(tempPosts.filter(post => post.username === user.username));
    })
    .post(upload.array("photo", 9), (req, res) => {
        const uploadedFiles = req.files;
        addUser(req, res);
    });

users.route("/login")
    .post(authorize, (req, res) => {
        // Authentication
        console.log("TODO: Authentication");
        // Authorization
        res.json({
            accessToken: req.accessToken,
            refreshToken: req.refreshToken
        });
    });

users.route("/logout")
    .delete(deleteToken, async (req, res) => {
        console.log("TODO: Delete token from database");
        res.sendStatus(204);
    });

users.route("/token")
    .post(tokenize, (req, res) => {
        res.json({ token: req.accessToken });
    });

users.route("/:id")
    .get(authenticateToken, (req, res) => {
        res.json({ id: req.params.id });
    })
    .put(authenticateToken, (req, res) => {        
        res.status(200).send(`User with ID #${req.params.id} has been updated`);
    })
    .delete(authenticateToken, (req, res) => {
        res.status(200).send(`User with ID #${req.params.id} has been deleted`);
    });

export { users };