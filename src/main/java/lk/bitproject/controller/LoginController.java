package lk.bitproject.controller;


import lk.bitproject.model.*;
import lk.bitproject.repository.*;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.validation.Valid;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;

@RestController
public class LoginController {

    @Autowired
    private UserService userService;
    @Autowired
    private EmployeeRepository employeedao;
    @Autowired
    private GenderRepository genderdao;
    @Autowired
    private CivilstatusRepository civilstatusdao;
    @Autowired
    private EmployeestatusRepository employeestatusdao;
    @Autowired
    private DesignationRepository designationdao;
    @Autowired
    private RoleRepository roledao;

    @RequestMapping(value = {"/", "/login"}, method = RequestMethod.GET)
    public ModelAndView login() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("login.html");
        return modelAndView;
    }




    @PostMapping(value = "/registration")
    public String createNewUser(@RequestBody  Config config) {
        System.out.println(config.getNumber());
        Employee emplyeeExists = employeedao.findByNumber(config.getNumber());
        if (emplyeeExists != null) {
            return "Already Registered";
        }else{
           try{

            Gender gender = new Gender();
            gender.setName("Male");
            genderdao.save(gender);

            Civilstatus civilstatus = new Civilstatus();
            civilstatus.setName("Married");
            civilstatusdao.save(civilstatus);

            Employeestatus employeestatus = new Employeestatus();
            employeestatus.setName("Working");
            employeestatusdao.save(employeestatus);

            Designation designation = new Designation();
            designation.setName("Owner");
            designationdao.save(designation);

            Employee employee = new Employee();
            employee.setGenderId(gender);
            employee.setCivilstatusId(civilstatus);
            employee.setDesignationId(designation);
            employee.setEmployeestatusId(employeestatus);
            employee.setNumber(config.getNumber());
            employee.setCallingname("Admin");
            employee.setFullname(config.getFullname());
            employee.setNic("000000000000");
            employee.setAddress(config.getAddress());
            employee.setMobile(config.getMobile());
            employee.setDoassignment(config.getRegdate());


            Employee saveemplyee =  employeedao.saveAndFlush(employee);

            User user = new User();
            user.setUserName(config.getUsername());
            user.setEmail(config.getEmail());
            user.setPassword(config.getPassword());
            user.setEmployeeId(saveemplyee);
            user.setEmployeeCreatedId(saveemplyee);

            Role role = new Role();
            role.setRole("ADMIN");
            roledao.save(role);

            Role userRole = roledao.findByRole("ADMIN");
            user.setRoles(new HashSet<Role>(Arrays.asList(userRole)));
            userService.saveUser(user);

            return "0";
           }catch (Exception e) {
               return "Error-Saving : " + e.getMessage();
           }

        }


    }

    @RequestMapping(value = "/mainwindow", method = RequestMethod.GET)
    public ModelAndView mainwindow() {
        ModelAndView modelAndView = new ModelAndView();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());

        System.out.println(user.getUserName());
       modelAndView.addObject("userName", "Welcome " + user.getUserName() + "/"  + " (" + user.getEmail() + ")");
        modelAndView.addObject("adminMessage", "Content Available Only for Users with Admin Role");
        System.out.println("12a");
        modelAndView.setViewName("mainvindowtest.html");
        System.out.println("123b");
        return modelAndView;
    }

}