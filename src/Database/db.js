const Pool = require("pg").Pool;

//configurar banco
const pool = new Pool({
  user: "ctxoejxugrovkf",
  password: "4160a522d984aa3300468252c1b10df0c9b0587c58f4e3c0dfca6fc785997469",
  host: "ec2-52-3-4-232.compute-1.amazonaws.com",
  port: "5432",
  database: "d70iagsvq8h26g",
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
