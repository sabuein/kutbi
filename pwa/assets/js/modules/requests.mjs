"use strict";

import { local, session } from "./apis.mjs";
import { handleInput, validateInput } from "./data.mjs";
import { urlWithQuery, urlToJSON, encode, decode, getCookie } from "./helpers.mjs";

/*
// Add the following as the third parameter of addEventListener()
const controller = new AbortController();
const signal = controller.signal;
controller.abort();

// Or use the static method { signal: AbortSignal.timeout(5000) }
*/

const formElementsAreValid = async (elements) => {
    // Checks if the signin/singup form elements are valid and ready to be used in the HTTP request
    try {
        const { username, email, password, passwordX } = elements,
            match = (!!passwordX) ? (password.value === passwordX.value) : false,
            usernameIsValid = await validateInput(username),
            emailIsValid = await validateInput(email),
            passwordIsValid = await validateInput(password);

        console.log(usernameIsValid ? "✅ Valid" : "❌ Invalid", "username input.");
        console.log(emailIsValid ? "✅ Valid" : "❌ Invalid", "email input.");
        console.log(passwordIsValid ? "✅ Valid" : "❌ Invalid", "password input.");

        if (!usernameIsValid) throw Error("The username is invalid");
        if (!emailIsValid) throw Error("The email address is invalid");
        if (!passwordIsValid) throw Error("The password is invalid");
        if (!!passwordX && !match) {
            passwordX.addEventListener("input", handleInput, false);
            console.log("❌ Passwords do not match.");
            throw Error("Passwords do not match");
        } else if (!!passwordX && !!match) console.log("✅ Password do match.");
        return true;
    } catch (error) {
        console.error(error);
    }
};

const fetchJSON = async (url, options = null) => {
    const request = new Request(url),
        controller = new AbortController(),
        signal = controller.signal,
        cachedResponse = await caches.match(request, { cacheName: "kutbi-1" });
    if (!!cachedResponse && !!cachedResponse.ok) return cachedResponse.json();
    try {
        const xHeaders = new Headers();
        xHeaders.set("Accept", "application/json; charset=UTF-8");
        xHeaders.set("Content-Type", "application/json; charset=UTF-8");
        // opHeaders.set("Access-Control-Allow-Headers", "");
        // opHeaders.set("Authorization", `Bearer ${ tokens ? tokens.access : "HI" }`);
        xHeaders.set("X-Requested-With", "X");
        xHeaders.set("X-Access-Token", "X");
        xHeaders.set("User-Agent", "Kutbi Client (https://www.kutbi.com)");
        xHeaders.set("Cookie", document.cookie); // Include cookies
        const xOptions = {
            method: "get",
            headers: xHeaders,
            mode: "cors",
            cache: "default",
            // signal: signal
            // credentials: "include"
        };
        const response = await fetch(url, options || xOptions);
        if (!!response && !!response.ok) return await response.json();
    } catch (error) {
        if (error instanceof SyntaxError) console.log("There was a SyntaxError: ", error);
        else console.error(error);
    } finally {
        // Cancel the fetch request in 3 seconds
        // setTimeout(() => controller.abort(), 5000);
    }
};

const handleFormsWithBody = async (event) => {

    if (!(!!event.target && event.target instanceof HTMLFormElement)) throw Error("Please check the form type");
    
    const log = ({
        form: {
            action: event.target.action,
            method: event.target.method
        },
        headers: new Headers()
    });

    try {
        // Some constraints
        if (!event.isTrusted) throw Error(`@kutbi:~$ The form submission is not trusted`);
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!(await formElementsAreValid(event.target.elements))) throw Error("Form inputs are invalid");

        // event.target.elements.forEach(element => console.log(element)); // handleInput

        const requestBody = {};
        const formData = new FormData(event.target);
        formData.forEach((value, key) => {
            if (key === "username" || key === "email" || key === "password") requestBody[key] = value;
        });
        // (TODO: Uncomment in production) event.target.reset();

        // Content-Type: image/png
        // Content-Type: text/html; charset=UTF-8;
        // Content-Type: application/xml
        // Content-Type: application/x-www-form-urlencoded;
        // Content-Type: multipart/form-data;
        // The content type for JSONP (padded JSON) is application/javascript

        const tokens = (local("read", "tokens")) ? JSON.parse(local("read", "tokens")) : null;
        log.headers.set("Accept", "application/json; charset=UTF-8");
        log.headers.set("Content-Type", "application/json; charset=UTF-8");
        log.headers.set("Access-Control-Allow-Headers", "");
        log.headers.set("Authorization", `Bearer ${ tokens ? tokens.access : "HI" }`);
        log.headers.set("X-Requested-With", "X");
        log.headers.set("X-Access-Token", "X");
        log.headers.set("User-Agent", "Kutbi Client (https://www.kutbi.com)");
        log.headers.set("Cookie", document.cookie); // Include cookies

        // headers.forEach((value, key) => log.headers[key] = value);

        const payload = JSON.stringify({
            "account": encode(JSON.stringify(requestBody))
        });

        log.body = requestBody;
        log.encoded = payload;

        // In another words, in 'mode' '-no-'cors' you can only set application/x-www-form-urlencoded, multipart/form-data, or text/plain to the Content-Type.
        
        const raw = await fetch(event.target.action, {
            method: event.target.method,
            body: payload,
            headers: log.headers,
            mode: "cors",
            cache: "default",
            credentials: "include"
        });
        
        const responsePayload = await raw.json();

        if (raw.status === 400 || raw.status === 401 || raw.status === 403 ) {
            log.error = responsePayload;
            alert(JSON.stringify(responsePayload, null, 2));
            console.log(JSON.stringify(responsePayload, null, 2));
            // throw Error(JSON.stringify({...responsePayload}, null, 2));
        } else {
            log.success = responsePayload;
        }
        
        const cookies = window.document?.cookie;
        if (!!cookies) {
            console.log(cookies);
            console.log(getCookie("accessToken"));
        }

        // Save to the browser local storage
        local("create", "account", JSON.stringify({ loggen: 0, account: responsePayload.account }));
        local("update", "loggen", (0).toString());
        // return window.location.reload(); // window.location.assign("./login.html");
    } catch (error) {
        console.error(error);
        if (!!log.error) console.log(JSON.stringify(log.error, null, 2));
    } finally {
        // console.dir(log);
        if (!!log.success) console.log(JSON.stringify(log.success, null, 2));
        
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

export { handleGetForm, handleFormsWithBody, fetchJSON };