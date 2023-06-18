"use strict";

const getAllAuthors = async () => {
    try {
        const headersInit = {
            "accept": "application/json",
            "user-agent": "kutbi client (https://www.kutbi.com)",
            "content-type": "application/json; charset=utf-8"
        };
        const url = "http://localhost:3558/authors";
        const init = {
            method: "get",
            headers: headersInit,
            mode: "cors",
            cache: "default"
        };
        const response = await fetch(url, init);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at getAllAuthors() function. Please help!`);
    }
};

const clearStorage = () => {
    try {
        window.localStorage.clear();
        window.location.assign(window.location);
    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at clearStorage() function. Please help!`);
    }
};

export { getAllAuthors };