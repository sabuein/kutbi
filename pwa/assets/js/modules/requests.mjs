"use strict";

import { urlWithQuery, urlToJSON } from "./helpers.mjs";

// GET, POST, PUT, DELETE, etc.

const parseGetSubmit = (form) => {
    if (form.method !== "get") throw TypeError(`Please check form(#${form.id} method`);
    try {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            console.log("Hi there...");
            console.log(`An intercepted HTTP GET submission by form(#${form.id}) is being parsed as JSON within the console and returned as a JavaScript object...`);
            const url = urlWithQuery(form);
            return urlToJSON(url);
        }, false);
    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at catchGetForm() function. Please help!`);
    }
};

const handleFormSubmit = (form) => {
    try {
        form.addEventListener("submit", async (event) => {
            if (!event.isTrusted) throw Error(`The form submission is not trusted`);
            else (event.preventDefault() && event.stopImmediatePropagation());

            const requestBody = {};
            const formData = new FormData(event.target);
            formData.forEach((value, key) => requestBody[key] = value);
            requestBody.permissions = [
                "viewFreeContent",
                "viewPremiumContent",
                "createContent",
                "updateContent",
                "deleteContent",
                "manageApp"
            ];
            requestBody.roles = ["administrator"];
            console.log(JSON.stringify({ requestBody: requestBody }, null, 2));

            let headersInit = {
                "accept": "application/json",
                "user-agent": "kutbi client (https://www.kutbi.com)",
                "content-type": "application/json; charset=utf-8"
            };
            const requestHeaders = new Headers(headersInit);

            const response = await fetch(form.action, {
                method: form.method,
                headers: requestHeaders,
                mode: "cors",
                cache: "default",
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            if (data.status === "403") window.location.assign("login.html");
            else (console.log(JSON.stringify(data, null, 2)));
            form.reset();
        }, false);
    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at handleFormSubmit() function. Please help!`);
    }
}

export { parseGetSubmit, handleFormSubmit };