package lk.bitproject.repository;

import lk.bitproject.model.Customer;
import lk.bitproject.model.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier,Integer> {
    //Query for get supplier list with id, name and tobepaid
    @Query(value = "SELECT new Supplier(s.id, s.sname,s.tobepaid) from Supplier s")
    List<Supplier> List();

    //Query for get supplier list with id, name and tobepaid (active)
    @Query(value = "SELECT new Supplier(s.id, s.sname,s.tobepaid) from Supplier s where s.sstatusId.id=1")
    List<Supplier> activeList();

    //Query for get supplier list with id, name, bankname, bankbranch, bankaccount, accountholder, tobepaid
    @Query(value = "SELECT new Supplier(s.id, s.sname, s.bankname, s.bankbranch, s.bankaccount, s.accountholder, s.tobepaid) from Supplier s")
    List<Supplier> PaymentList();

    //Query for get supplier list with id, name, bankname, bankbranch, bankaccount, accountholder, tobepaid (active)
    @Query(value = "SELECT new Supplier(s.id, s.sname, s.bankname, s.bankbranch, s.bankaccount, s.accountholder, s.tobepaid) from Supplier s where s.sstatusId.id=1")
    List<Supplier> activePaymentList();



    //query for get next number
    @Query(value = "SELECT concat('KDS',lpad(substring(max(s.regno),4)+1,5,'0')) FROM kaushalyadistributors.supplier as s;", nativeQuery = true)
    String getNextNumber();

    //get supplier by given reg number
    @Query(value = "select s from Supplier s where s.regno=:regno")
    Supplier findByRegno(@Param("regno") String regno);

    //get supplier by given nic
    @Query(value = "select s from Supplier s where s.cpnic=:cpnic")
    Supplier findByNic(@Param("cpnic") String nic);

    //Query for get all supplier with given search value
    @Query(value = "select s from Supplier s where s.regno like concat('%' ,:searchtext, '%') or " +
            "s.brnumber like concat('%',:searchtext, '%') or s.sname like concat('%',:searchtext, '%') or " +
            "s.sland like concat('%',:searchtext, '%') or s.semail like concat('%',:searchtext, '%') or " +
            "s.address like concat('%',:searchtext, '%') or s.cpname like concat('%',:searchtext, '%') or " +
            "s.cpmobile like concat('%',:searchtext, '%') or s.cpnic like concat('%',:searchtext, '%') or " +
            "s.cpemail like concat('%',:searchtext, '%') or s.bankname like concat('%',:searchtext, '%') or " +
            "s.bankbranch like concat('%',:searchtext, '%') or s.bankaccount like concat('%',:searchtext, '%') or " +
            "s.accountholder like concat('%',:searchtext, '%') or s.regdate like concat('%',:searchtext, '%') or " +
            "s.sstatusId.name like concat('%',:searchtext, '%') or s.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<Supplier> findAll(@Param("searchtext") String searchtext, Pageable of);
}
