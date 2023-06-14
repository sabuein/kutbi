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

const getCSRF = () => {
    fetch("http://localhost:3456/tokens/csrf")
        .then(response => response.json())
        .then(data => {
            const csrfToken = data.csrfToken;
            // Use the received CSRF token in your form
        })
        .catch(error => {
            console.error("Error retrieving CSRF token:", error);
        });
};

export { getAllAuthors };