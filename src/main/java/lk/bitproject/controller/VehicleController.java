package lk.bitproject.controller;

import lk.bitproject.model.Employee;
import lk.bitproject.model.Vehicle;
import lk.bitproject.model.User;
import lk.bitproject.repository.*;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/vehicle")
public class VehicleController {

    @Autowired
    private VehicleRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;
    @Autowired
    private VehicleStatusRepository daoStatus;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Vehicle> vehicleList(){
        return dao.findAll();
    }

    // get available driver for distributiondate //Distribute driverlist with date
    @GetMapping(value ="/listbyavilablevehicle", params = {"distributiondate"}, produces = "application/json")
    public List<Vehicle> listbyavilablevehicle(@RequestParam("distributiondate") String distributiondate){
        return dao.listbyavilablevehicle(LocalDate.parse(distributiondate));
    }

    //get service for get data from Database (/vehicle/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Vehicle> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"VEHICLE");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/vehicle/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<Vehicle> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"VEHICLE");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }



    //post service for insert data ino database
    @PostMapping
    public String add(@RequestBody Vehicle vehicle) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"VEHICLE");
        if(user!= null && priv.get("add")) {
            Vehicle vehicleno = dao.findByVehicleno(vehicle.getVehicleno());
            Vehicle vehiclename = dao.findByVehiclename(vehicle.getVehiclename());
            if (vehicleno != null)
                return "Error Saving : Vehicle Allready Exist (Vehicle No Number Exsits)";

            if (vehiclename != null)
                return "Error Saving : Vehicle Allready Exist (Vehicle Name Exsits)";

            try {
                dao.save(vehicle);
                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update date in database
    @PutMapping
    public String update(@RequestBody Vehicle vehicle) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"VEHICLE");
        if(user!= null && priv.get("update")) {
            //get customer object with given nic
            Vehicle vehicleno = dao.getOne(vehicle.getId());

            //check null of cusregno
            if (vehicleno != null)
                try {
                    dao.save(vehicle);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : Vehicle Allready Registered (Vehicle No Exsits)";

            }



        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Vehicle vehicle) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"VEHICLE");
        if(user!= null && priv.get("delete")) {

            Vehicle vehexsists = dao.getOne(vehicle.getId());

            if (vehexsists == null)
                return "Error Deleting : Vehicle not Exsits";

            try {
                vehexsists.setVehiclestatusId(daoStatus.getOne(3));
                dao.save(vehexsists);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
