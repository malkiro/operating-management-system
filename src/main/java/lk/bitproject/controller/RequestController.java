package lk.bitproject.controller;

import lk.bitproject.model.Customer;
import lk.bitproject.model.Request;
import lk.bitproject.model.User;
import lk.bitproject.repository.CStatusRepository;
import lk.bitproject.repository.CustomerReposiory;
import lk.bitproject.repository.RequestReposiory;
import lk.bitproject.repository.RequeststatusRepository;
import lk.bitproject.service.EmailService;
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
@RequestMapping(value = "/request")
public class RequestController {

    @Autowired
    private RequestReposiory dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private RequeststatusRepository daoStatus;

    //GET mapping for get inventory list Inventory
    @GetMapping(value = "/activelist", produces = "application/json")
    public List<Request> activeList(){
        return dao.activeList();
    }


    //get service for get customer order with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public Request getNextNumber() {
        String nextnumber = dao.getNextNumber();
        Request req = new Request(nextnumber);
        return req;
    }

    //get service for get data from Database (/request/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Request> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"REQUEST");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;

    }


    //get data with given parametters with searchtext (/request/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<Request> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"REQUEST");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }


    //post service for insert data into database
    @PostMapping
    public String add(@RequestBody Request request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"REQUEST");
        if(user!= null && priv.get("add")) {
            Request reqnum = dao.findByNyumber(request.getNo());
            if (reqnum != null)
                return "Error Saving : Request Allready Created (Number Exsits)";

            try {
                dao.save(request);

                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update date in database
    @PutMapping
    public String update(@RequestBody Request request) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"REQUEST");
        if(user!= null && priv.get("update")) {
            //get request object with given nic
            Request reqexst = dao.getOne(request.getId());

            //check null of cusregno
            if (reqexst != null)
                try {
                    reqexst.setRequeststatusId(daoStatus.getOne(2));
                    dao.save(reqexst);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : Request Allready Created (Number Exsits)";

            }

        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Request request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"REQUEST");
        if(user!= null && priv.get("delete")) {

            Request reqexsits = dao.getOne(request.getId());

            if (reqexsits == null)
                return "Error Deleting : Request not Exsits";

                try {
                    reqexsits.setRequeststatusId(daoStatus.getOne(4));
                dao.save(reqexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting: You Have no Permission";

    }
}
