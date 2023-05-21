package lk.bitproject.controller;

import lk.bitproject.model.DistributionRoute;
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

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/distributionroute")
public class DistributionRouteController {

    @Autowired
    private DistributionRouteRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @Autowired
    private DistributionRouteStatusRepository daoStatus;

    //GET mapping for get route list DistributionRoute (id, name)
    @GetMapping(value = "/list", produces = "application/json")
    public List<DistributionRoute> distributionRouteList(){
        return dao.List();
    }


    //GET mapping for get route list DistributionRoute (id, name, bankname, bankbranch, bankaccount, accountholder, tobepaid)
    @GetMapping(value = "/activelist", produces = "application/json")
    public List<DistributionRoute> activedistributionRouteList(){
        return dao.activeList();
    }


    //get service for get distributionRoute with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public DistributionRoute getNextNumber() {
        String nextnumber = dao.getNextNumber();
        DistributionRoute dis = new DistributionRoute(nextnumber);
        return dis;
    }


    //get service for get data from Database (/distributionroute/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<DistributionRoute> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTIONROUTE");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/distributionroute/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<DistributionRoute> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTIONROUTE");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }


    //post service for insert data ino database
    @PostMapping
    public String add(@RequestBody DistributionRoute distributionroute) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTIONROUTE");
        if(user!= null && priv.get("add")) {
            DistributionRoute drouteno = dao.findByRouteno(distributionroute.getRouteno());
            DistributionRoute droutename = dao.findByRoutename(distributionroute.getRoutename());
            if (drouteno != null)
                return "Error Saving : Route Number Allready Exsits (Route No Exsits)";

            if (droutename != null)
                return "Error Saving : Route Allready Exsits (Route Name Exsits)";

            try {
                dao.save(distributionroute);
                return "0";
            } catch (Exception ex) {
                return "Error Saving: " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update date in database
    @PutMapping
    public String update(@RequestBody DistributionRoute distributionroute) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTIONROUTE");
        if(user!= null && priv.get("update")) {
            //get customer object with given nic
            DistributionRoute drouteno = dao.getOne(distributionroute.getId());

            //check null of cusregno
            if (drouteno != null)
                try {
                    dao.save(distributionroute);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : Route Number Allready Registered (Bill No Exsits)";

            }



        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody DistributionRoute distributionroute) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTIONROUTE");
        if(user!= null && priv.get("delete")) {

            DistributionRoute routeexsits = dao.getOne(distributionroute.getId());

            if (routeexsits == null)
                return "Error Deleting : Route not Exsits";

            try {
                routeexsits.setDistributionroutestatusId(daoStatus.getOne(3));
                dao.save(routeexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
