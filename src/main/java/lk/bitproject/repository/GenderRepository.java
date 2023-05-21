package lk.bitproject.repository;


import lk.bitproject.model.Brand;
import lk.bitproject.model.Gender;
import lk.bitproject.model.POrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface GenderRepository extends JpaRepository<Gender, Integer>
{
    @Query(value="SELECT new Gender(g.id,g.name) FROM Gender g")
    List<Gender> list();




}