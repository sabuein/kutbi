"use strict";

import express from "express";
import multer from "multer";
import { getAllOperations, addOperation } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";

const dashboard = express.Router();

const upload = multer({ dest: "uploads/operations/" });

dashboard.param("id", idLogger);

dashboard
    .route("/")
    .get(getAllOperations, (req, res) => {
        res.status(200).json({ message: "inshallah" });
    })
    .post(upload.array("photo", 9), (req, res) => {
        const uploadedFiles = req.files;
        addOperation(req, res);
    });

export { dashboard };