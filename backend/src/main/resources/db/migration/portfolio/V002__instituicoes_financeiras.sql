CREATE TABLE instituicao_financeira (
    id      serial,
    nome    varchar(120) NOT NULL UNIQUE,
    moeda   char(3) NOT NULL REFERENCES moeda(codigo),

    PRIMARY KEY (id)
);