package lk.bitproject.repository;

import lk.bitproject.model.Employee;
import lk.bitproject.model.Module;
import lk.bitproject.model.Privilage;
import lk.bitproject.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.ResultSet;

public interface PrivilageRepository extends JpaRepository<Privilage, Integer> {

    @Query("SELECT p FROM Privilage p WHERE p.roleId= :role AND p.moduleId= :module")
    Privilage findByRoleModule(@Param("role") Role role, @Param("module") Module module);

//    @Query("SELECT p FROM Privilage p ORDER BY p.id DESC")
//    Page<Privilage> findAll(@Param("searchtext")String searchtext , Pageable of);

    //Query for get all employee with given search value
    @Query(value = "select p from Privilage p where p.roleId.role like concat('%' ,:searchtext, '%') or " +
            "p.moduleId.name like concat('%',:searchtext, '%') or " +
            "p.sel like concat('%',:searchtext, '%') or " +
            "p.ins like concat('%',:searchtext, '%') or " +
            "p.upd like concat('%',:searchtext, '%') or " +
            " p.del like concat('%',:searchtext, '%')")
    Page<Privilage> findAll(@Param("searchtext") String searchtext, Pageable of);


}
