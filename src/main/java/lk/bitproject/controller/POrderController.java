package lk.bitproject.controller;


import lk.bitproject.model.Grn;
import lk.bitproject.model.POrder;
import lk.bitproject.model.POrderItem;
import lk.bitproject.model.User;
import lk.bitproject.repository.GrnRepository;
import lk.bitproject.repository.POrderRepository;
import lk.bitproject.repository.POrderStatusRepository;
import lk.bitproject.service.EmailService;
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
@RequestMapping(value = "/porder")
public class POrderController {

    @Autowired
    private POrderRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private POrderStatusRepository daoStatus;

    //GET mapping for get porder list POrder (id, pono)
    @GetMapping(value = "/list", produces = "application/json")
    public List<POrder> pOrderList(){
        return dao.List();
    }

    // get list by supplier [porder/listbysupplier?supplierid=]
    @GetMapping(value = "/listbysupplier",params = {"supplierid"},produces = "application/json")
    public List<POrder> itemListbysupplier(@RequestParam("supplierid")int supplierid) {
        return dao.listBySupplier(supplierid);
    }


    //get service for get porder with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public POrder getNextNumber() {
        String nextnumber = dao.getNextNumber();
        POrder por = new POrder(nextnumber);
        return por;
    }

    //get service for get data from Database (/porder/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<POrder> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"PORDER");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;

    }

    //get data with given parametters with searchtext (/porder/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size", "searchtext"}, produces = "application/json")
    public Page<POrder> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"PORDER");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext, PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //post service for insert data into database
    @PostMapping
    public String add(@Validated @RequestBody POrder porder) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"PORDER");
        if(user!= null && priv.get("add")) {
//            System.out.println(porder);
//            return "0";
            POrder porno = dao.findByPOno(porder.getPono());

            if (porno == null) {
                 // return "Error : Purchase Order Allready Ordered (POrno Number Exsits)";

                try {
                    StringBuffer message = new StringBuffer("No \t\t\t\t"+" Item Name\t\t\t\t\t"+"Quantity\n");
                    int i= 1;

                    for (POrderItem pOrderItem :porder.getPorderItemList()){
                        pOrderItem.setPorderId(porder);
                        message.append(i).append("\t\t")
                                .append(pOrderItem.getItemId().getItemname()).append("\t\t\t\t")
                                .append(pOrderItem.getQty()).append("\n");

                        i++;
                    }

                    porder.setPono(getNextNumber().getPono());
                    System.out.println(message);
                    emailService.sendMail("malkidilsha9@gmail.com",
                            "Please Sent Item Accoding to Following Porder",
                            "Porder Number : "+porder.getPono()+"\nItem Detail : \n\n" +message+ "\n\n Kaushalya Distributors");
                    dao.save(porder);
                    return "0";
                } catch (Exception ex) {
                    return "Error Saving: " + ex.getMessage();
                }

            } else {
                return "Error Saving : Purchase Order Allready Exsits (Order Number Exsits)";
            }
        } else
            return "Error Saving : You Have no Permission";
    }

    //Put service for update date in database
    @PutMapping
    public String update(@Validated @RequestBody POrder porder) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"PORDER");
        if(user!= null && priv.get("update")) {
            //get supplier object with given nic
            POrder por = dao.getOne(porder.getId());

            //check null of cusregno
            if (por != null)
                try {
                    for (POrderItem pOrderItem : porder.getPorderItemList())
                    pOrderItem.setPorderId(porder);
                    dao.save(porder);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }
            else {
                return "Error Updating : Purchase Order Allready Ordered (Order Number Exsits)";
            }

        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody POrder porder) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"PORDER");
        if(user!= null && priv.get("delete")) {

            POrder por = dao.getOne(porder.getId());

            if (por != null) {

                try {
                    for (POrderItem pOrderItem : porder.getPorderItemList())
                        pOrderItem.setPorderId(por);

                    por.setPorderstatusId(daoStatus.getOne(3));
                    dao.save(por);
                    return "0";
                } catch (Exception ex) {
                    return "Error Deleting : " + ex.getMessage();
                }

            } else {
                return "Error Deleting : Purchase Order not Exsits";
            }
        } else
            return "Error Deleting : You Have no Permission";

    }
}
