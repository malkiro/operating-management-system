package lk.bitproject.repository;

import lk.bitproject.model.Customer;
import lk.bitproject.model.CustomerPoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerPointReposiory extends JpaRepository<CustomerPoint, Integer> {

    //get customerpoint by given name
    @Query(value = "select cp from CustomerPoint cp where cp.name=:name")
    CustomerPoint findByName(@Param("name") String name);


    //Query for get all customerpoint with given search value
    @Query(value = "select cp from CustomerPoint cp where cp.name like concat('%' ,:searchtext, '%') or " +
            "cp.startrate like concat('%',:searchtext, '%') or " +
            "cp.endrate like concat('%',:searchtext, '%') or " +
            "cp.discountratio like concat('%',:searchtext, '%') or " +
            "cp.pointperinvoice like concat('%',:searchtext, '%') or " +
            "cp.invoiceamount like concat('%',:searchtext, '%')")
    Page<CustomerPoint> findAll(@Param("searchtext") String searchtext, Pageable of);

}
