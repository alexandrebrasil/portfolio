'use strict';

var stockEvent = require('../../app/server/stock-event.js');
var expect = require('chai').expect;

describe('Ciclo de vida de uma ação', function() {
   describe('#criar', function(){
      context('Evento inexistente', function() {
         it('Deve lançar um erro', function(){
            expect(function(){stockEvent.criar('NÃO-EVENTO')}).to.throw('Evento inexistente \'NÃO-EVENTO\'');
         })
      });
   })
   describe('#calcularPosicao', function(){
      var compra;

      before('Setup de compra', function() {
         compra = stockEvent.criar('COMPRAR', 100, 2.05, '2015-01-01');
      })

      describe('Comprando ações', function() {
         it('Configuração dos campos', function() {
            expect(compra.quantidade).to.be.equal(100);
            expect(compra.valorUnitario).to.be.equal(2.05);
            expect(compra.data).to.be.equal('2015-01-01');
            expect(compra.dataPagamento).to.be.equal('2015-01-01');
         })

         it('Ao calcular a posição, comprar ações deve adicionar ações e aumentar o custo monetario e contabil', function() {
            var resultado = stockEvent.calcularPosicao([compra]);
            expect(resultado.custoFinanceiro).to.be.equal(205);
            expect(resultado.custoContabil).to.be.equal(205);
            expect(resultado.quantidade).to.be.equal(100);
            expect(resultado.precoMedio()).to.be.equal(2.05);
            expect(resultado.precoMedioContabil()).to.be.equal(2.05);
         })
      })

      describe('Bonificação de ações', function() {
         var bonificacao;

         before(function() {
            bonificacao = stockEvent.criar('BONIFICAÇÃO', 0.2, 1.27, '2015-02-05');
         })

         it('Ao receber uma bonificação, o custo financeiro não se altera, mas o custo contábil e a quantidade de ações sim', function() {
            var posicao = stockEvent.calcularPosicao([compra, bonificacao]);
            expect(posicao.quantidade).to.be.equal(120);
            expect(posicao.custoFinanceiro).to.be.equal(205);
            expect(posicao.custoContabil).to.be.equal(205 + 20 * 1.27);
            expect(posicao.precoMedio()).to.be.equal(Math.round(205 / 120 * 100) / 100);
            expect(posicao.precoMedioContabil()).to.be.equal(Math.round((205 + 20 * 1.27) / 120 * 100) / 100);
         })

         it('Condições erradas devem ser bem tratadas, sem lançar erro no cálculo da posição', function() {
            var posicao = stockEvent.calcularPosicao([bonificacao]);
            expect(posicao.precoMedio()).to.be.equal(0);
            expect(posicao.precoMedioContabil()).to.be.equal(0);
         })
      })

      describe('Recebimento de dividendos', function() {
         var dividendos;
         before('Criação dos eventos', function() {
             dividendos = stockEvent.criar('DIVIDENDOS', 0, 1.10, '2015-05-12', '2015-07-01');
         })

         it('Configuração dos campos', function() {
            expect(dividendos.quantidade).to.be.equal(0);
            expect(dividendos.valorUnitario).to.be.equal(1.10);
            expect(dividendos.data).to.be.equal('2015-05-12');
            expect(dividendos.dataPagamento).to.be.equal('2015-07-01');
         })

         it('Ao receber dividendos, o custo financeiro é reduzido, mas o custo contábil não se altera', function() {
            var posicao = stockEvent.calcularPosicao([compra, dividendos]);
            expect(posicao.quantidade).to.be.equal(100);
            expect(posicao.custoFinanceiro).to.be.equal(95);
            expect(posicao.custoContabil).to.be.equal(205);
            expect(posicao.precoMedio()).to.be.equal(0.95);
            expect(posicao.precoMedioContabil()).to.be.equal(2.05);
            expect(posicao.resultado).to.be.equal(110);
         })
      })

      describe('Juros sobre Capital Próprio', function() {
         var jcp;

         before('Criação do evento', function() {
            jcp = stockEvent.criar('JCP', 0, 1.00, '2015-05-12', '2015-05-20');
         })

         it('Configuração dos campos', function() {
            expect(jcp.quantidade).to.be.equal(0);
            expect(jcp.valorUnitario).to.be.equal(1);
            expect(jcp.data).to.be.equal('2015-05-12');
            expect(jcp.dataPagamento).to.be.equal('2015-05-20');
         })

         it('Ao receber JCP, 15% de IR devem ser descontados do valor unitário, e o resultado reduzido do custo financeiro, mas não do contábil', function() {
            var posicao = stockEvent.calcularPosicao([compra, jcp]);
            expect(posicao.quantidade).to.be.equal(100);
            expect(posicao.custoFinanceiro).to.be.equal(120);
            expect(posicao.custoContabil).to.be.equal(205);
            expect(posicao.resultado).to.be.equal(85);
         })
      })

      describe('Vendendo ações', function() {
         var venda;

         before(function() {
            venda = stockEvent.criar('VENDER', 50, 3.05, '2015-01-01');
         })

         it('Configuração dos campos', function() {
            expect(venda.quantidade).to.be.equal(50);
            expect(venda.valorUnitario).to.be.equal(3.05);
            expect(venda.data).to.be.equal('2015-01-01');
            expect(venda.dataPagamento).to.be.equal('2015-01-01');
         })

         it('Ao calcular posição, vender ações deve remover ações e gerar um resultado', function() {
            var posicao = stockEvent.calcularPosicao([compra, venda]);
            expect(posicao.quantidade).to.be.equal(50);
            //FIXME: o que deveria ser o preço médio?
            //expect(posicao.precoMedio()).to.be.equal(2.05);
            expect(posicao.precoMedioContabil()).to.be.equal(2.05);
            expect(posicao.resultado).to.be.equal(50);
         })
      })
   })
})
