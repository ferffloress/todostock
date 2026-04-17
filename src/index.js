const app = require("../app");
const seed = require("./seed");

seed();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("TodoStock S.A. - Backend REST");
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
