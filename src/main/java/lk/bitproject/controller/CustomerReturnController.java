package lk.bitproject.controller;


import lk.bitproject.model.Batch;
import lk.bitproject.model.CustomerReturn;
import lk.bitproject.model.CustomerReturnItem;
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

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/customerreturn")
public class CustomerReturnController {

    @Autowired
    private CustomerReturnReposiory dao;

    private AuthController authority;

    @Autowired
    private UserService userService;
    
    @Autowired
    private CustomerReturnStatusRepository daoStatus;

    @Autowired
    private BatchRepository daoBatch;


    //GET mapping for get creturn list CustomerReturn (id, name, returnno, totalamount, customerId)
    @GetMapping(value = "/list", produces = "application/json")
    public List<CustomerReturn> customerReturnList(){
        return dao.List();
    }

    // get list by customer [customerreturn/listbycustomer?customerid=]
    @GetMapping(value = "/listbycustomer",params = {"customerid"},produces = "application/json")
    public List<CustomerReturn> itemListbycustomer(@RequestParam("customerid")int customerid) {
        return dao.listByCustomer(customerid);
    }


    //get service for get customerreturn with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public CustomerReturn getNextNumber() {
        String nextnumber = dao.getNextNumber();
        CustomerReturn cusr = new CustomerReturn(nextnumber);
        return cusr;
    }

    //get service for get data from Database (/CustomerReturn/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<CustomerReturn> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERRETURN");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;

    }


    //get data with given parametters with searchtext (/customerreturn/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<CustomerReturn> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERRETURN");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }


    //post service for insert data into database
    @PostMapping
    public String add(@RequestBody CustomerReturn customerreturn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERRETURN");
        if(user!= null && priv.get("add")) {
            CustomerReturn crno = dao.findByReturnno(customerreturn.getReturnno());

            if (crno != null)
                return "Error Saving : Customer Return Allready Registered (Return Number Exsits)";
            try {
                for(CustomerReturnItem customerReturnitem : customerreturn.getCustomerReturnItemList()){
                    customerReturnitem.setCustomerreturnId(customerreturn);

                    Batch batch = daoBatch.getOne(customerReturnitem.getBatchId().getId());
                    batch.setReturnqty(batch.getReturnqty()+(customerReturnitem.getRqty()));

                    daoBatch.save(batch);

                }


                dao.save(customerreturn);
                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update date in database
    @PutMapping
    public String update(@RequestBody CustomerReturn customerreturn) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERRETURN");
        if(user!= null && priv.get("update")) {
            //get customerreturn object with given nic
            CustomerReturn crexst = dao.getOne(customerreturn.getId());

            //check null of retrurnno
            if (crexst != null)
                try {
                    for(CustomerReturnItem customerReturnitem : customerreturn.getCustomerReturnItemList()){
                        customerReturnitem.setCustomerreturnId(customerreturn);

                        Batch batch = daoBatch.getOne(customerReturnitem.getBatchId().getId());
//                        batch.setReturnqty(batch.getReturnqty()+(customerReturnitem.getRqty()));

                        daoBatch.save(batch);

                    }

                    customerreturn.setReturnno(getNextNumber().getReturnno());
                    dao.save(customerreturn);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : Customer Return Allready Registered (Return Number Exsits)";

            }




        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody CustomerReturn customerreturn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMERRETURN");
        if(user!= null && priv.get("delete")) {

            CustomerReturn crexsits = dao.getOne(customerreturn.getId());

            if (crexsits == null)
                return "Error Deleting : Customer Return not Exsits";

                try {
                crexsits.setCustomerreturnstatusId(daoStatus.getOne(4));
                dao.save(crexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
