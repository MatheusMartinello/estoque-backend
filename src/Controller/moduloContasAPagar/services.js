const pool = require("../../Database/db");
function geraData() {
  time = new Date(Date.now()).toISOString().replace("T", " ").replace("Z", "");
  return time;
}
const service = {
  async geraMovimentacao({ valorTotal, situacao, juros = 0, multa = 0 }) {
    try {
      await pool.query(
        "INSERT INTO movimentos(data,valororiginal,tipo,juros,multa)values($1,$2,$3,$4,$5)",
        [geraData(), valorTotal, situacao, juros, multa]
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
