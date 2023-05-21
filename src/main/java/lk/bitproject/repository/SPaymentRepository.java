package lk.bitproject.repository;

import lk.bitproject.model.SPayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SPaymentRepository extends JpaRepository<SPayment, Integer> {
    //query for get next number
    @Query(value = "SELECT concat('SPV',lpad(substring(max(sp.sbillno),4)+1,5,'0')) FROM kaushalyadistributors.spayment as sp;", nativeQuery = true)
    String getNextNumber();

    //get Supplier Payment by given bill number
    @Query(value = "select sp from SPayment sp where sp.sbillno=:sbillno")
    SPayment findByBillno(@Param("sbillno") String sbillno);

    //Query for get all supplirt payement with given search value
    @Query(value = "select sp from SPayment sp where sp.sbillno like concat('%' ,:searchtext, '%') or " +
            "sp.spaymentmethodId.name like concat('%',:searchtext, '%') or sp.supplierId.sname like concat('%',:searchtext, '%') or " +
            "sp.tobepaidamount like concat('%',:searchtext, '%') or sp.date like concat('%',:searchtext, '%') or " +
            "sp.paidamount like concat('%',:searchtext, '%') or sp.balance like concat('%',:searchtext, '%') or " +
            "sp.chequeno like concat('%',:searchtext, '%') or sp.chequedate like concat('%',:searchtext, '%') or " +
            "sp.bankname like concat('%',:searchtext, '%') or sp.bankbranch like concat('%',:searchtext, '%') or " +
            "sp.bankaccount like concat('%',:searchtext, '%') or sp.accountholder like concat('%',:searchtext, '%') or " +
            "sp.spaymentstatusId.name like concat('%',:searchtext, '%') or sp.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<SPayment> findAll(@Param("searchtext") String searchtext, Pageable of);
}
