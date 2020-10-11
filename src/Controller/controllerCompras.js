const express = require('express');
const router = express.Router();
const pool = require('../Database/db')
const servico = require('../services/Services');
function controllerCompras() {
  return (req, res, next) => {
    next();
  };
}
router.post("/proposta", async (req, res) => {
  const { idusuario, idproduto } = req.body;
  const geraCotacaoId = await servico.geraPedidoCotacao(idusuario);
  geraCotacaoId
    ? await geraCotacoesNosEstoques(
      idproduto,
      idusuario,
      geraCotacaoId.rows[0].max
    )
    : res.status(400).send("Nao foi possivel gerar cotacao");
  const result = await pool.query(
    "SELECT * from cotacoes_produtos where idcotacoes = $1",
    [geraCotacaoId.rows[0].max]
  );
  res.send(result.rows);
});
router.get("/proposta/:idproposta", async (req, res) => {
  const idproposta = req.params.idproposta;
  const pegaProposta = await servico.pegaMelhorProposta(idproposta);
  res.send(pegaProposta);
});
router.post("/ordemcompra", async (req, res) => {
  const { idproposta, autoriacao } = req.body;
  const proposta = await servico.pegaMelhorProposta(idproposta);
  await pool.query(
    "INSERT INTO ordemfornecimento(idcotacoes,idusuario,idprodutos,idestoques,autoriacao)values($1,$2,$3,$4,$5)",
    [
      proposta.idcotacoes,
      proposta.idusuario,
      proposta.idprodutos,
      proposta.idestoques,
      autoriacao,
    ]
  );
  res.send("Confirmacao de compra adicionada!");
});
router.post("/recebido", async (req, res) => {
  const { idordemfornecimento } = req.body;
  const nota = await servico.geraNota("Entrada");
  try {
    await pool.query(
      "INSERT INTO entrada(data,idordemfornecimento,idnotafiscal)values($1,$2,$3)",
      [await servico.geraDataAtual(), idordemfornecimento, nota]
    );
    res.send("Recebido!");
  } catch (error) {
    res.status(400).send("Nao foi possivel dar entrada");
  }
});
module.exports = (controllerCompras, (app) => app.use("/compras", router));