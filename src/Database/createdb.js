const pool = require("./db");

const db = {
  async inicializadorBD() {
    try {
    } catch (err) {
      console.log(err);
    }
  },
  async criaBanco() {
    //cria tabela Estoque
    await pool.query(
      "CREATE TABLE 'estoques'" +
        +"(" +
        +"'idestoques' serial NOT NULL," +
        +"'nome'       varchar(100) NOT NULL," +
        +"'endereco'   varchar(100) NOT NULL," +
        +"'telefone'   int4range NOT NULL," +
        +"'tipo'       varchar(50) NOT NULL," +
        +"CONSTRAINT 'PK_estoques' PRIMARY KEY ( 'idestoques' )" +
        +");"
    );
  },
};
module.exports = db;
