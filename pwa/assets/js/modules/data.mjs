"use strict";

const getAllAuthors = async () => {
    try {
        const headers = new Headers();
        headers.set("Accept", "application/json; charset=utf-8");
        headers.set("Content-Type", "text/plain; charset=utf-8");
        headers.set("User-Agent", "Kutbi Client (https://www.kutbi.com)");

        const url = "http://localhost:3557/authors";

        const init = {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default"
        };
        
        const raw = await fetch(url, init);

        console.log(raw);
        
        if (!raw.ok) throw Error(`Failed to fetch with ${init.method.toUpperCase()} from ${url}`);

        const content = await raw.json();

        return content;

    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at getAllAuthors() function. Please help!`);
    }
};

export { getAllAuthors };