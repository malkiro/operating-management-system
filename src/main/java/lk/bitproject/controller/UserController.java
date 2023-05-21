package lk.bitproject.controller;

import lk.bitproject.model.Role;
import lk.bitproject.model.User;
import lk.bitproject.model.UserRole;
import lk.bitproject.repository.UserRepository;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RequestMapping(value = "/user")
@RestController
public class UserController {


    @Autowired
    private UserRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @GetMapping(value = "/getAdmin", produces = "application/json")
    public User getAdmin() {
        return dao.getAdmin();
    }

    @GetMapping(path = "/getuser/{userName}", produces = "application/json")
    public User getUserName(@PathVariable("userName")String userName) {

        return dao.findByLoggedName(userName);
    }

    @GetMapping(value = "/list", produces = "application/json")
    public List<User> user() {
        return dao.list();
    }


    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<User> getAll(@RequestParam("page") int page, @RequestParam("size") int size ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"USER");
        if(user!= null && priv.get("select")){
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        }
        return null;

    }


    @GetMapping(value = "/findAll",params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<User> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        System.out.println(user);
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"USER");
        if(user!= null && priv.get("select")){
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        }
        return null;
    }


    @Transactional
    @PostMapping()
    public String add(@Validated @RequestBody User user) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User exuser = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(exuser,"USER");
        if(exuser!= null && priv.get("add")) {
            try {

                userService.saveUser(user);
                return "0";
            } catch (Exception e) {
                return "Error Saving : " + e.getMessage();
            }

        } else {
            return "Error Saving : You have no Permission";
        }
    }



    @PutMapping
    public String update(@Validated @RequestBody User user) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User exuser = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(exuser,"USER");
        if(exuser!= null && priv.get("update")) {
            try {

               User userext = dao.getOne(user.getId());
                userext.getRoles().clear();
                dao.save(userext);
            //dao.delete(dao.getOne(user.getId()));


            dao.save(user);
                return "0";
            }
            catch(Exception e) {
                return "Error Updating : " + e.getMessage();
            }
        }
        else
                    return "Error Updating : You have no Permission";
    }


    @DeleteMapping
    public String delete(@RequestBody User user ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User exuser = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(exuser,"USER");
        if(exuser!= null && priv.get("delete")) {
            try {
                User extuser = dao.getOne(user.getId());
                extuser.setActive(false);
                 dao.save(extuser);
                    return "0";

            } catch (Exception e) {
                return "Error Deleting : " + e.getMessage();
            }
        }

        else
             return "Error Deleting : You have no Permission";

    }

//
//
//
//    @RequestMapping(value = "/changepassword",params = {"username","exsistingpassword","newpassword"}, method = RequestMethod.POST, produces = "application/json")
//    public String config( @RequestParam("username") String username, @RequestParam("exsistingpassword") String exsistingpassword, @RequestParam("newpassword") String newpassword) {
//
//        User user =null;
//
//        if(AuthProvider.isUser(username,exsistingpassword))
//        user = dao.findByUsername(username);
//
//        if(user==null)
//            return "0";
//        else {
//
//            user.setSalt(AuthProvider.generateSalt());
//            user.setPassword(newpassword);
//            user.setPassword(AuthProvider.getHash(user.getPassword()+user.getSalt()));
//
//
//           try {
//
//               dao.save(user);
//                return "1";
//            }
//
//            catch (Exception ex){
//
//                return "Failed to change as "+ex.getMessage();}
//
//        }
//
//
//    }
//




}