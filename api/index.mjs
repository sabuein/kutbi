import { app } from "./modules/app.mjs";

const port = 3456 || 3000;

app.listen(port, () => {
    console.log(`Kutbi is running on port ${port}\r\n`);
});

/*

// GET, POST, PUT, DELETE, etc.

res.sendStatus(500);
res.status(500).send("Nothing");
res.download("server.mjs");
res.render("index");
res.render("index", { name: "Salaheddin" });



*/