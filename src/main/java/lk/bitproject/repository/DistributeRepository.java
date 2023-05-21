package lk.bitproject.repository;


import lk.bitproject.model.Distribute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DistributeRepository extends JpaRepository<Distribute,Integer> {
    //Query for get request list
    @Query(value = "SELECT new Distribute(d.id, d.distributionno, d.distributionrouteId, d.totalinvoice) from Distribute d where d.distributionrouteId.id=1")
    List<Distribute> activeList();

    //query for get next number
    @Query(value = "SELECT concat('DLV',lpad(substring(max(d.distributionno),4)+1,5,'0')) FROM kaushalyadistributors.distribute as d;", nativeQuery = true)
    String getNextNumber();

    //get Distribute by given Distribution no
    @Query(value = "select d from Distribute d where d.distributionno=:distributionno")
    Distribute findByDistributionno(@Param("distributionno") String distributionno);

    //Query for get all Distribute with given search value
    @Query(value = "select d from Distribute d where d.distributionno like concat('%' ,:searchtext, '%') or " +
            "d.distributionrouteId.routename like concat('%',:searchtext, '%') or "+
            "trim(d.totalinvoice) like concat('%',:searchtext, '%') or " +
            "d.deliveryagentId.callingname like concat('%',:searchtext, '%') or " +
            "d.vehicleId.vehicleno like concat('%',:searchtext, '%') or " +
            "d.driverId.callingname like concat('%',:searchtext, '%') or " +
            "trim(d.distributiondate) like concat('%',:searchtext, '%') or " +
            "d.distributionstatusId.name like concat('%',:searchtext, '%') or " +
            "trim(d.addeddate) like concat('%',:searchtext, '%') or " +
            "d.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<Distribute> findAll(@Param("searchtext") String searchtext, Pageable of);

    @Query(value = "select d from Distribute d where d in (select div.distributeId from DistributeInvoice div where div.invoiceId.id=:invoiceid)")
    Distribute byInvoice(@Param("invoiceid") Integer invoiceid);
}
