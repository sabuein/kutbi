"use strict";

import { app } from "./modules/app.mjs";

const port = 3558 || 3000;

app.listen(port, (error) => {
    if (error) console.log(error);
    console.log(`Kutbi is running and listening on port ${port}.\r\n`);
});

/*

// GET, POST, PUT, DELETE, etc.

res.sendStatus(500);
res.status(500).send("Nothing");
res.download("server.mjs");
res.render("index");
res.render("index", { name: "Salaheddin" });

*/