package lk.bitproject.controller;

import lk.bitproject.model.Brand;
import lk.bitproject.model.User;
import lk.bitproject.repository.BrandRepository;
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
@RequestMapping(value = "/brand")
public class BrandController {
    @Autowired
    private BrandRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Brand> brandList(){
        return dao.findAll();
    }

    // get list by category [brand/listbycategory?categoryid=]
    @GetMapping(value = "/listbycategory",params = {"categoryid"},produces = "application/json")
    public List<Brand> brandListbycategory(@RequestParam("categoryid")int categoryid){
        return dao.findAllByCategory(categoryid);
    }

    //get service for get data from Database (/brand/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Brand> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"BRAND");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/brand/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size", "searchtext"}, produces = "application/json")
    public Page<Brand> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"BRAND");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext, PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }
    
    //post service for insert data ino database
    @PostMapping
    public String add(@RequestBody Brand brand) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"BRAND");
        if(user!= null && priv.get("add")) {
            Brand bname = dao.findByName(brand.getName());
            if (bname != null)
                return "Error Saving : Brand Allready Registered (Brand Name Exsits)";

            try {
                dao.save(brand);
                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update data in database
    @PutMapping
    public String update(@RequestBody Brand brand) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"BRAND");
        if(user!= null && priv.get("update")) {
            //get brand object with given nic
            Brand brndexst = dao.getOne(brand.getId());

            //check null of cusregno
            if (brndexst != null)
                try {
                    dao.save(brand);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : Brand Allready Registered";

            }




        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Brand brand) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"BRAND");
        if(user!= null && priv.get("delete")) {

            Brand brndexsits = dao.getOne(brand.getId());

            if (brndexsits == null)
                return "Error Deleting : Brand not Exsits";

            try {
//                brndexsits.setCstatusId(daoStatus.getOne(3));
                dao.delete(brndexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
