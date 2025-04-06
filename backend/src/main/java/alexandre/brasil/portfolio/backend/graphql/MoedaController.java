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

import alexandre.brasil.portfolio.backend.dominio.Moeda;
import alexandre.brasil.portfolio.backend.repositorio.MoedaRepositorio;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Setter;

@Controller
public class MoedaController {
    @Setter(onMethod_ = {@Autowired})
    private MoedaRepositorio moedas;

    @QueryMapping(name = "moedas")
    public List<Moeda> moedas(@Argument Optional<String> codigo) {
        if(codigo.isPresent()) {
            var moeda = moedas.findById(codigo.get());
            return moeda.isPresent() ? Arrays.asList(moeda.get()) : Collections.emptyList();
        }
        
        return moedas.findAll();
    }

    @MutationMapping(name = "moeda")
    public String moeda(@Argument @NotNull @Pattern(regexp = "[A-Z]{3}") String codigo, @Argument @NotEmpty String nome, @Argument @Min(1) int numero) {
        var moeda = moedas.findById(codigo).orElse(new Moeda());
        moeda.setCodigo(codigo);
        moeda.setNome(nome);
        moeda.setNumero(numero);

        moedas.save(moeda);

        return moeda.getCodigo();
    }
}
