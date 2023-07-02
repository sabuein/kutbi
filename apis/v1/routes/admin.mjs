"use strict";

import express from "express";
import {
  login,
  recover,
  register,
  setupAuth,
  validateAuthHeader,
  validateAccessCookie,
  resetAuth
} from "../modules/auth.mjs";
import { roles, checkPermission } from "../modules/roles.mjs";

const admin = express.Router();


const requireAuthentication = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        console.log(`${i}: @kutbi:~$ The request has been authenticated successfully.`);
        next();
    } catch (error) {
        console.error(error);
    }
};

const loadAdmin = async (request, response, next) => {
    try {
        const i = request.app.locals.index;
        console.log(`${i}: @kutbi:~$ An administrator account has been loaded successfully.`);
        next();
    } catch (error) {
        console.error(error);
    }
};

admin.all("*", requireAuthentication, loadAdmin);

admin
    .route("/")
    .get(async (req, res) => {
        try {
            const i = req.app.locals.index;
            console.log(`${i}: @kutbi:~/todo$ GET /admin/`);
            return res.status(200).json({ status: 200, message: "GET /admin/" });
        } catch (error) {
            console.error(error);
        }
    })
    .post(async (req, res) => {
        try {
            const i = req.app.locals.index;
            console.log(`${i}: @kutbi:~/todo$ POST /admin/`);
            return res.status(200).json({ status: 200, message: "POST /admin/" });
        } catch (error) {
            console.error(error);
        }
    });

/*
TODO:

GET /admin/posts/
GET /admin/posts/{id}/
GET /admin/posts/slug/{slug}/
POST /admin/posts/
POST /admin/posts/{id}/copy
PUT /admin/posts/{id}/
DELETE /admin/posts/{id}/

*/

admin
    .route("/posts")
    .get(async (req, res) => {
        try {
            const i = req.app.locals.index;
            console.log(`${i}: @kutbi:~/todo$ GET /admin/posts/`);
            return res.status(200).json({ status: 200, message: "GET /admin/posts/" });
        } catch (error) {
            console.error(error);
        }
    })
    .post(async (req, res) => {
        try {
            const i = req.app.locals.index;
            console.log(`${i}: @kutbi:~/todo$ POST /admin/posts/`);
            return res.status(200).json({ status: 200, message: "POST /admin/posts/" });
        } catch (error) {
            console.error(error);
        }
    });

export { admin };

/*

TODO:

GET /admin/tiers/?include=monthly_price,yearly_price,benefits
POST /admin/tiers/
PUT /admin/tiers/{id}/

GET /admin/newsletters/?limit=all
POST /admin/newsletters/
POST /admin/newsletters/?opt_in_existing=true
PUT /admin/newsletters/629711f95d57e7229f16181c/

GET /admin/offers/
POST /admin/offers/
PUT /admin/offers/{id}/

GET /admin/members/?include=newsletters%2Clabels
POST /admin/members/
PUT /admin/members/{id}/

GET /admin/users/?include=count.posts%2Cpermissions%2Croles%2Croles.permissions
PUT /admin/users/{id}/
DELETE /admin/users/{id}/

POST /admin/images/upload/

GET /admin/roles/

POST /admin/invites/

POST /admin/themes/upload;
PUT /admin/themes/{ name }/activate;

*/