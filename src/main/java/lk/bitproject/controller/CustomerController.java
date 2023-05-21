package lk.bitproject.controller;

import lk.bitproject.model.Customer;
import lk.bitproject.model.SMS;
import lk.bitproject.model.User;
import lk.bitproject.repository.CStatusRepository;
import lk.bitproject.repository.CustomerReposiory;
//import lk.bitproject.service.SMSService;
import lk.bitproject.service.SMSService;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/customer")
public class CustomerController {

    @Autowired
    private CustomerReposiory dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @Autowired
    private SMSService smsService;
    
    @Autowired
    private CStatusRepository daoStatus;

    //GET mapping for get customer list Customer (id, cname, point, distributionrouteId)
    @GetMapping(value = "/list", produces = "application/json")
    public List<Customer> customerList(){
        return dao.List();
    }

    //GET mapping for get customer list Customer (id, cname, point, distributionrouteId))
    @GetMapping(value = "/activelist", produces = "application/json")
    public List<Customer> activecustomerList(){
        return dao.activeList();
    }

    //GET mapping for get customer list Customer (id, regno, cname, cmobile, address, cemail, maxcreditlimt, point, tobepaid, distributionrouteId)
    @GetMapping(value = "/invoicelist", produces = "application/json")
    public List<Customer> invoicecustomerlist(){
        return dao.invoiceList();
    }

    //GET mapping for get customer list Customer (id, regno, cname, cmobile, address, cemail, maxcreditlimt, point, tobepaid, distributionrouteId)
    @GetMapping(value = "/activeinvoicelist", produces = "application/json")
    public List<Customer> activeinvoicecustomerList(){
        return dao.activeinvoiceList();
    }


    //get service for get customer with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public Customer getNextNumber() {
        String nextnumber = dao.getNextNumber();
        Customer cus = new Customer(nextnumber);
        return cus;
    }

    //get service for get data from Database (/customer/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Customer> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        //get auth object from SecurityContex
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        //get user object by given Auth object
        User user = userService.findUserByUserName(auth.getName());
        //get module privillege user
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMER");
        //check if user not equal null and check logged user select privillage
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;

    }


    //get data with given parametters with searchtext (/customer/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<Customer> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMER");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }


    //post service for insert data into database
    @PostMapping
    public String add(@Validated @RequestBody Customer customer) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMER");
        if(user!= null && priv.get("add")) {
            Customer cusreg = dao.findByRegno(customer.getRegno());
            Customer cuscmobile = dao.findByMobile(customer.getCmobile());
            Customer cuscnic = dao.findByNIC(customer.getCnic());
            if (cusreg != null)
                return "Error Saving: Customer Allready Registered \n (Reg Number Exists)";

            if (cuscmobile != null)
                return "Error Saving: Customer Mobile Allready in System \n (Mobile Number Exists in Reg No : "+cuscmobile.getRegno() +"...)";

            if (cuscnic != null)
                return "Error Saving: Customer NIC Allready in System \n (NIC Exists in Reg No : "+cuscmobile.getRegno() +"...)";

            try {
                customer.setTobepaid(BigDecimal.valueOf(0.00));
                customer.setPoint(Integer.valueOf(0));

//                SMS sms = new SMS();
////                sms.setTo("+94702135621");
//                sms.setTo("+94"+customer.getCmobile().substring(1));
//                sms.setMessage("Registration Successful....!" +
//                        "\n\n Registration No : " +customer.getRegno()+
//                        "\n Registered Name :"+customer.getCname()+
//                        "\n Registration Date: " +customer.getRegdate()+
//                "\n\n Kaushalya Distributors");
//
//                    smsService.send(sms);


                dao.save(customer);
                return "0";
            } catch (Exception ex) {
                return "Error Saving: " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";
    }

    //Put service for update data in database
    @PutMapping
    public String update(@Validated @RequestBody Customer customer){
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMER");
        if(user!= null && priv.get("update")) {

            //get Customer object with given customer id
            Customer cusext =dao.getOne(customer.getId());

            //check null of cusexst
            if (cusext == null)
                return "Error Updating: Customer Not Existing...";

            try{
                dao.save(customer);
                return "0";
            } catch(Exception ex){
                return  "Error Updating:"+ex.getMessage();
            }

        }
        else
            return "Error Updating : You have no permission";
    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Customer customer) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CUSTOMER");
        if(user!= null && priv.get("delete")) {

            Customer cusexsits = dao.getOne(customer.getId());

            if (cusexsits == null)
                return "Error Deleting : Customer not Exists";

                try {
                cusexsits.setCstatusId(daoStatus.getOne(3));
                dao.save(cusexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
