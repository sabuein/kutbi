"use strict";

const getAllAuthors = async () => {
    try {
        const headers = new Headers();
        headers.set("Accept", "application/json; charset=UTF-8");
        headers.set("Content-Type", "application/json; charset=UTF-8");
        headers.set("User-Agent", "Kutbi Client (https://www.kutbi.com)");

        const url = "http://localhost:3557/authors";

        const init = {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default",
            credentials: "include"
        };
        
        const raw = await fetch(url, init);
        // if (!raw.ok) throw Error(`Failed to fetch with ${init.method.toUpperCase()} from ${url}`);
        const content = await raw.json();
        console.log(content.message);
        return content.result;
    } catch (error) {
        console.error(error);
        throw Error(`Something went wrong, please fix getAllAuthors();`);
    }
};

const enterAuthorsMatrix = async () => {
    try {
        const url = "http://localhost:3557/authors/matrix";
        
        const headers = new Headers();
        headers.set("Accept", "application/json; charset=UTF-8");
        headers.set("Content-Type", "application/json; charset=UTF-8");
        headers.set("User-Agent", "Kutbi Client (https://www.kutbi.com)");
        
        const init = {
            method: "POST",
            headers: headers,
            mode: "cors",
            cache: "default",
            credentials: "include"
        };

        const raw = await fetch(url, init);
        // if (!raw.ok) throw Error(`Failed to fetch with ${init.method.toUpperCase()} from ${url}`);
        const content = await raw.json();
        console.log(content.message);
        return content.result;
    } catch (error) {
        console.error(error);
    }
};

const checkEmailType = (input) => {
    console.log(input.checkValidity);
    (input.validity.typeMismatch)
    ? input.setCustomValidity("I am expecting an email address!")
    : input.setCustomValidity("");
};

const checkEmailValidity = (input) => {
    console.log(input.checkValidity);
    (input.validity.valid)
    ? input.setCustomValidity("")
    : input.setCustomValidity("Invalid email address!");
};

const checkPasswordEquality = (input) => {
    console.log(input.checkValidity);
    (input.validity.typeMismatch)
    ? input.setCustomValidity("Retyped password does not match the original password!")
    : input.setCustomValidity("");
};

const handleInput = (input) => {
    console.log(input.checkValidity);
    if (!(!!input && input instanceof HTMLElement && !!input.value)) throw Error("Please check the input type and value.");
    try {
        if (input.type === "email") input.addEventListener("input", checkEmailType, false);
        if (input.type === "password") input.addEventListener("input", checkPasswordEquality, false);
        input.addEventListener("input", validateInput, false);
        input.addEventListener("keyup", validateInput, false);
        input.addEventListener("change", validateInput, false);
    } catch (error) {
        console.log(error);
    }
};

const sanitizeInput = (value) => {
    try {
        // Remove leading/trailing whitespace
        return value.trim();
    } catch (error) {
        console.error(error);
        throw Error(`Something went wrong, please fix sanitizeInput();`);
    }
};

const validateInput = async (input) => {
    if (!(!!input && input instanceof HTMLElement && !!input.value)) throw Error("Please check the input type and value.");
    const type = input.type;
    const val = sanitizeInput(input.value);
    const len = val.length;
    const lowered = val.toLowerCase();
    try {
        switch (type) {
            case "number":
                return !isNaN(parseFloat(val));
            case "text":
                if (input.name === "username") { // HTML minlength="4" maxlength="16"
                    if (4 > len) throw RangeError(`The username can't be less than 4 characters. Current input: ${len} characters.`);
                    if (len > 16) throw RangeError(`The username can't be more than 16 characters. Current input: ${len} characters.`);
                    return (4 <  len && len < 16);
                }
                return true;
            case "url":
                // pattern="https?://.+" title="Include http://"
                return true;
            case "search":
                // pattern="[^'\x22]+" title="Invalid input"> Can't contain characters: ' or "
                return true;
            case "textarea":
                return true;
            case "select":
                return true;
            case "radio":
                return Boolean(val);
            case "checkbox":
                return Boolean(val);
            case "password":
                /* #TODO:
                Only alphanumeric inputs are accepted in the password field.
                It should start with the uppercase alphabet.
                At Least one uppercase alphabet password.
                One numeric value must be used in the password.
                */
                if (8 > len) throw RangeError(`The password can't be less than 8 characters. The entered password has ${len} characters.`);
                if (len > 64) throw RangeError(`The password can't be more than 64 characters. The entered password has ${len} characters.`);
                // Must contain at least one number and one uppercase and lowercase letter, at least 8 characters, and at most 64 characters.
                const passwordPattern = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,64}/);
                return !passwordPattern.test(val.toLowerCase());
            case "email":
                if (8 > len) throw RangeError(`The email can't be less than 8 characters. The entered email has ${len} characters.`);
                if (len > 64) throw RangeError(`The email can't be more than 64 characters. The entered email has ${len} characters.`);
                input.addEventListener("input", checkEmailType, false);
                // Must contain a number of characters followed by an @ sign, followed by more characters, and then a period "."
                const emailPattern = new RegExp(/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{8,64}$/);
                return !emailPattern.test(lowered);
        }

        // Maybe other stuff?
        
    } catch (error) {
        console.error(error);
        throw Error(`Something went wrong, please fix validateInput();`);
    }
};

export { getAllAuthors, handleInput, validateInput, enterAuthorsMatrix };