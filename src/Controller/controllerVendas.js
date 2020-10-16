const express = require('express');
const router = express.Router();
const pool = require('../Database/db');
const servico = require('../services/Services');
function controllerCriacao() {
  return (req, res, next) => {
    next();
  }
}
router.post("/adiciona/carrinho/:idproduto/:idestoque",async(req,res)=>{
    const {idprodtuos , idestoque } = req.params;
    const produto = servico.getIdProduto(idprodtuos , idestoque);
    await pool.query("INSERT INTO carrinho(idproduto,idestoque,idcarrinho,valortotal) values($1,$2,$3,$4)",[idproduto,idestoque,idcarrinho,valortotal])
});

router.get("/vitrine",async (req,res)=>{
    const produtos = await pool.query("SELECT * from produtos");
    
})

module.exports = (controllerCriacao, (app) => app.use("/venda", router));