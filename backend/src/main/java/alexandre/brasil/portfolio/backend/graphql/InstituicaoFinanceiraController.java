package alexandre.brasil.portfolio.backend.graphql;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import alexandre.brasil.portfolio.backend.dominio.InstituicaoFinanceira;
import alexandre.brasil.portfolio.backend.repositorio.InstituicaoFinanceiraRepositorio;
import alexandre.brasil.portfolio.backend.repositorio.MoedaRepositorio;
import jakarta.validation.constraints.Pattern;
import lombok.Setter;

@Controller
public class InstituicaoFinanceiraController {
    @Setter(onMethod_ = {@Autowired})
    private InstituicaoFinanceiraRepositorio instituicoesFinanceiras;

    @Setter(onMethod_ = {@Autowired})
    private MoedaRepositorio moedas;

    @QueryMapping(name = "instituicoesFinanceiras")
    public List<InstituicaoFinanceira> instituicoesFinanceiras(@Argument Optional<Long> id) {
        if(id.isPresent()) {
            var instituicao = this.instituicoesFinanceiras.findById(id.get());
            return instituicao.isPresent() ? Arrays.asList(instituicao.get()) : Collections.emptyList();
        }
        
        return this.instituicoesFinanceiras.findAll();
    }

    @MutationMapping(name = "instituicaoFinanceira")
    public long instituicaoFinanceira(@Argument Long id, @Argument String nome, @Argument(name = "moeda") @Pattern(regexp = "[A-Z]{3}") String codigoMoeda) {
        InstituicaoFinanceira instituicaoFinanceira;

        if(id != null) {
            instituicaoFinanceira = instituicoesFinanceiras.findById(id).get();
        } else {
            instituicaoFinanceira = new InstituicaoFinanceira();
        }

        instituicaoFinanceira.setNome(nome);
        instituicaoFinanceira.setMoeda(moedas.findById(codigoMoeda).get());
        instituicaoFinanceira = instituicoesFinanceiras.save(instituicaoFinanceira);

        return instituicaoFinanceira.getId();
    }
}
