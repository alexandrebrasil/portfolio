package alexandre.brasil.portfolio.backend.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import alexandre.brasil.portfolio.backend.dominio.InstituicaoFinanceira;

@Repository
public interface InstituicaoFinanceiraRepositorio extends JpaRepository<InstituicaoFinanceira, Long>{
}
