package lk.bitproject.controller;

import lk.bitproject.model.Item;
import lk.bitproject.model.User;
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
@RequestMapping(value = "/item")
public class ItemController {

    @Autowired
    private ItemRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;
    @Autowired
    private ItemstatusRepository daoStatus;

//    //GET mapping for get item list Item (id, name)
//    @GetMapping(value = "/list", produces = "application/json")
//    public List<Item> itemList() {
//        return dao.List();
//    }


    @GetMapping(value = "/list", produces = "application/json")
    public List<Item> activeitemList() {
        return dao.activeList();
    }

    // get list by porder [item/listbyporder?porderid=]  //Porder porderitemlist
    @GetMapping(value = "/listbysupplier",params = {"supplierid"},produces = "application/json")
    public List<Item> itemListbysupplier(@RequestParam("supplierid")int supplierid) {
        return dao.listBySupplier(supplierid);
    }

    // get list by supplier [item/listbycategory?supplierid=]  //Porder categoryitemlist
    @GetMapping(value = "/listbysuppliercategory",params = {"supplierid","categoryid"},produces = "application/json")
    public List<Item> itemListbysuppliercategory(@RequestParam("supplierid")int supplierid,@RequestParam("categoryid")int categoryid) {
        return dao.listBySupplierCategory(supplierid,categoryid);
    }

    // get list by porder [item/listbyporder?porderid=]  //Grn grnitemlist
    @GetMapping(value = "/listbyporder",params = {"porderid"},produces = "application/json")
    public List<Item> itemListbyporder(@RequestParam("porderid")int porderid) {
        return dao.listByPorder(porderid);
    }

    // get list by porder [item/listbycategory?porderid=]  //Grn categoryitemlist
    @GetMapping(value = "/listbypordercategory",params = {"porderid","categoryid"},produces = "application/json")
    public List<Item> itemListbypordercategory(@RequestParam("porderid")int porderid,@RequestParam("categoryid")int categoryid) {
        return dao.listByPorderCategory(porderid,categoryid);
    }


    // get list by corder [item/listbycorder?corderid=]  //Invoice corderitemlist
    @GetMapping(value = "/listbycorder",params = {"corderid"},produces = "application/json")
    public List<Item> itemListbycorder(@RequestParam("corderid")int corderid) {
        return dao.listByCorder(corderid);
    }

    //get service for get data from Database (/item/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Item> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMER");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/item/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<Item> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"ITEM");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }



    //post service for insert data ino database
    @PostMapping
    public String add(@RequestBody Item item) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"ITEM");
        if(user!= null && priv.get("add")) {
            Item itmcode = dao.findByCode(item.getItemcode());
            Item itmname = dao.findByName(item.getItemname());
            if (itmcode != null)
                return "Error Saving: Item Allready Registered (Code Number Exsits)";

            if (itmname != null)
                return "Error Saving: Item Allready Registered \n (Item Name Exsits in Code No : "+itmname.getItemname() +"...)";


            try {
                dao.save(item);
                return "0";
            } catch (Exception ex) {
                return "Error Saving: " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update date in database
    @PutMapping
    public String update(@RequestBody Item item) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"ITEM");
        if(user!= null && priv.get("update")) {
            //get item object with given nic
            Item itmexst = dao.getOne(item.getId());

            //check null of itmexst
            if (itmexst == null)
                return "Error Updating: Item Not Existing...";

            if(!item.getItemname().equals(itmexst.getItemname())){
                Item itmname = dao.findByName(item.getItemname());
                if(!itmname.getItemcode().equals(item.getItemcode())){
                    return "Error Updating : Item Existing \n (Iten Exists in Code No : "+itmname.getItemcode() +"...)";
                }
            }

            try{
                dao.save(item);
                return "0";
            } catch(Exception ex){
                return  "Error Updating:"+ex.getMessage();
            }

        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Item item) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"ITEM");
        if(user!= null && priv.get("delete")) {

            Item itmexsits = dao.getOne(item.getId());

            if (itmexsits == null)
                return "Error Deleting: Item not Exsits";

            try {
                itmexsits.setItemstatusId(daoStatus.getOne(3));
                dao.save(itmexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting: " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
