"use strict";

import express from "express";
import multer from "multer";
import { getAll, addBook } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";

const dashboard = express.Router();

const upload = multer({ dest: "uploads/operations/" });

dashboard.param("id", idLogger);

dashboard.route("/")
    .get((req, res) => { getAll(req, res, "Operations"); })
    .post(upload.array("photo", 9), (req, res) => {
        const uploadedFiles = req.files;
        addBook(req, res);
    });

export { dashboard };