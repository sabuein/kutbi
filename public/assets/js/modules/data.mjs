"use strict";

const getAllAuthors = async () => {
    try {
        const url = "http://localhost:3456/authors", myHeaders = new Headers();
        let init = {
            method: "get",
            headers: myHeaders,
            mode: "cors",
            cache: "default"
        };
        const response = await fetch(url, init);
        return await response.json();
    } catch (error) {
        console.log(`Error: ${error}`);
    }
};

export { getAllAuthors };