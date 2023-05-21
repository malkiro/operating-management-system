package lk.bitproject.controller;

import lk.bitproject.model.Customer;
import lk.bitproject.model.CustomerPoint;
import lk.bitproject.model.User;
import lk.bitproject.repository.CStatusRepository;
import lk.bitproject.repository.CustomerPointReposiory;
import lk.bitproject.repository.CustomerReposiory;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/customerpoint")
public class CustomerPointController {

    @Autowired
    private CustomerPointReposiory dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @GetMapping(value = "/list", produces = "application/json")
    public List<CustomerPoint> customerPointList(){
        return dao.findAll(Sort.by(Sort.Direction.DESC,"id"));
    }

    //get service for get data from Database (/customerpoint/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<CustomerPoint> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERPOINT");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;

    }


    //get data with given parametters with searchtext (/customerpoint/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<CustomerPoint> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERPOINT");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }


    //post service for insert data into database
    @PostMapping
    public String add(@RequestBody CustomerPoint customerpoint) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERPOINT");
        if(user!= null && priv.get("add")) {
            CustomerPoint cpointname = dao.findByName(customerpoint.getName());
//            CustomerPoint cusnic = dao.findByNic(customerpoint.getCnic());
            if (cpointname != null)
                return "Error Saving : CustomerPoint Name Allready Registered";
            try {
                dao.save(customerpoint);
                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update date in database
    @PutMapping
    public String update(@RequestBody CustomerPoint customerpoint) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERPOINT");
        if(user!= null && priv.get("update")) {
            //get customerpoint object with given nic
            CustomerPoint cpointexst = dao.getOne(customerpoint.getId());

            //check null of cusregno
            if (cpointexst != null)
                try {
                    dao.save(customerpoint);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : CustomerPoint Name Allready Registered";

            }

        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody CustomerPoint customerpoint) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERPOINT");
        if(user!= null && priv.get("delete")) {

            CustomerPoint cuspointexsits = dao.getOne(customerpoint.getId());

            if (cuspointexsits == null)
                return "Error Deleting : CustomerPoint not Exsits";

                try {
//                cuspointexsits.setCstatusId(daoStatus.getOne(3));
                dao.delete(cuspointexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}

