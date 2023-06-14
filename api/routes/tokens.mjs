"use strict";

import express from "express";

const tokens = express.Router();

// Generate CSRF (Cross-Site Request Forgery) tokens
tokens
    .route("/csrf")
    .get((request, response) => {
        response.status(201).json({ csrfToken: request.csrfToken() });
    });

export { tokens };