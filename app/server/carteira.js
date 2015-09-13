var exports;

function Carteira() {
	var empresas = [],
		corretagem = 0,
		liquidacao = 0,
		emolumentos = 0;


	this.empresas = function() {
		return empresas;
	}

	this.corretagem = function(valor) {
		if(valor !== undefined) {
			corretagem = valor;
		}

		return corretagem;
	}

	this.emolumentos = function(taxa) {
		if(taxa !== undefined) emolumentos = taxa;

		return emolumentos;
	}

	this.liquidacao = function(taxa) {
		if(taxa !== undefined) liquidacao = taxa;
		return liquidacao;
	}

	this.adicionarEmpresa = function(nome, codigoBovespa) {
		var empresa = new Empresa(nome, codigoBovespa);
		empresas.push(empresa);
		empresas.sort(function(empresa1, empresa2) {
			return empresa1.nome.localeCompare(empresa2.nome);
		})

		return empresa;
	}

	this.comprar = function(codigoAcao, quantidade, valor, data) {
		adicionarEvento(codigoAcao, new Compra(quantidade, valor, data, corretagem, emolumentos, liquidacao))
	}

	this.bonificar = function(codigoAcao, quantidade, custoContabilAcaoBonificada, dataBonificacao) {
		adicionarEvento(codigoAcao, new Bonificacao(quantidade, custoContabilAcaoBonificada, dataBonificacao));
	}

	function adicionarEvento(codigoAcao, evento) {
		var acao = empresas.map(function(empresa) {
								return empresa.acoes;
							})
							.reduce(function(arr, acoes) { return arr.concat(acoes)}, [])
							.filter(function(a) {
								return a.codigo === codigoAcao;
							})[0];

		if(!acao) throw 'Ação não encontrada';

		acao.novoEvento(evento)
	}
}

function Empresa(nome, codigoBovespa) {
	var self = this;

	self.nome = nome;
	self.codigoBovespa = codigoBovespa;
	self.acoes = [];

	this.adicionarAcao = function(codigo) {
		var acao = new Acao(codigo);
		self.acoes.push(acao);
		return acao;
	}
}

function Acao(codigo) {
	this.codigo = codigo;
	var eventos = [],
		_quantidade = 0,
		_custoFinanceiro = 0,
		_custoContabil = 0;

	this.__defineGetter__("quantidade", function() { return _quantidade })
	this.__defineGetter__('custoFinanceiro', function() { return _custoFinanceiro })
	this.__defineGetter__('custoContabil', function() { return _custoContabil })
	this.__defineGetter__('custoUnitario', function() { return Math.round(_custoFinanceiro / _quantidade * 100) / 100 })
	this.__defineGetter__('custoUnitarioContabil', function() { return Math.round(_custoContabil / _quantidade * 100) / 100 })

	this.novoEvento = function(evento) {
		eventos.push(evento);
		eventos.sort(function(e1, e2) { return e1.data.localeCompare(e2.data) })
		recalculaPosicao();
	}

	function recalculaPosicao() {
		_quantidade = 0, _custoFinanceiro = 0, _custoContabil = 0;

		eventos.forEach(function(evento) {
			_quantidade += evento.quantidade(_quantidade);
			_custoFinanceiro += evento.custoFinanceiro;
			_custoContabil += evento.custoContabil;
		})
	}
}

function Compra(quantidade, valorUnitario, dataCompra, corretagem, emolumentos, liquidacao) {
	var _quantidade = quantidade,
		_valorUnitario = valorUnitario,
		_dataCompra = dataCompra,
		_corretagem = corretagem,
		_liquidacao = Math.round(quantidade * valorUnitario * liquidacao * 100) / 100,
		_emolumentos = Math.round(quantidade * valorUnitario * emolumentos * 100) / 100,
		_custo = _quantidade * _valorUnitario + _corretagem + _emolumentos + _liquidacao;

	this.quantidade = function() { return _quantidade }

//	this.__defineGetter__('custoUnitario', function() { return Math.round(_custo / quantidade * 100) / 100 })
	this.__defineGetter__('data', function() { return _dataCompra })
	this.__defineGetter__('custoFinanceiro', function() { return _custo })
	this.__defineGetter__('custoContabil', function() { return _custo })
}

function Bonificacao(percentual, custoContabilAcaoBonificada, dataBonificacao) {
	var _percentual = percentual,
		_custoContabilAcaoBonificada = custoContabilAcaoBonificada,
		_dataBonificacao = dataBonificacao,
		_acoesBonificadas = 0;

	this.__defineGetter__('data', function() { return _dataBonificacao })
	this.__defineGetter__('custoFinanceiro', function() { return 0 })
	this.__defineGetter__('custoContabil', function() { return _acoesBonificadas * _custoContabilAcaoBonificada })


	this.quantidade = function(quantidadeAtual) {
		_acoesBonificadas = Math.floor(quantidadeAtual * percentual / 100);
		return _acoesBonificadas;
	}
}

exports.Carteira = Carteira;