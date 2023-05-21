package lk.bitproject.controller;

import lk.bitproject.model.Batch;
import lk.bitproject.model.User;
import lk.bitproject.repository.BatchRepository;
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
@RequestMapping(value = "/batch")
public class BatchController {
    @Autowired
    private BatchRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    //GET mapping for get batch list Batch (id, batchcode,avalableqty and marketprice)
    @GetMapping(value = "/list", produces = "application/json")
    public List<Batch> batchList(){
        return dao.List();
    }

    //GET mapping for get batch list Batch (id, batchcode, marketprice, salesprice, mnfdate, expdate and itemId)
    @GetMapping(value = "/grnlist", produces = "application/json")
    public List<Batch> grnbatchList(){
        return dao.grnList();
    }

    // get item list by byitem [batch/byitem?supplierid=]
    @GetMapping(value = "/byitem",params ={"itemid"}, produces = "application/json")
    public Batch batchbyItem(@RequestParam("itemid") int itemid){
        List<Batch> batchs = dao.byItem(itemid);
        if(batchs != null)
            return batchs.get(0);
        else return  null;
    }

    // get list by item [batch/listbyitem?itemid=]  //Invoice batchlist
    @GetMapping(value = "/listbyitem",params = {"itemid"},produces = "application/json")
    public List<Batch> itemListbyitem(@RequestParam("itemid")int itemid) {
        return dao.listByItem(itemid);
    }



//get service for get data from Database (/batch/findAll?page=0&size=3)
@GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
public Page<Batch> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User user = userService.findUserByUserName(auth.getName());
    HashMap<String,Boolean> priv = authority.getPrivilages(user,"BATCH");
    if(user!= null && priv.get("select"))
        return dao.findAll(PageRequest.of(page, size, Sort.Direction.ASC, "id"));
    else
        return null;
}

    //get data with given parametters with searchtext (/batch/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<Batch> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"BATCH");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.ASC, "id"));
        else
            return null;
    }

    //Put service for update date in database
    @PutMapping
    public String update(@RequestBody Batch batch) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"BATCH");
        if(user!= null && priv.get("update")) {
            //get customer object with given nic
            Batch bchexst = dao.getOne(batch.getId());

            //check null of cusregno
            if (bchexst != null)
                try {
                    dao.save(batch);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : Batch Allready Registered (Batch Code Exsits)";

            }

        } else
            return "Error Updating : You Have no Permission";

    }

//    //delete service for delete data in database (no delete change status into delete)
//    @DeleteMapping
//    public String delete(@RequestBody Batch batch) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        User user = userService.findUserByUserName(auth.getName());
//        HashMap<String,Boolean> priv = authority.getPrivilages(user,"BATCH");
//        if(user!= null && priv.get("delete")) {
//
//            Batch bchexst = dao.getOne(batch.getId());
//
//            if (bchexst == null)
//                return "Error Deleting: Batch not Exsits";
//
//            try {
//                //bchexst.setItemstatusId(daoStatus.getOne(3));
//                dao.save(bchexst);
//                return "0";
//            } catch (Exception ex) {
//                return "Error Deleting: " + ex.getMessage();
//            }
//
//        } else
//            return "Error Deleting : You Have no Permission";
//
//    }

}