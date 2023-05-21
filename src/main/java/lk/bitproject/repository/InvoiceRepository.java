package lk.bitproject.repository;

import lk.bitproject.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice,Integer> {
    //Query for get Invoice list with id ,customerId and invoiceno
     @Query(value = "SELECT new Invoice(i.id,i.customerId, i.invoiceno) from Invoice i where i.invoicestatusId.id=1")
     List<Invoice> List();

    //Query for get Invoice list with id  invoiceno, payableamount, paidamount, date
    @Query(value = "SELECT new Invoice(i.id, i.invoiceno, i.payableamount,i.paidamount,i.date) from Invoice i where i.invoicestatusId.id=2")
    List<Invoice> cpaymentList();

    //Query for get all by given customer id  //Cpayment invoicelist
    @Query(value = "select new Invoice (i.id,i.invoiceno,i.payableamount,i.paidamount,i.date)from Invoice i where i.customerId.id=:customerid and i.invoicestatusId.id=1 or i.customerId.id=:customerid and i.invoicestatusId.id=2 or i.customerId.id=:customerid and i.invoicestatusId.id=3")
    List<Invoice> listByCustomer(@Param("customerid") Integer customerid);

    //Query for get all by given route id  //Distribute invoicelist
    @Query(value = "select new Invoice (i.id,i.customerId, i.invoiceno) from Invoice i where i.corderId.customerId.distributionrouteId.id=:routeid and i.invoicestatusId.id=1 and i.status = true")
    List<Invoice> listByRoute(@Param("routeid") Integer routeid);



    //query for get's next number
    @Query(value = "SELECT concat('INV',lpad(substring(max(i.invoiceno),4)+1,5,'0')) FROM kaushalyadistributors.invoice as i;", nativeQuery = true)
    String getNextNumber();

    //get invoice by given invoiceno
    @Query(value = "select inv from Invoice inv where inv.invoiceno=:invoiceno")
    Invoice findByInvno(@Param("invoiceno") String invoiceno);

    //Query for get all invoice with given search value
    @Query(value = "select inv from Invoice inv where inv.invoiceno like concat('%' ,:searchtext, '%') or " +
            "inv.customerId.cname like concat('%',:searchtext, '%') or " +
            "inv.grandtotal like concat('%',:searchtext, '%') or " +
            "inv.discountedratio like concat('%',:searchtext, '%') or " +
            "inv.nettotal like concat('%',:searchtext, '%') or " +
            "inv.status like concat('%',:searchtext, '%') or " +
            "inv.invoicestatusId.name like concat('%',:searchtext, '%') or " +
            "inv.date like concat('%',:searchtext, '%') or " +
            "inv.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<Invoice> findAll(@Param("searchtext") String searchtext, Pageable of);
}
