package lk.bitproject.repository;

import lk.bitproject.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerReposiory extends JpaRepository<Customer , Integer> {
    //Query for get customer list with id, regno, cname, point)
    @Query(value= "select new Customer(c.id,c.regno,c.cname,c.point) from Customer c ORDER BY c.id DESC")
    List<Customer> List();

    //Query for get customer list with id, regno, cname, point) (active)
    @Query(value= "select new Customer(c.id,c.regno,c.cname,c.point) from Customer c where c.cstatusId.id=1 ORDER BY c.id DESC")
    List<Customer> activeList();

//    //Query for get all by given customer id  //Corder cutomerlist
//    @Query(value = "select new Customer(c.id,c.regno,c.cname,c.point,c.distributionrouteId)from  Customer c where c.distributionrouteId.id=:distributionrouteid and c.cstatusId.id=1 ORDER BY c.id DESC")
//    List<Customer> listByRoute(@Param("distributionrouteid") Integer distributionrouteid);

    //Query for get customer list with id, regno, cname, cmobile, address, cemail, maxcreditlimt, point, tobepaid, distributionrouteId
    @Query(value= "select new Customer(c.id,c.regno,c.cname,c.cmobile,c.address,c.cemail,c.maxcreditlimt, c.point,c.tobepaid,c.distributionrouteId) from Customer c ORDER BY c.id DESC")
    List<Customer> invoiceList();

    //Query for get customer list with id, regno, cname, cmobile, address, cemail, maxcreditlimt, point, tobepaid, distributionrouteId (active)
    @Query(value= "select new Customer(c.id,c.regno,c.cname,c.cmobile,c.address,c.cemail,c.maxcreditlimt, c.point,c.tobepaid,c.distributionrouteId) from Customer c where c.cstatusId.id=1 ORDER BY c.id DESC")
    List<Customer> activeinvoiceList();



    //query for get next number
    @Query(value = "SELECT concat('KDC',lpad(substring(max(c.regno),4)+1,5,'0')) FROM kaushalyadistributors.customer as c;", nativeQuery = true)
    String getNextNumber();

    //get customer by given reg number
    @Query(value = "select c from Customer c where c.regno=:regno and c.cstatusId=1")
    Customer findByRegno(@Param("regno") String regno);

    //get customer by given mobile
    @Query(value = "select c from Customer c where c.cmobile=:cmobile")
    Customer findByMobile(@Param("cmobile") String cmobile);

    //get customer by given nic
    @Query(value = "select c from Customer c where c.cnic=:cnic")
    Customer findByNIC(@Param("cnic") String cnic);

    //Query for get all customer with given search value
    @Query(value = "select c from Customer c where c.regno like concat('%' ,:searchtext, '%') or " +
            "c.ctypeId.name like concat('%',:searchtext, '%') or " +
            "c.cname like concat('%',:searchtext, '%') or " +
            "c.cmobile like concat('%',:searchtext, '%') or " +
            "c.cland like concat('%',:searchtext, '%') or " +
            "c.cemail like concat('%',:searchtext, '%') or " +
            "c.cpname like concat('%',:searchtext, '%') or " +
            "c.cpmobile like concat('%',:searchtext, '%') or " +
            "c.cpnic like concat('%',:searchtext, '%') or " +
            "c.cpemail like concat('%',:searchtext, '%') or " +
            "c.cstatusId.name like concat('%',:searchtext, '%') or " +
            "c.regdate like concat('%',:searchtext, '%')or " +
            "c.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<Customer> findAll(@Param("searchtext") String searchtext, Pageable of);

}
