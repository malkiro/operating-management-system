package lk.bitproject.repository;

import lk.bitproject.model.CPayment;
import lk.bitproject.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CPaymentRepository extends JpaRepository<CPayment, Integer> {
    //query for get next number
    @Query(value = "SELECT concat('CPR',lpad(substring(max(cp.cbillno),4)+1,5,'0')) FROM kaushalyadistributors.cpayment as cp;", nativeQuery = true)
    String getNextNumber();

    //get customer payment by given bill number
    @Query(value = "select cp from CPayment cp where cp.cbillno=:cbillno")
    CPayment findByBillno(@Param("cbillno") String cbillno);


    //Query for get all customer payement with given search value
    @Query(value = "select cp from CPayment cp where cp.cbillno like concat('%' ,:searchtext, '%') or " +
//            "cp.customerId.cname like concat('%',:searchtext, '%') or " +
            "cp.oldbalance like concat('%',:searchtext, '%') or " +
            "cp.totalamount like concat('%',:searchtext, '%') or " +
            "cp.newbalance like concat('%',:searchtext, '%') or " +
            "cp.recieveddate like concat('%',:searchtext, '%') or " +
            "cp.cpaymentstatusId.name like concat('%',:searchtext, '%') or " +
            "cp.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<CPayment> findAll(@Param("searchtext") String searchtext, Pageable of);
}
