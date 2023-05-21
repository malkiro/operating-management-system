package lk.bitproject.controller;


import lk.bitproject.model.Employee;
import lk.bitproject.model.Gender;
import lk.bitproject.model.User;
import lk.bitproject.repository.DesignationRepository;
import lk.bitproject.repository.EmployeeRepository;
import lk.bitproject.repository.EmployeestatusRepository;
import lk.bitproject.repository.UserRepository;
import lk.bitproject.service.EmailService;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RequestMapping(value = "/employee")
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository daouser;

    @Autowired
    private EmailService emailService;

    @Autowired
    private DesignationRepository daoDesignation;

    @Autowired
    private EmployeestatusRepository daoEmployeestatus;


    @GetMapping(value = "/list", produces = "application/json")
    public List<Employee> employeeList() {
            return dao.employeeList();
    }

    @GetMapping(value = "/confirmlist", produces = "application/json")
    public List<Employee> confirmList() {
        return dao.confirmList();
    }

//    Hello
    // get list by category [employee/listbygender?genderid=]
    @GetMapping(value = "/listbygender",params = {"genderid"},produces = "application/json")
    public List<Employee> brandListbygender(@RequestParam("genderid")int genderid){
        return dao.findAllByGender(genderid);
    }

    // get list by employee deliveryagent  //Distribute deliveryagentlist
    @GetMapping(value = "/deliveryagentlist", produces = "application/json")
    public List<Employee> employeeDeliveryAgentList() {
        return dao.listByDeliveryAgent();
    }

    // get list by employee driver  //Distribute driverlist
    @GetMapping(value = "/driverlist", produces = "application/json")
    public List<Employee> employeeDriverList() {
        return dao.listByDriver();
    }

    // get list by employee driver  //Distribute driverlist
    @GetMapping(value = "/supportivecrewlist", produces = "application/json")
    public List<Employee> employeeSupportiveCrewList() {
        return dao.listBySupportiveCrew();
    }

    // get available supportive members for distributiondate //Distribute supportivemembers with date
    @GetMapping(value ="/listbyavilablesuportivecrow", params = {"distributiondate"}, produces = "application/json")
    public List<Employee> listbyavilablesuportivecrow(@RequestParam("distributiondate") String distributiondate){
        return dao.listbyavilablesuportivecrow(LocalDate.parse(distributiondate));
    }

    // get available delivery agent for distributiondate //Distribute deliveryagents with date
    @GetMapping(value ="/listbyavilabledeliveryagent", params = {"distributiondate"}, produces = "application/json")
    public List<Employee> listbyavilabledeliveryagent(@RequestParam("distributiondate") String distributiondate){
        return dao.listbyavilabledeliveryagent(LocalDate.parse(distributiondate));
    }

    // get available driver for distributiondate //Distribute driverlist with date
    @GetMapping(value ="/listbyavilabledriver", params = {"distributiondate"}, produces = "application/json")
    public List<Employee> listbyavilabledriver(@RequestParam("distributiondate") String distributiondate){
        return dao.listbyavilabledriver(LocalDate.parse(distributiondate));
    }



    //get service for get employee with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public Employee getNextNumber() {
        String nextnumber = dao.getNextNumber();
        Employee emp = new Employee(nextnumber);
        return emp;
    }

    @GetMapping(value = "/list/withoutusers", produces = "application/json")
    public List<Employee> listwithoutusers() {
         return dao.listWithoutUsers();
    }

    @GetMapping(value = "/list/withuseraccount", produces = "application/json")
    public List<Employee> listwithuseraccount() {
        return dao.listWithUseraccount();

    }




    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Employee> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"EMPLOYEE");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }


    @GetMapping(value = "/findAll",params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<Employee> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"EMPLOYEE");
        if(user!= null && priv.get("select")){
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        }
        return null;
    }


    @PostMapping()
    public String add(@Validated @RequestBody Employee employee) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"EMPLOYEE");
        if(user!= null && priv.get("add")){
            Employee empnic = dao.findByNIC(employee.getNic());
            Employee empnumber = dao.findByNumber(employee.getNumber());
            Employee empmobile = dao.findByMobile(employee.getMobile());
            if (empnic != null)
                return "Error Validation : NIC Exists";
            else if (empnumber != null)
                return "Error Validation : Number Exists";
            else if (empmobile != null)
                return "Error Validation : Mobile Exists";
            else
                try {
                    dao.save(employee);
                  //  emailService.sendMail("rukshannuwanbit@gmail.com","Registor Employee","Employee Registration Success Fully...!\n\n Thank You to join with us.. \n\n from : Sudu buthaya");
                    return "0";
                } catch (Exception e) {
                    return "Error Saving : " + e.getMessage();
                }
       }
        return "Error Saving : You have no Permission";

    }



    @PutMapping()
    public String update(@Validated @RequestBody Employee employee) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"EMPLOYEE");
        if(user!= null && priv.get("update")){
            Employee emp = dao.findByNIC(employee.getNic());
        if(emp==null || emp.getId()==employee.getId()) {
            try {
                User empuser = daouser.getByEmployee(employee.getId());
                if (empuser != null) {
                    if (employee.getEmployeestatusId().getName().equals("Deleted")|| employee.getEmployeestatusId().getName().equals("Resigned")) {
                        empuser.setActive(false);
                    } else if (employee.getEmployeestatusId().getName().equals("Working")) {
                        empuser.setActive(true);
                    }
                    daouser.save(empuser);
                }

                dao.save(employee);
                //  emailService.sendMail("rukshannuwanbit@gmail.com","Registor Employee","Employee Registration Success Fully...!\n\n Thank You to join with us.. \n\n from : Sudu buthaya");
                return "0";
            }
            catch(Exception e) {
                return "Error Updating : "+e.getMessage();
            }
        }
        else {  return "Error Updating : NIC Exists"; }
        }
        return "Error Updating : You have no Permission";
    }


    @DeleteMapping()
    public String delete(@RequestBody Employee employee ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"EMPLOYEE");
        if(user!= null && priv.get("delete")){
            try {

           // dao.delete(dao.getOne(employee.getId()));
                employee.setEmployeestatusId(daoEmployeestatus.getOne(3));

                User empuser = daouser.getByEmployee(employee.getId());
                if (empuser != null) {
                    empuser.setActive(false);
                    daouser.save(empuser);
                }

                dao.save(employee);
            return "0";
        }
        catch(Exception e) {
            return "Error Deleting : "+e.getMessage();
        }
    }
        return "Error Deleting : You have no Permission";

    }



}
