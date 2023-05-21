package lk.bitproject.controller;

import lk.bitproject.model.Subcategory;
import lk.bitproject.model.User;
import lk.bitproject.repository.CStatusRepository;
import lk.bitproject.repository.SubcategoryRepository;
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
@RequestMapping(value = "/subcategory")
public class SubcategoryController {
    @Autowired
    private SubcategoryRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Subcategory> subcategoryList(){
        return dao.findAll();
    }

    // get list by category [subcategory/listbycategory?categoryid=]
    @GetMapping(value = "/listbycategory", params = {"categoryid"}, produces = "application/json")
    public List<Subcategory> categoryListbycategory(@RequestParam("categoryid") int categoryid) {
        return dao.findAllByCategory(categoryid);
    }

    //get service for get data from Database (/subcategory/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Subcategory> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUBCATEGORY");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/subcategory/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size", "searchtext"}, produces = "application/json")
    public Page<Subcategory> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUBCATEGORY");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext, PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //post service for insert data ino database
    @PostMapping
    public String add(@RequestBody Subcategory subcategory) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUBCATEGORY");
        if(user!= null && priv.get("add")) {
            Subcategory subname = dao.findByName(subcategory.getName());
            if (subname != null)
                return "Error Saving : Subcategory Allready Registered (Subcategory Name Exsits)";

            try {
                dao.save(subcategory);
                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update data in database
    @PutMapping
    public String update(@RequestBody Subcategory subcategory) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUBCATEGORY");
        if(user!= null && priv.get("update")) {
            //get subcategory object with given nic
            Subcategory subcatexst = dao.getOne(subcategory.getId());

            //check null of cusregno
            if (subcatexst != null)
                try {
                    dao.save(subcategory);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : Subcategory Allready Registered";

            }




        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Subcategory subcategory) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUBCATEGORY");
        if(user!= null && priv.get("delete")) {

            Subcategory subcatexsits = dao.getOne(subcategory.getId());

            if (subcatexsits == null)
                return "Error Deleting : Subcategory not Exsits";

            try {
//                subcatexsits.setCstatusId(daoStatus.getOne(3));
                dao.delete(subcatexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
