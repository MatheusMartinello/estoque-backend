const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require("./Controller/controllerCompras")(app);
require("./Controller/controllerCriacao")(app);

// require("./controller/controllerEntrada")(app);
require("./controller/controllerVendas")(app);

app.listen(3001, () => {
  console.log("Server esta ativo na porta ==> 3001!");
});
