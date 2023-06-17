"use strict";

import { urlWithQuery, urlToJSON } from "./helpers.mjs";

// GET, POST, PUT, DELETE, etc.

const parseGetSubmit = (form) => {
    if (form.method !== "get") throw TypeError(`Please check form(#${form.id} method`);
    try {
        form.addEventListener("submit", (event) => {
            console.log("Hi there...");
            event.preventDefault();
            console.log(`An intercepted HTTP GET submission by form(#${form.id}) is being parsed as JSON within the console and returned as a JavaScript object...`);
            const url = urlWithQuery(form);
            return urlToJSON(url);
        });
    } catch (e) {
        console.error(e);
        throw Error(`We got a problem at catchGetForm() function. Please help!`);
    }
};

const handlePostSubmit = (form, endpoint) => {
    try {
        const formData = new FormData(form);
        console.dir(formData);
        
        const fakeData = {
            key1: "value1",
            key2: "value2",
            // Add more key-value pairs as needed
        };

        const requestOptions = {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(fakeData)
        };

        fetch(endpoint, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Handle the response
                console.log(`data type: ${typeof data}`);
                console.log(`response: ${data}`);
            })
            .catch(error => {
                console.error(error);
                throw Error(`We got a problem at handlePostSubmit() function. Please help!`);
            });

    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at handlePostSubmit() function. Please help!`);
    }
}

export { parseGetSubmit, handlePostSubmit };