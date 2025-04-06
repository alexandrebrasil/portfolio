package alexandre.brasil.portfolio.backend.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "instituicao_financeira")
@AllArgsConstructor @NoArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class InstituicaoFinanceira {
    @Id
    @Column
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private long id;

    @Column
    private String nome;

    @ManyToOne
    @JoinColumn(name = "moeda")
    private Moeda moeda;
}
