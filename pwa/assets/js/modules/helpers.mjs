"use strict";

const id = (id) => document.getElementById(id);
const qs = (qs) => document.querySelector(qs);

const createObject = (array) => {
    // Create an empty object to store the key-value pairs
    const result = {};
    try {
        // Loop through parameters and add it to the result object
        array.forEach(param => {
            const [key, value] = param.split("=");
            // If the key already exists, convert the value to an array
            if (result.hasOwnProperty(key)) {
                if (!Array.isArray(result[key])) {
                    result[key] = [result[key]];
                }
                result[key].push(decodeURIComponent(value));
            } else {
                result[key] = decodeURIComponent(value);
            }
        });
        return removeEmptyStringProperties(result);
    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at createObject() function. Please help!`);
    }
};

const removeEmptyStringProperties = (object) => {
    for (let key in object) {
        if (object.hasOwnProperty(key) && object[key] === "") delete object[key];
    }
    return object;
};

const urlWithQuery = (form) => {
    const location = window.location;
    const formData = new FormData(form);
    const queryString = new URLSearchParams(formData).toString();
    const port = (location.port ? `:${location.port}` : ``);
    const url = `${location.protocol}//${location.hostname}${port}${location.pathname}?${queryString}${location.hash}`;
    console.log(`Generated URL: ${url}`);
    return url;
};

const urlToJSON = (url) => {
    try {
        let params, result, queryString = url.split("?")[1], location = queryString.split("#")[1];
        
        if (location) {
            let paramsRaw = queryString.split("#")[0];
            params = paramsRaw.split("&");
            result = createObject(params);
            result.location = location;
        } else {
            // Split the query string into individual parameters
            params = queryString.split("&");
            result = createObject(params);
        }

        // A temporary logger
        console.log(prettyJSON(result));

        // Just to double check
        return (!typeof result === "object") ? JSON.parse(result) : result;
    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at urlToJSON() function. Please help!`);
    }
};

// Pretty JSON (as a text string) with spacing level of 2
const prettyJSON = (obj) => JSON.stringify(obj, null, 2);

const encode = (string) => btoa(string);
const decode = (string) => atob(string);

const assert = (value, message) => {
    if (!value) throw (message || `${value} is false`);
};

const assertEqual = (value1, value2, message) => {
    if (value1 !== value2) throw (message || `${value1} does not equal ${value2}`);
};

export {
    id,
    qs,
    urlWithQuery,
    urlToJSON,
    encode,
    decode
};