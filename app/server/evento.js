var exports,
    tiposEvento = [{codigo: 'COMPRAR', text: 'Comprado', atualizaPosicao: comprar},
                  {codigo: 'VENDER', text: 'Vendido', atualizaPosicao: vender},
                  {codigo: 'BONIFICAÇÃO', text: 'Bonificação em ações', atualizaPosicao: bonificar},
                  {codigo: 'DIVIDENDOS', text: 'Recebimento de dividendos', atualizaPosicao: receberDividendos},
                  {codigo: 'JCP', text: 'Recebimendo de juros sobre capital próprio', atualizaPosicao: receberJCP}];

// Implementação de atualizaPosicao dos eventos

function comprar(posicao, evento) {
   var valorCompra = arredonda(evento.quantidade * evento.valorUnitario);
   //FIXME: corretagem
   posicao.quantidade += evento.quantidade;
   posicao.custoFinanceiro += valorCompra;
   posicao.custoContabil += valorCompra;

   return posicao;
}

function vender(posicao, evento) {
   var precoMedio = posicao.precoMedio(),
       precoMedioContabil = posicao.precoMedioContabil();

   posicao.quantidade -= evento.quantidade;
   posicao.custoContabil -= arredonda(precoMedioContabil * evento.quantidade)
   //FIXME: como afetar o custo financeiro em uma venda? Faz sentido?
   //posicao.custoFinanceiro -= arredonda(evento.quantidade * evento.valorUnitario);
   posicao.resultado += arredonda(evento.quantidade * (evento.valorUnitario - precoMedio))

   return posicao;
}

function bonificar(posicao, evento) {
   var quantidadeBonificada = posicao.quantidade * evento.quantidade;

   posicao.quantidade += quantidadeBonificada;
   posicao.custoContabil += arredonda(quantidadeBonificada * evento.valorUnitario);

   return posicao;
}

function receberDividendos(posicao, evento) {
   var totalDividendosRecebidos = arredonda(posicao.quantidade * evento.valorUnitario);

   posicao.custoFinanceiro -= totalDividendosRecebidos;
   posicao.resultado += totalDividendosRecebidos;

   return posicao;
}

function receberJCP(posicao, evento) {
   var totalJCPLiquido = arredonda(posicao.quantidade * evento.valorUnitario * 0.85);
   posicao.custoFinanceiro -= totalJCPLiquido;
   posicao.resultado += totalJCPLiquido;

   return posicao;
}

function Evento(codigoEvento, quantidade, valorUnitario, data, dataPagamento) {
   var self = this;

   self.evento = tiposEvento.filter(function(e) { return e.codigo == codigoEvento})[0];
   self.quantidade = quantidade;
   self.valorUnitario = valorUnitario;
   self.data = data;
   self.dataPagamento = !dataPagamento ? data : dataPagamento;

   this.atualizaPosicao = function(posicao) {
      if(! posicao) {
         posicao = {
            quantidade: 0,
            custoFinanceiro: 0,
            custoContabil: 0,
            resultado: 0,
            precoMedio: function() {
               return this.custoFinanceiro ? arredonda(this.custoFinanceiro / this.quantidade) : 0;
            },
            precoMedioContabil: function() {
               return this.custoContabil ? arredonda(this.custoContabil / this.quantidade) : 0;
            }
         }
      }

      return self.evento.atualizaPosicao(posicao, self);
   }
}

// Funções utilitárias

function arredonda(numero) {
   return Math.round(numero * 100) / 100;
}


// Exports

function criarEvento(codigoEvento, quantidade, valorUnitario, data, dataPagamento) {
   if(tiposEvento.every(function(event){ return event.codigo !== codigoEvento})) {
      throw 'Evento inexistente \'' + codigoEvento + '\'.';
   }

   return new Evento(codigoEvento, quantidade, valorUnitario, data, dataPagamento);

}

function calcularPosicao(eventos) {
   return eventos.reduce(function(ant, e) {
      return e.atualizaPosicao(ant);
   }, null);
}

exports.criar = criarEvento;
exports.calcularPosicao = calcularPosicao;
