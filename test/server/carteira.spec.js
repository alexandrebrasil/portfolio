'use strict';

var expect = require('chai').expect;
var Carteira = require('../../app/server/carteira.js').Carteira;

describe('Carteira de investimentos', function(){
	var carteira;

	beforeEach('Criando carteira', function() {
		carteira = new Carteira();
	})

	describe('Adicionando empresas à carteira', function() {
		it('Deve poder adicionar uma nova empresa', function() {
			expect(carteira.empresas()).to.be.empty;

			carteira.adicionarEmpresa('Cielo S.A.', 12345);

			expect(carteira.empresas()).to.have.length(1);

			var cielo = carteira.empresas()[0];
			expect(cielo.nome).to.be.equal('Cielo S.A.');
			expect(cielo.codigoBovespa).to.be.equal(12345);
		});

		it('Empresas de uma carteira devem ser ordenadas alfabeticamente, independente da ordem em que forem incluidas', function() {
			carteira.adicionarEmpresa('Petrobras S.A.', 1);
			carteira.adicionarEmpresa('Vale S.A.', 2);
			carteira.adicionarEmpresa('Cielo S.A.', 3);

			expect(carteira.empresas()).to.have.length(3);
			expect(carteira.empresas()[0].nome).to.be.equal('Cielo S.A.');
			expect(carteira.empresas()[1].nome).to.be.equal('Petrobras S.A.');
			expect(carteira.empresas()[2].nome).to.be.equal('Vale S.A.');
		})
	})

	describe('Configuração dos custos de operação', function() {
		it('Devo poder configurar a corretagem fixa', function() {
			carteira.corretagem(20.40);
			expect(carteira.corretagem()).to.be.equal(20.40);
		})

		it('Devo poder configurar a taxa de liquidacao', function() {
			carteira.liquidacao(0.004);
			expect(carteira.liquidacao()).to.be.equal(0.004);
		})

		it('Devo poder configurar a taxa de emolumentos', function() {
			carteira.emolumentos(0.14);
			expect(carteira.emolumentos()).to.be.equal(0.14)
		})
	})

	it('Dada uma empresa, devo poder adicionar um título/ação à ela', function() {
		var cielo = carteira.adicionarEmpresa('Cielo S.A.', 12345);

		expect(cielo.acoes).to.be.empty;

		cielo.adicionarAcao('CIEL3');
		expect(cielo.acoes).to.have.length(1);
		expect(cielo.acoes[0].codigo).to.be.equal('CIEL3');
		expect(cielo.acoes[0].eventos).to.be.empty;
	});

	describe('Ação: operações', function() {
		var cielo, ciel3;
		beforeEach('Adicionando empresa', function() {
			cielo = carteira.adicionarEmpresa('Cielo S.A.', 12345);
			ciel3 = cielo.adicionarAcao('CIEL3');
		})

		context('Comprar', function() {
			it('Compras: ação inexistente deve gerar erro', function() {
				expect(function(){carteira.comprar('ciel4', 1, 1)}).to.throw('Ação não encontrada');
			})

			it('Compras: deve registrar quantidade, custo, corretagem, emolumentos, etc', function() {
				carteira.corretagem(20.00);
				carteira.emolumentos(0.00005);
				carteira.liquidacao(0.000275);

				carteira.comprar('CIEL3', 10000, 30.00, '2013-03-01');

				expect(ciel3.quantidade).to.be.equal(10000);
				expect(ciel3.custoFinanceiro).to.be.equal(300117.50);
				expect(ciel3.custoContabil).to.be.equal(300117.50);
				expect(ciel3.custoUnitario).to.be.equal(30.01);
			});

			it('Compras multiplas devem afetar os custos e preço médio', function() {
				carteira.comprar('CIEL3', 10000, 30.00, '2013-03-01');
				carteira.comprar('CIEL3', 10000, 40.00, '2014-03-01');

				expect(ciel3.custoFinanceiro).to.be.equal(700000);
				expect(ciel3.custoContabil).to.be.equal(700000);
				expect(ciel3.custoUnitario).to.be.equal(35.00);
				expect(ciel3.custoUnitarioContabil).to.be.equal(35.00);
				expect(ciel3.quantidade).to.be.equal(20000);
			})
		})

		context('Bonificar', function() {
			it('Bonificação deve tratar quantidade como percentual sobre a quantidade já existente', function() {
				carteira.comprar('CIEL3', 1000, 30.00, '2013-03-01');
				carteira.bonificar('CIEL3', 10, 1, '2013-03-05');

				expect(ciel3.quantidade).to.be.equal(1100);
			})

			it('Bonificações fracionárias devem ser truncadas, e não arredondadas', function() {
				carteira.comprar('CIEL3', 10, 30.00, '2013-03-01');
				carteira.bonificar('CIEL3', 37, 1, '2013-03-05');

				expect(ciel3.quantidade).to.be.equal(13);
			})

			it('Bonificações que ocorram antes de haver posição não devem afetar carteira', function() {
				carteira.comprar('CIEL3', 1000, 30.00, '2013-03-01');
				carteira.bonificar('CIEL3', 10, 1, '2013-02-05');

				expect(ciel3.quantidade).to.be.equal(1000);
			})

			it('Bonificação deve afetar o custo contábil, mas não o custo financeiro. Taxas da corretora não são aplicáveis.', function() {
				carteira.corretagem(20.00);
				carteira.emolumentos(0.00005);
				carteira.liquidacao(0.000275);

				carteira.comprar('CIEL3', 10000, 30.00, '2013-03-01');
				carteira.bonificar('CIEL3', 10, 10, '2013-03-05');

				expect(ciel3.quantidade).to.be.equal(11000);
				expect(ciel3.custoFinanceiro).to.be.equal(300117.50);
				expect(ciel3.custoContabil).to.be.equal(310117.50);
				expect(ciel3.custoUnitario).to.be.equal(27.28);
				expect(ciel3.custoUnitarioContabil).to.be.equal(28.19)
			})
		})

		context('Recebimento de divivendos', function() {
			beforeEach('Configurar cateira com algumas ações', function() {
				carteira.comprar('CIEL3', 100, 20, '2013-08-12');
			})

			it('Não deve alterar a quantidade de alções', function() {
				carteira.dividendos('CIEL3', 1, '2013-08-13', '2013-08-13')

				expect(ciel3.quantidade).to.be.equal(100);
			})

			it('Devem baixar o custo financeiro total e unitário, mas não devem alterar os contábeis', function() {
				carteira.dividendos('CIEL3', 1, '2013-08-13', '2013-08-13');
				expect(ciel3.custoFinanceiro).to.be.equal(1900);
				expect(ciel3.custoUnitario).to.be.equal(19.00);
				expect(ciel3.custoContabil).to.be.equal(2000);
				expect(ciel3.custoUnitarioContabil).to.be.equal(20.00);
			})

			it('Devem ser relativos à quantidade na carteira na data-ex', function() {
				carteira.comprar('CIEL3', 100, 20, '2013-08-14');
				carteira.dividendos('CIEL3', 1, '2013-08-13', '2013-08-13');

				expect(ciel3.custoFinanceiro).to.be.equal(3900);
				expect(ciel3.custoUnitario).to.be.equal(19.50);
				expect(ciel3.custoContabil).to.be.equal(4000);
				expect(ciel3.custoUnitarioContabil).to.be.equal(20.00);
			})

			it('Devem ser reportados nos resultados financeiros isentos de IR da ação, empresa e carteira', function() {
				carteira.comprar('CIEL3', 100, 20, '2013-08-14');
				carteira.dividendos('CIEL3', 1, '2013-08-13', '2013-08-13');

				expect(ciel3.resultado).to.be.equal(100);
				expect(cielo.resultado).to.be.equal(100);
				expect(carteira.resultado).to.be.equal(100);
			})
		})
	})
})