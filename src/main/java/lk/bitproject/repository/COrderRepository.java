package lk.bitproject.repository;


import lk.bitproject.model.COrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface COrderRepository extends JpaRepository<COrder,Integer> {
    //Query for get corder list with id, cono, customerId and discountedratio
    @Query(value = "SELECT new COrder (co.id, co.cono, co.customerId, co.discountedratio, co.requiredate) from COrder co")
    List<COrder> List();

    //Query for get corder list with id, cono, customerId and discountedratio (active)
    @Query(value = "SELECT new COrder(co.id, co.cono, co.customerId, co.discountedratio, co.requiredate ) from COrder co where co.corderstatusId.id=1")
    List<COrder> activeList();



    //query for get next number
    @Query(value = "SELECT concat('KDCO',lpad(substring(max(co.cono),5)+1,5,'0')) FROM kaushalyadistributors.corder as co;", nativeQuery = true)
    String getNextNumber();

    //get corder by given reg number
    @Query(value = "select co from COrder co where co.cono=:cono")
    COrder findByCOno(@Param("cono") String cono);



    //Query for get all corder with given search value
    @Query(value = "select co from COrder co where co.cono like concat('%' ,:searchtext, '%') or " +
            "co.customerId.cname like concat('%',:searchtext, '%') or " +
            "co.grandtotal like concat('%',:searchtext, '%') or " +
            "co.discountedratio like concat('%',:searchtext, '%') or " +
            "co.nettotal like concat('%',:searchtext, '%') or " +
            "co.requiredate like concat('%',:searchtext, '%') or " +
            "co.date like concat('%',:searchtext, '%') or " +
            "co.corderstatusId.name like concat('%',:searchtext, '%') or " +
            "co.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<COrder> findAll(@Param("searchtext") String searchtext, Pageable of);
}
