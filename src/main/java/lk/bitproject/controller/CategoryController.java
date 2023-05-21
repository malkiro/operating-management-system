package lk.bitproject.controller;

import lk.bitproject.model.Category;
import lk.bitproject.model.User;
import lk.bitproject.repository.CategoryRepository;
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
@RequestMapping(value = "/category")
public class CategoryController {
    @Autowired
    private CategoryRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Category> categoryList(){
        return dao.findAll();
    }

    @GetMapping(value = "/listbysupplier",params = {"supplierid"}, produces = "application/json")
    public List<Category> categoryListbySupplier(@RequestParam("supplierid")int supplierid){
        return dao.listBysupplier(supplierid);}

    @GetMapping(value = "/listbyporder",params = {"porderid"}, produces = "application/json")
    public List<Category> categoryListbyPorder(@RequestParam("porderid")int porderid){
        return dao.listByporder(porderid);}

    //get service for get data from Database (/category/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Category> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CATEGORY");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/category/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size", "searchtext"}, produces = "application/json")
    public Page<Category> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CATEGORY");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext, PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //post service for insert data ino database
    @PostMapping
    public String add(@RequestBody Category category) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CATEGORY");
        if(user!= null && priv.get("add")) {
            Category catname = dao.findByName(category.getName());
            if (catname != null)
                return "Error Saving : Category Allready Registered (Category Name Exsits)";

            try {
                dao.save(category);
                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

//    //Put service for update data in database
//    @PutMapping
//    public String update(@RequestBody Category category) {
//        //get authentincate object with login user --> not permisson the auth -- null
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        User user = userService.findUserByUserName(auth.getName());
//        //check login user has permission for insert data into database
//        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CATEGORY");
//        if(user!= null && priv.get("update")) {
//            //get category object with given nic
//            Category catexst = dao.getOne(category.getId());
//
//            //check null of cusregno
//            if (catexst != null)
//                try {
//                    dao.save(category);
//                    return "0";
//                } catch (Exception ex) {
//                    return "Error Saving: " + ex.getMessage();
//                }else {
//                return "Error : Category Allready Registered";
//
//            }
//
//
//
//
//        } else
//            return "Error Saving : You Have no Permission";
//
//    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Category category) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CATEGORY");
        if(user!= null && priv.get("delete")) {

            Category catexsits = dao.getOne(category.getId());

            if (catexsits == null)
                return "Error Deleting : Category not Exsits";
            try {
//                catexsits.setCstatusId(daoStatus.getOne(3));
                dao.delete(catexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
