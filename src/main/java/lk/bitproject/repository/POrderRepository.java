package lk.bitproject.repository;


import lk.bitproject.model.POrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface POrderRepository extends JpaRepository<POrder,Integer> {
    //Query for get porder list with id and pono
    @Query(value = "SELECT new POrder (p.id, p.pono) from POrder p")
    List<POrder> List();

    //Query for get all by given supplier id  //GRN porderlist
    @Query(value = "select new POrder (p.id,p.pono, p.supplierId)from  POrder p where p.supplierId.id=:supplierid and p.porderstatusId.id=2")
    List<POrder> listBySupplier(@Param("supplierid") Integer supplierid);


    //query for get next number
    @Query(value = "SELECT concat('KDPO',lpad(substring(max(po.pono),5)+1,5,'0')) FROM kaushalyadistributors.porder as po;", nativeQuery = true)
    String getNextNumber();

    //get porder by given reg number
    @Query(value = "select po from POrder po where po.pono=:pono")
    POrder findByPOno(@Param("pono") String pono);

    //Query for get all customer with given search value
    @Query(value = "select po from POrder po where " +
            "po.pono like concat('%',:searchtext, '%') or " +
            "po.supplierId.sname like concat('%',:searchtext, '%') or " +
            "po.totalprice like concat('%',:searchtext, '%') or " +
            "po.porderstatusId.name like concat('%',:searchtext, '%') or " +
            "po.date like concat('%',:searchtext, '%') or " +
            "po.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<POrder> findAll(@Param("searchtext") String searchtext, Pageable of);
}
