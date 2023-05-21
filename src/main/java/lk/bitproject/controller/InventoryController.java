package lk.bitproject.controller;

import lk.bitproject.model.Inventory;
import lk.bitproject.model.Item;
import lk.bitproject.model.User;
import lk.bitproject.repository.InventoryRepository;
import lk.bitproject.repository.ItemRepository;
import lk.bitproject.repository.ItemstatusRepository;
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
@RequestMapping(value = "/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

//    @Autowired
//    private ItemstatusRepository daoStatus;

    //GET mapping for get low inventory list Inventory
    @GetMapping(value = "/activelist", produces = "application/json")
    public List<Inventory> activeList(){
        return dao.activeList();
    }

    //get service for get data from Database (/inventory/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Inventory> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"INVENTORY");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.ASC, "id"));
        else
            return null;

    }

    //get data with given parametters with searchtext (/inventory/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<Inventory> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"INVENTORY");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.ASC, "id"));
        else
            return null;
    }



//    //post service for insert data ino database
//    @PostMapping
//    public String add(@RequestBody Item item) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        User user = userService.findUserByUserName(auth.getName());
//        HashMap<String,Boolean> priv = authority.getPrivilages(user,"INVENTORY");
//        if(user!= null && priv.get("add")) {
//            Item itmcode = dao.findByCode(item.getItemcode());
//            if (itmcode != null)
//                return "Error : Item Allready Registered (Code Number Exsits)";
//
//            try {
//                dao.save(item);
//                return "0";
//            } catch (Exception ex) {
//                return "Error Saving: " + ex.getMessage();
//            }
//
//        } else
//            return "Error Saving : You Have no Permission";
//
//    }
//
//    //Put service for update date in database
//    @PutMapping
//    public String update(@RequestBody Item item) {
//        //get authentincate object with login user --> not permisson the auth -- null
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        User user = userService.findUserByUserName(auth.getName());
//        //check login user has permission for insert data into database
//        if (user != null) {
//            //get customer object with given nic
//            Item itmexst = dao.getOne(item.getId());
//
//            //check null of cusregno
//            if (itmexst != null)
//                try {
//                    dao.save(item);
//                    return "0";
//                } catch (Exception ex) {
//                    return "Error Saving: " + ex.getMessage();
//                }else {
//                return "Error : Customer Allready Registered (Code Exsits)";
//
//            }
//
//
//
//        } else
//            return "Error Saving : You Have no Permission";
//
//    }
//
//    //delete service for delete data in database (no delete change status into delete)
//    @DeleteMapping
//    public String delete(@RequestBody Item item) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        User user = userService.findUserByUserName(auth.getName());
//        if (user != null) {
//
//            Item itmexsits = dao.getOne(item.getId());
//
//            if (itmexsits == null)
//                return "Error : Customer not Exsits";
//
//            try {
//                itmexsits.setItemstatusId(daoStatus.getOne(3));
//                dao.save(itmexsits);
//                return "0";
//            } catch (Exception ex) {
//                return "Error Saving: " + ex.getMessage();
//            }
//
//        } else
//            return "Error Saving : You Have no Permission";
//
//    }
}
