package lk.bitproject.repository;

import lk.bitproject.model.Employee;
import lk.bitproject.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    // get available vehicle for distributiondate //Distribute vehicle with date
    @Query("SELECT new Vehicle (v.id,v.vehiclename,v.vehicletypeId) FROM Vehicle v where v.vehiclestatusId.id = 1 and v not in" +
            "(select d.vehicleId from Distribute d where d.distributiondate=:ddate) ")
    List<Vehicle> listbyavilablevehicle(@Param("ddate") LocalDate ddate);

    //get Supplier Payment by given bill number
    @Query(value = "select v from Vehicle v where v.vehicleno=:vehicleno and v.vehiclestatusId.id=1")
    Vehicle findByVehicleno(@Param("vehicleno") String vehicleno);

    //get item by given itemname number
    @Query(value = "select v from Vehicle v where v.vehiclename=:vehiclename and v.vehiclestatusId.id=1")
    Vehicle findByVehiclename(@Param("vehiclename") String vehiclename);

    //Query for get all supplirt payement with given search value
    @Query(value = "select v from Vehicle v where v.brand like concat('%' ,:searchtext, '%') or " +
            "v.model like concat('%',:searchtext, '%') or "+
            "v.modelyear like concat('%',:searchtext, '%') or " +
            "v.vehiclename like concat('%',:searchtext, '%') or " +
            "v.vehicleno like concat('%',:searchtext, '%') or " +
            "v.photo like concat('%',:searchtext, '%') or " +
            "v.vehicletypeId.name like concat('%',:searchtext, '%') or " +
            "v.vehiclestatusId.name like concat('%',:searchtext, '%') or " +
            "v.date like concat('%',:searchtext, '%') or " +
            "v.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<Vehicle> findAll(@Param("searchtext") String searchtext, Pageable of);
}
