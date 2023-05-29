"use strict";

const timestamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

export { timestamp, };