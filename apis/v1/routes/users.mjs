"use strict";

import express from "express";
import { getAllUsers, addUser, checkUser } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";
import { authCookie, authenticate, authenticateToken, deleteToken, signin, signup } from "../modules/auth.mjs";
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
const subscriptionTypes = ["user"];

users.route("/")
    .get(authenticateToken, (req, res) => {
        // If the token is valid, the user is authenticated
        // Allow users to access the protected resource
        console.log(`User ${req.user.username} granted access to ${req.hostname}`);
        return res.json(tempPosts.filter(post => post.username === req.user.username));
    })
    .post(signup, async (req, res) => {
        const user = req.user;
        if (!subscriptionTypes.includes(user.subscriptionType)) return res.status(500).json({ error: "Server error" });
        res.cookie("accessToken", user.accessToken, {
            httpOnly: false,
            secure: true,
            maxAge: 3600000, // One hour in milliseconds
            signed: false
        });
        res.cookie("refreshToken", user.refreshToken, {
            httpOnly: false,
            secure: true,
            maxAge: 2629800000, // One month in milliseconds
            signed: false
        });
        res.set("Authorization", `Bearer ${user.accessToken}`);
        // response.set("Cache-Control", ``);
        // response.set("Content-Security-Policy", ``);
        return res.status(201).json(user);
    });

users.route("/login")
    .post(signin, (req, res) => {
        const user = req.user;
        if (!subscriptionTypes.includes(user.subscriptionType)) return res.status(500).json({ error: "Server error" });
        res.cookie("accessToken", user.accessToken, {
            httpOnly: false,
            secure: true,
            maxAge: 3600000, // One hour in milliseconds
            signed: false
        });
        res.cookie("refreshToken", user.refreshToken, {
            httpOnly: false,
            secure: true,
            maxAge: 2629800000, // One month in milliseconds
            signed: false
        });
        res.set("Authorization", `Bearer ${user.accessToken}`);
        // response.set("Cache-Control", ``);
        // response.set("Content-Security-Policy", ``);
        return res.status(200).json(user);
    });

users.route("/logout")
    .delete(deleteToken, async (req, res) => {
        console.log("TODO: Delete token from database");
        return res.status(204).json({ message: "Successfully deleted refresh token" });
    });

users.route("/signup")
    .post((req, res) => {
        console.log("Redirect /users/signup to /users");
        res.redirect(301, "/users");
    });
    /*.post((req, res) => {
        console.log("Redirect /users/signup to /users");
        return res.redirect(301, "/users");
    });*/

users.route("/token")
    .post(deleteToken, async (req, res) => {
        return res.json(req.user.toString());
    });

users.route("/:id")
    .get(authenticateToken, checkPermission(roles.ADMIN, "read"), (req, res) => {
        return res.json({ id: req.params.id });
    })
    .put(authenticateToken, checkPermission([roles.SUBSCRIBER, roles.USER, roles.ADMIN], "update"), (req, res) => {        
        return res.status(200).send(`User with ID #${req.params.id} has been updated`);
    })
    .delete(authenticateToken, checkPermission(roles.ADMIN, "delete"), (req, res) => {
        return res.status(200).send(`User with ID #${req.params.id} has been deleted`);
    });

users.route("/dashboard")
    .post(authenticate, checkPermission([roles.SUBSCRIBER, roles.USER, roles.ADMIN], "read, update"), (req, res) => {
        return res.json(req.user.toString());
    });

export { users };