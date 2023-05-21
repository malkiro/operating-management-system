package lk.bitproject.controller;

import lk.bitproject.model.*;
import lk.bitproject.repository.*;
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

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/corder")
public class COrderController {

    @Autowired
    private COrderRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @Autowired
    private SMSService smsService;

    @Autowired
    private COrderStatusRepository daoStatus;

    @Autowired
    private CustomerReposiory daoc;

    //GET mapping for get corder list Supplier (id, name)
    @GetMapping(value = "/list", produces = "application/json")
    public List<COrder> cOrderList(){
        return dao.List();
    }

    //GET mapping for get corder list COrder (id, name) (Active)
    @GetMapping(value = "/activelist", produces = "application/json")
    public List<COrder> activecOrderList(){
        return dao.activeList();
    }



    //get service for get corder with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public COrder getNextNumber() {
        String nextnumber = dao.getNextNumber();
        COrder cor = new COrder(nextnumber);
        return cor;
    }

    //get service for get data from Database (/corder/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<COrder> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CORDER");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;

    }

    //get data with given parametters with searchtext (/corder/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size", "searchtext"}, produces = "application/json")
    public Page<COrder> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CORDER");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext, PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //post service for insert data into database
    @PostMapping
    public String add(@Validated @RequestBody COrder corder) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CORDER");
        if(user!= null && priv.get("add")) {
//            System.out.println(porder);
//            return "0";
            COrder corno = dao.findByCOno(corder.getCono());

            if (corno == null) {
                 // return "Error : Purchase Order Allready Ordered (POrno Number Exsits)";

                try {
//                                    SMS sms = new SMS();
////                sms.setTo("+94702135621");
//                sms.setTo("+94"+corder.getCustomerId().getCmobile().substring(1));
//                sms.setMessage("Your Order has been Accepted.....!" +
//                        "\n\n Order Number : " +corder.getCono()+
//                        "\n Order Date :"+corder.getDate()+
//                        "\n Customer Id : " +corder.getCustomerId().getRegno()+
//                        "\n Customer Name : " +corder.getCustomerId().getCname()+
//                        "\n Grand Total (Rs) : " +corder.getGrandtotal()+
//                        "\n Discount Ratio : " +corder.getDiscountedratio()+
//                        "\n Net Total (Rs) : " +corder.getNettotal()+
//                        "\n\n You will Recieve your order within 3 days" +
//                "\n\n Kaushalya Distributors");
//
//                    smsService.send(sms);
                    for (COrderItem cOrderItem :corder.getCorderItemList())
                        cOrderItem.setCorderId(corder);

                    Customer customer = daoc.getOne(corder.getCustomerId().getId());
                    customer.setPoint(corder.getCustomerId().getPoint());
                    daoc.save(customer);

                    corder.setCono(getNextNumber().getCono());
                    dao.save(corder);
                    return "0";
                } catch (Exception ex) {
                    return "Error Saving: " + ex.getMessage();
                }

            } else {
                return "Error Saving : Customer Order Allready Exsits (Order Number Exsits)";
            }
        } else
            return "Error Saving : You Have no Permission";
    }

    //Put service for update data in database
    @PutMapping
    public String update(@Validated @RequestBody COrder corder) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CORDER");
        if(user!= null && priv.get("update")) {
            //get supplier object with given nic
            COrder cor = dao.getOne(corder.getId());

            //check null of cusregno
            if (cor != null)
                try {
                    for (COrderItem cOrderItem : corder.getCorderItemList())
                    cOrderItem.setCorderId(corder);
                    dao.save(corder);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }
            else {
                return "Error Updating : Customer Order Allready Ordered (Order Number Exsits)";
            }

        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody COrder corder) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CORDER");
        if(user!= null && priv.get("delete")) {

            COrder cor = dao.getOne(corder.getId());

            if (cor != null) {

                try {
                    for (COrderItem cOrderItem : corder.getCorderItemList())
                        cOrderItem.setCorderId(cor);

                    cor.setCorderstatusId(daoStatus.getOne(7));
                    dao.save(cor);
                    return "0";
                } catch (Exception ex) {
                    return "Error Deleting: " + ex.getMessage();
                }

            } else {
                return "Error Deleting : Customer Order not Exsits";
            }
        } else
            return "Error Deleting : You Have no Permission";

    }
}
