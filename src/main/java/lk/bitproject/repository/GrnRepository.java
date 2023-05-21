package lk.bitproject.repository;

import lk.bitproject.model.Grn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrnRepository extends JpaRepository<Grn,Integer> {
    //query for get next number
    @Query(value = "SELECT concat('GRN',lpad(substring(max(gr.grnno),4)+1,5,'0')) FROM kaushalyadistributors.grn as gr;", nativeQuery = true)
    String getNextNumber();

    //get grn by given grnno number
    @Query(value = "select gr from Grn gr where gr.grnno=:grnno")
    Grn findByGrnno(@Param("grnno") String grnno);



    //Query for get all grn with given search value
    @Query(value = "select gr from Grn gr where gr.grnno like concat('%' ,:searchtext, '%') or " +
            "gr.supinvoiceno like concat('%',:searchtext, '%') or " +
            "gr.porderId.supplierId.sname like concat('%',:searchtext, '%') or " +
//            "gr.categoryId.name like concat('%',:searchtext, '%') or " +
            "gr.porderId.pono like concat('%',:searchtext, '%') or " +
            "gr.grandtotal like concat('%',:searchtext, '%') or " +
            "gr.discountedratio like concat('%',:searchtext, '%') or " +
            "gr.nettotal like concat('%',:searchtext, '%') or " +
            "gr.receiveddate like concat('%',:searchtext, '%') or " +
            "gr.addeddate like concat('%',:searchtext, '%') or " +
            "gr.grnstatusId.name like concat('%',:searchtext, '%') or " +
            "gr.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<Grn> findAll(@Param("searchtext") String searchtext, Pageable of);
}
