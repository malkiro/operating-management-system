package lk.bitproject.repository;

import lk.bitproject.model.DistributionRoute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DistributionRouteRepository extends JpaRepository<DistributionRoute, Integer> {
    //Query for get route list with id and routename
    @Query(value = "SELECT new DistributionRoute(dr.id,dr.routename) from DistributionRoute dr")
    List<DistributionRoute> List();

    //Query for get route list with id and routename (active)
    @Query(value = "SELECT new DistributionRoute(dr.id, dr.routename) from DistributionRoute dr where dr.distributionroutestatusId.id=1")
    List<DistributionRoute> activeList();



    //query for get next number
    @Query(value = "SELECT concat('RT',lpad(substring(max(dr.routeno),3)+1,4,'0')) FROM kaushalyadistributors.distributionroute as dr;", nativeQuery = true)
    String getNextNumber();

    //get Distributeroute by given Route no
    @Query(value = "select dr from DistributionRoute dr where dr.routeno=:routeno and dr.distributionroutestatusId.id=1")
    DistributionRoute findByRouteno(@Param("routeno") String routeno);

    //get Distributeroute by given route name
    @Query(value = "select dr from DistributionRoute dr where dr.routename=:routename and dr.distributionroutestatusId.id=1")
    DistributionRoute findByRoutename(@Param("routename") String routename);

    //Query for get all route with given search value
    @Query(value = "select dr from DistributionRoute dr where dr.routeno like concat('%' ,:searchtext, '%') or " +
            "dr.routename like concat('%',:searchtext, '%') or "+
            "dr.distributionroutestatusId.name like concat('%',:searchtext, '%') or " +
            "dr.date like concat('%',:searchtext, '%') or " +
            "dr.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<DistributionRoute> findAll(@Param("searchtext") String searchtext, Pageable of);
}
