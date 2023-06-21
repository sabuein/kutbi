"use strict";

import express from "express";
import { idLogger } from "../modules/helpers.mjs";
import { validateAuthHeader, validateAuthCookie } from "../modules/auth.mjs";
import { roles, checkPermission } from "../modules/roles.mjs";

// userPasswords

const users = express.Router();

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

// Browse, Read, Edit, Add, Copy, Delete

users
    .route("/")
    .get(validateAuthHeader, validateAuthCookie, (req, res) => {
        // If the token is valid, the user is authenticated
        // Allow users to access the protected resource
        console.log(`User ${req.user.username} granted access to ${req.hostname}`);
        return res.json(tempPosts.filter(post => post.username === req.user.username));
    });

users
    .route("/:id")
    .get(validateAuthHeader, validateAuthCookie, checkPermission(roles.ADMIN, "read"), (req, res) => {
        return res.json({ id: req.params.id });
    })
    .put(validateAuthHeader, validateAuthCookie, checkPermission([roles.SUBSCRIBER, roles.USER, roles.ADMIN], "update"), (req, res) => {        
        return res.status(200).send(`User with ID #${req.params.id} has been updated`);
    })
    .delete(validateAuthHeader, validateAuthCookie, checkPermission(roles.ADMIN, "delete"), (req, res) => {
        return res.status(200).send(`User with ID #${req.params.id} has been deleted`);
    });

users
    .route("/dashboard")
    .post(validateAuthHeader, validateAuthCookie, checkPermission([roles.SUBSCRIBER, roles.USER, roles.ADMIN], "read, update"), (req, res) => {
        return res.json(req.user.toString());
    });

export { users };