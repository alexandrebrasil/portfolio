package alexandre.brasil.portfolio.backend.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "moeda")
@AllArgsConstructor @NoArgsConstructor
public class Moeda {
    @Id
    @Column(name = "codigo")
    private String codigo;

    @Column(name = "numero")
    private int numero;

    @Column(name = "nome")
    private String nome;
}
