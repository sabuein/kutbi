"use strict";

import { local, session } from "./apis.mjs";
import { urlWithQuery, urlToJSON, encode, decode } from "./helpers.mjs";

// GET, POST, PUT, DELETE, etc.

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

const handleFormsWithBody = async (event) => {
    try {
        // Some constraints
        if (!event.isTrusted) throw Error(`@kutbi:~$ The form submission is not trusted.`);
        event.preventDefault();
        event.stopImmediatePropagation();

        const requestBody = {};
        const formData = new FormData(event.target);
        formData.forEach((value, key) => requestBody[key] = value);
        event.target.reset();

        const headers = new Headers();
        headers.set("Accept", "application/json; charset=utf-8");
        headers.set("Content-Type", "text/plain; charset=utf-8");
        headers.set("User-Agent", "Kutbi Client (https://www.kutbi.com)");
        // headers.set("Authorization", `Bearer ${your_bearer_token}`);
        headers.set("Cookie", document.cookie); // Include cookies
        // headers.forEach((value, key) => console.log(`${key}: ${value}`));
        
        const payload = JSON.stringify({
            "account": encode(JSON.stringify(requestBody))
        });
        
        const raw = await fetch(event.target.action, {
            method: event.target.method,
            body: payload,
            headers: headers,
            mode: "cors",
            cache: "default",
        });

        if (raw.status === "403") window.location.assign("./login.html");
        if (!raw.ok) throw Error(`@kutbi:~$ Failed to fetch with ${event.event.method.toUpperCase()} from ${event.target.action}`);

        const your_bearer_token = "";
        const responsePayload = await raw.json();

        const x = local("create", "account", JSON.stringify({ account: responsePayload.account }));
        console.log(`@kutbi:~$ Your account details have been retrieved successfully from ${event.target.action}.`);
        
        return window.location.reload(); // window.location.assign("./login.html");
    } catch (error) {
        console.error(error);
        throw Error(`@kutbi:~$ We got a problem at handleFormSubmit() function. Please help!`);
    }
}

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
  }

export { handleGetForm, handleFormsWithBody };