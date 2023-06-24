"use strict";

import express from "express";
import multer from "multer";
import { getAllOperations, addOperation } from "../modules/data.mjs";
import { idLogger } from "../modules/helpers.mjs";

// favicon.ico

const index = express.Router();

const upload = multer({ dest: "uploads/operations/" });

index.param("id", idLogger);

index
    .route("/")
    .get((req, res) => {
        res.status(200).json({
            request: req.body,
            promise: "Inshallah soon"
        });
    })
    .post(upload.array("photo", 9), (req, res) => {
        const uploadedFiles = req.files;
        res.status(200).json({
            request: req.body,
            promise: "Inshallah soon"
        });
    });

export { index };