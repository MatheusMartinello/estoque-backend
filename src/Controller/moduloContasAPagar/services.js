const pool = require("../Database/db");
const service = {
  geraData() {
    time = new Date(Date.now())
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");
    return time;
  },
  async geraMovimentacao({ valor, situacao, juros = 0, multa = 0 }) {
    try {
      await pool.query(
        "INSERT INTO movimentos(data,valororiginal,tipo,juros,multa)values($1,$2,$3,$4,$5)",
        [this.geraData(), valor, situacao, juros, multa]
      );
      const result = await pool.query(
        "SELECT MAX(idmovimentos) from movimentos"
      );
      return result.rows[0].max;
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = service;
