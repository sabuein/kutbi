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

const scanQRCode = (canvas, context) => { // Scanner for QR codes
    try {
        // Extract the QR code from the canvas image
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const codeReader = new ZXing.BrowserQRCodeReader();

        codeReader.decodeFromImage(imageData)
            .then(function (result) {
                console.log("Scanned:", result.text);
                // Do something with the scanned QR code content
            })
            .catch(function (error) {
                console.error("Error decoding QR code:", error);
            })
            .finally(function () {
                // Continue scanning for QR codes
                requestAnimationFrame(scanQRCode);
            });
    } catch (error) {
        throw Error("Error accessing camera:", error);
    }
};

const captureFrame = (video, canvas, context) => {
    try {
        // Capture the current video frame in the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Process the captured frame (barcode decoding logic goes here)

        // Continuously capture frames
        requestAnimationFrame(captureFrame);
    } catch (error) {
        throw Error("Error accessing camera:", error);
    }
};

const getVideoStream = (mode) => {
    // Request camera access and start capturing frames (photo, bar codes, QR codes, etc.)
    const videoElement = id("video-preview");

    // Check for browser support
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) throw Error("getUserMedia is not supported in this browser");
    try {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                // Set video source to the camera stream
                videoElement.srcObject = stream;
                videoElement.play();

                // Create a canvas element to capture video frames
                const canvasElement = document.createElement("canvas");
                // Create the canvas context
                const canvasContext = canvas.getContext("2d");

                // Set canvas dimensions to match the video feed
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                
                switch (mode) {
                    case "barcode":
                        // Start scanning for a QR code
                        scanQRCode(canvasElement, canvasContext);
                        break;
                    case "qrcode":
                        // Start scanning for a QR code
                        scanQRCode(canvasElement, canvasContext);
                        // Start capturing frames
                captureFrame(videoElement, canvasElement, canvasContext);
                        break;
                    default:
                        break;
                }

                
            })
            .catch(function (error) {
                console.error("Error accessing camera:", error);
            });
    } catch (error) {
        console.error(error);
    }
};

const getCookie = (cookieName) => {
    try {
        const name = cookieName + "=";
        const decodedCookies = decodeURIComponent(window.document.cookie);
        const cookies = decodedCookies.split(";");
        for(let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === " ") {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return null;
    } catch (error) {
        console.error(error);
    }
};

export {
    id,
    qs,
    urlWithQuery,
    urlToJSON,
    encode,
    decode,
    getCookie
};