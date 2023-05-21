package lk.bitproject.repository;



import lk.bitproject.model.Civilstatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface CivilstatusRepository extends JpaRepository<Civilstatus, Integer> {

    @Query(value="SELECT new Civilstatus(c.id,c.name) FROM Civilstatus c")
    List<Civilstatus> list();


}