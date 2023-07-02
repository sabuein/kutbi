"use strict";

import { local, session } from "./apis.mjs";
import { handleInput, validateInput } from "./data.mjs";
import { urlWithQuery, urlToJSON, encode, decode } from "./helpers.mjs";

const handleFormsWithBody = async (event) => {

    if (!(!!event.target && event.target instanceof HTMLFormElement)) throw Error("Please check the form type.");
    
    const log = {
        form: {
            action: event.target.action,
            method: event.target.method
        },
        headers: {}
    };

    try {
        // Some constraints
        if (!event.isTrusted) throw Error(`@kutbi:~$ The form submission is not trusted.`);
        event.preventDefault();
        event.stopImmediatePropagation();

        const { username, email, password, passwordX } = event.target.elements;

        if (password.value !== passwordX.value) {
            passwordX.addEventListener("input", handleInput, false);
            throw Error("Retyped password does not match the original password");
        }
        validateInput(username);
        console.log("Username:", validateInput(username))
        validateInput(email);
        console.log("Email:", validateInput(email));
        validateInput(password);
        console.log("Password:", validateInput(password));
        validateInput(passwordX);
        console.log("PasswordX:", validateInput(passwordX));
        // event.target.elements.forEach(element => console.log(element)); // handleInput

        const requestBody = {};
        const formData = new FormData(event.target);
        formData.forEach((value, key) => requestBody[key] = value);
        // (TODO: Uncomment in production) event.target.reset();

        // Content-Type: image/png
        // Content-Type: text/html; charset=UTF-8;
        // Content-Type: application/xml
        // Content-Type: application/x-www-form-urlencoded;
        // Content-Type: multipart/form-data;
        // The content type for JSONP (padded JSON) is application/javascript

        const headers = new Headers();
        // const tokens = JSON.parse(local("read", "tokens"));
        headers.set("Accept", "application/json; charset=UTF-8");
        headers.set("Content-Type", "application/json; charset=UTF-8");
        headers.set("Access-Control-Allow-Headers", "");
        // headers.set("Access-Control-Allow-Credentials", "true");
        // headers.set("Authorization", `Bearer ${tokens.access}`);
        // headers.set("X-ACCESS_TOKEN", "");
        headers.set("X-Requested-With", "");
        headers.set("User-Agent", "Kutbi Client (https://www.kutbi.com)");
        headers.set("Cookie", document.cookie); // Include cookies

        headers.forEach((value, key) => log.headers[key] = value);

        const payload = JSON.stringify({
            "account": encode(JSON.stringify(requestBody))
        });

        log.body = requestBody;
        log.encoded = payload;

        // In another words, in 'mode' '-no-'cors' you can only set application/x-www-form-urlencoded, multipart/form-data, or text/plain to the Content-Type.
        
        const raw = await fetch(event.target.action, {
            method: event.target.method,
            body: payload,
            headers: headers,
            mode: "cors",
            cache: "default",
        });

        if (raw.status === "400" || raw.status === "403" || !raw.ok) {
            throw Error(`@kutbi:~$ Failed to fetch with ${event.target.method.toUpperCase()} from ${event.target.action}`);
            // window.location.assign("./login.html");
        }

        const responsePayload = await raw.json();
        local("create", "account", JSON.stringify({ loggen: 0, account: responsePayload.account }));
        local("update", "loggen", (0).toString());
        console.log(`@kutbi:~$ Your account and login details have been retrieved successfully from ${event.target.action}.`);
        log.response = responsePayload;
        return window.location.reload(); // window.location.assign("./login.html");
    } catch (error) {
        console.error(error);
        throw Error(`@kutbi:~$ We got a problem at handleFormSubmit() function. Please help!`);
    } finally {
        console.log(JSON.stringify(log, null, 2));
    }
};

const handleGetForm = (form) => {
    if (form.method !== "GET") throw TypeError(`Please check form(#${form.id} method`);
    try {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            console.log("@kutbi:~$ Hi there...");
            console.log(`@kutbi:~$ An intercepted HTTP GET submission by form(#${form.id}) is being parsed as JSON within the console and returned as a JavaScript object...`);
            const url = urlWithQuery(form);
            return urlToJSON(url);
        }, false);
    } catch (error) {
        console.error(error);
        throw Error(`@kutbi:~$ We got a problem at catchGetForm() function. Please help!`);
    }
};

const genericRequest = async (url, token) => {
    const requestHeaders = new Headers();
    requestHeaders.set("Accept", "text/plain; charset=utf-8");
    requestHeaders.set("User-Agent", "Kutbi Web Desktop (https://www.kutbi.com)");
    requestHeaders.set("Content-Type", "application/json; charset=utf-8");
    requestHeaders.set("Authorization", `Bearer ${token}`);
    
    const raw = await fetch(url, {
        headers: requestHeaders,
        credentials: "same-origin",
        method: "GET"
    });

    if (!raw.ok) throw `@kutbi:~$ Failed to fetch the url with error ${raw.status}`;

    const content = await raw.json();

    return content;
};

const deletePost = (url, id) => {
    return fetch(`${url}/${id}`, {
        method: "DELETE"
    });
};

export { handleGetForm, handleFormsWithBody };