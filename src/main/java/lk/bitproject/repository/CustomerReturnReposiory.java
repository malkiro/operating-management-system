package lk.bitproject.repository;

import lk.bitproject.model.Customer;
import lk.bitproject.model.CustomerReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerReturnReposiory extends JpaRepository<CustomerReturn, Integer> {
    //Query for get customer list with id, name, returnno, totalamount
    @Query(value = "select new CustomerReturn (cr.id,cr.returnno,cr.totalamount)from  CustomerReturn cr")
    List<CustomerReturn> List();

    //Query for get all by given customer id  //Ivoice customer returnlist
    @Query(value = "select new CustomerReturn (cr.id,cr.returnno,cr.totalamount) from  CustomerReturn cr where cr.customerId.id=:customerid and cr.customerreturnstatusId.id=1")
    List<CustomerReturn> listByCustomer(@Param("customerid") Integer customerid);

    //query for get next number
    @Query(value = "SELECT concat('CR',lpad(substring(max(cr.returnno),3)+1,5,'0')) FROM kaushalyadistributors.customerreturn as cr;", nativeQuery = true)
    String getNextNumber();

    //get customer return by given reg number
    @Query(value = "select cr from CustomerReturn cr where cr.returnno=:returnno")
    CustomerReturn findByReturnno(@Param("returnno") String returnno);


    //Query for get all customer return with given search value
    @Query(value = "select cr from CustomerReturn cr where cr.returnno like concat('%' ,:searchtext, '%') or " +
    "cr.customerId.cname like concat('%',:searchtext, '%') or " +
            "cr.totalamount like concat('%',:searchtext, '%') or " +
            "cr.description like concat('%',:searchtext, '%') or " +
            "cr.date like concat('%',:searchtext, '%') or " +
            "cr.employeeId.callingname like concat('%',:searchtext, '%') or " +
            "cr.customerreturnstatusId.name like concat('%',:searchtext, '%')")
    Page<CustomerReturn> findAll(@Param("searchtext") String searchtext, Pageable of);

}
