package lk.bitproject.controller;

import lk.bitproject.model.SPayment;
import lk.bitproject.model.Supplier;
import lk.bitproject.model.Supply;
import lk.bitproject.model.User;
import lk.bitproject.repository.SPaymentRepository;
import lk.bitproject.repository.SPaymentstatusRepository;
import lk.bitproject.repository.SupplierRepository;
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
@RequestMapping(value = "/spayment")
public class SPaymentController {

    @Autowired
    private SPaymentRepository dao;

    @Autowired
    private SupplierRepository daosupplier;

    private AuthController authority;

    @Autowired
    private UserService userService;
    
    @Autowired
    private SPaymentstatusRepository daoStatus;

    //get service for get customer with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public SPayment getNextNumber() {
        String nextnumber = dao.getNextNumber();
        SPayment spay = new SPayment(nextnumber);
        return spay;
    }



    //get service for get data from Database (/spayment/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<SPayment> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SPAYMENT");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/spayment/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<SPayment> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SPAYMENT");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }



    //post service for insert data ino database
    @PostMapping
    public String add(@RequestBody SPayment spayment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SPAYMENT");
        if(user!= null && priv.get("add")) {
            SPayment spaybillno = dao.findByBillno(spayment.getSbillno());
            if (spaybillno != null)
                return "Error Saving : Supplier Payment Allready Paid (Bill No Number Exsits)";

            try {
                Supplier supplier = daosupplier.getOne(spayment.getSupplierId().getId());
                supplier.setTobepaid(supplier.getTobepaid().subtract(spayment.getPaidamount()));
                for (Supply supply : supplier.getSupplyList())
                    supply.setSupplierId(supplier);
                daosupplier.save(supplier);

                spayment.setSpaymentstatusId(daoStatus.getOne(2));
                dao.save(spayment);
                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

//    //Put service for update date in database
//    @PutMapping
//    public String update(@RequestBody SPayment spayment) {
//        //get authentincate object with login user --> not permisson the auth -- null
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        User user = userService.findUserByUserName(auth.getName());
//        //check login user has permission for insert data into database
//        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SPAYMENT");
//        if(user!= null && priv.get("update")) {
//            //get customer object with given nic
//            SPayment spaybillno = dao.getOne(spayment.getId());
//
//            //check null of cusregno
//            if (spaybillno != null)
//                try {
//                    Supplier supplier = daosupplier.getOne(spayment.getSupplierId().getId());
//                    supplier.setTobepaid(supplier.getTobepaid().add(spayment.getPaidamount()));
//                    for (Supply supply : supplier.getSupplyList())
//                        supply.setSupplierId(supplier);
//                    daosupplier.save(supplier);
//
//                    dao.save(spayment);
//                    return "0";
//                } catch (Exception ex) {
//                    return "Error Saving: " + ex.getMessage();
//                }else {
//                return "Error : Supplier Payment Allready Registered (Bill No Exsits)";
//            }
//
//
//
//        } else
//            return "Error Saving : You Have no Permission";
//
//    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody SPayment spayment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SPAYMENT");
        if(user!= null && priv.get("delete")) {

            SPayment spayexsits = dao.getOne(spayment.getId());

            if (spayexsits == null)
                return "Error Deleting : Supplier Payment not Exsits";

            try {
                spayexsits.setSpaymentstatusId(daoStatus.getOne(3));
                dao.save(spayexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";
    }
}
