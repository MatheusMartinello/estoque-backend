const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { criaBanco } = require("./Database/createdb");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require("./Controller/controllerCompras")(app);
require("./Controller/controllerCriacao")(app);
require("./Controller/moduloContasAPagar/controllerContasAPagar")(app);
// require("./controller/controllerEntrada")(app);
require("./Controller/controllerVendas")(app);
app.listen(3001, () => {
  criaBanco();
  console.log("Server esta ativo na porta ==> 3001!");
});
