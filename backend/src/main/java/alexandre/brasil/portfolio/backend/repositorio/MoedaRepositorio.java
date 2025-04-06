package alexandre.brasil.portfolio.backend.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import alexandre.brasil.portfolio.backend.dominio.Moeda;

public interface MoedaRepositorio extends JpaRepository<Moeda, String>{
    
}