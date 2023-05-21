package lk.bitproject.repository;

import lk.bitproject.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {


  @Query(value="SELECT new Employee(e.id,e.number, e.callingname) FROM Employee e")
    List<Employee> list();

    //Hello
    @Query(value = "select e from  Employee e where e.genderId.id=:genderid")
    List<Employee> findAllByGender(@Param("genderid") Integer genderid);

    //query for get next number
    @Query(value = "SELECT concat('KDE',lpad(substring(max(e.number),4)+1,5,'0')) FROM kaushalyadistributors.employee as e;", nativeQuery = true)
    String getNextNumber();

    //Query for get employee list with id,number and callingname
    @Query(value = "SELECT new Employee (e.id,e.number, e.callingname) from Employee e")
    List<Employee> employeeList();

    //Query for get employee list with id,number and callingname //Request confirmlist
    @Query(value = "SELECT new Employee (e.id,e.number, e.callingname) from Employee e where e.designationId.id=1 or e.designationId.id=3")
    List<Employee> confirmList();

    //Query for get employee list with id,number and callingname //Distribute deliveryAgentlist
    @Query(value = "SELECT new Employee (e.id,e.number, e.callingname) from Employee e where e.designationId.id=5")
    List<Employee> listByDeliveryAgent();

    //Query for get employee list with id,number and callingname //Distribute driverlist
    @Query(value = "SELECT new Employee (e.id,e.number, e.callingname) from Employee e where e.designationId.id=7")
    List<Employee> listByDriver();

    //Query for get employee list with id,number and callingname //Distribute supportivelist
    @Query(value = "SELECT new Employee (e.id,e.number, e.callingname) from Employee e where e.designationId.id=8")
    List<Employee> listBySupportiveCrew();

    // get available supportive members for distributiondate //Distribute supportivemembers with date
    @Query("SELECT new Employee (e.id,e.number, e.callingname) FROM Employee e where e.designationId.id = 8 and e not in" +
            "(select sc.employeeId from SupportiveCrew sc where sc.distributeId in(select d from Distribute d where  d.distributiondate=:ddate))")
    List<Employee> listbyavilablesuportivecrow(@Param("ddate") LocalDate ddate);

    // get available driver for distributiondate //Distribute delivery agent with date
    @Query("SELECT new Employee (e.id,e.number, e.callingname) FROM Employee e where e.designationId.id = 5 and e not in" +
            "(select d.deliveryagentId from Distribute d where d.distributiondate=:ddate) ")
    List<Employee> listbyavilabledeliveryagent(@Param("ddate") LocalDate ddate);

    // get available driver for distributiondate //Distribute driverlist with date
    @Query("SELECT new Employee (e.id,e.number, e.callingname) FROM Employee e where e.designationId.id = 7 and e not in" +
            "(select d.driverId from Distribute d where d.distributiondate=:ddate) ")
    List<Employee> listbyavilabledriver(@Param("ddate") LocalDate ddate);


    @Query(value="SELECT new Employee(e.id,e.number, e.callingname) FROM Employee e WHERE e not in (Select u.employeeId from User u)")
    List<Employee> listWithoutUsers();

    @Query(value="SELECT new Employee(e.id,e.number, e.callingname) FROM Employee e WHERE e in (Select u.employeeId from User u)")
    List<Employee> listWithUseraccount();

    @Query("SELECT e FROM Employee e where e.callingname <> 'Admin' ORDER BY e.id DESC")
    Page<Employee> findAll(Pageable of);

//    @Query("SELECT e FROM Employee e where (e.callingname like concat('%',:searchtext,'%')) and e.callingname<>'Admin' ORDER BY e.id DESC")
//    Page<Employee> findAll(@Param("searchtext")String searchtext ,Pageable of);

   @Query("SELECT e FROM Employee e WHERE e.nic= :nic")
    Employee findByNIC(@Param("nic")String nic);

    @Query("SELECT e FROM Employee e WHERE e.number= :number")
    Employee findByNumber(@Param("number")String number);

    @Query("SELECT e FROM Employee e WHERE e.mobile= :mobile")
    Employee findByMobile(@Param("mobile")String mobile);

        //Query for get all employee with given search value
    @Query(value = "select e from Employee e where e.number like concat('%' ,:searchtext, '%') or " +
            "e.fullname like concat('%',:searchtext, '%') or" +
            " e.callingname like concat('%',:searchtext, '%') or " +
            "e.nic like concat('%',:searchtext, '%') or" +
            " e.genderId.name like concat('%',:searchtext, '%') or " +
            "e.dobirth like concat('%',:searchtext, '%') or" +
            " e.address like concat('%',:searchtext, '%') or " +
            "e.mobile like concat('%',:searchtext, '%') or" +
            " e.land like concat('%',:searchtext, '%') or " +
            "e.civilstatusId.name like concat('%',:searchtext, '%') or" +
            " e.designationId.name like concat('%',:searchtext, '%') or " +
            "e.doassignment like concat('%',:searchtext, '%') or" +
            " e.employeestatusId.name like concat('%',:searchtext, '%')")
    Page<Employee> findAll(@Param("searchtext") String searchtext, Pageable of);


}
