package lk.bitproject.controller;

import lk.bitproject.model.Supplier;
import lk.bitproject.model.Supply;
import lk.bitproject.model.User;
import lk.bitproject.repository.SStatusRepository;
import lk.bitproject.repository.SupplierRepository;
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
@RequestMapping(value = "/supplier")
public class SupplierController {

    @Autowired
    private SupplierRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @Autowired
    private SStatusRepository daoStatus;

    //GET mapping for get supplier list Supplier (id, name and tobepaid)
    @GetMapping(value = "/list", produces = "application/json")
    public List<Supplier> supplierList(){
        //findAll --> Supplier model all properties
        //return dao.findAll

        //list() --> get supplier list with id and name
        return dao.List();
    }

    //GET mapping for get supplier list Supplier (id, name and tobepaid)
    @GetMapping(value = "/activelist", produces = "application/json")
    public List<Supplier> activesupplierList(){
        return dao.activeList();
    }

    //GET mapping for get supplier list Supplier (id, name, bankname, bankbranch, bankaccount, accountholder, tobepaid)
    @GetMapping(value = "/paymentlist", produces = "application/json")
    public List<Supplier> supplierPaymentList(){
        return dao.PaymentList();
    }

    //GET mapping for get supplier list Supplier (id, name, bankname, bankbranch, bankaccount, accountholder, tobepaid)
    @GetMapping(value = "/activepaymentlist", produces = "application/json")
    public List<Supplier> activesupplierPaymentList(){
        return dao.activePaymentList();
    }

    //get service for get supplier with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public Supplier getNextNumber() {
        String nextnumber = dao.getNextNumber();
        Supplier sup = new Supplier(nextnumber);
        return sup;
    }


    //get service for get data from Database (/supplier/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Supplier> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUPPLIER");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }


    //get data with given parametters with searchtext (/supplier/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size", "searchtext"}, produces = "application/json")
    public Page<Supplier> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUPPLIER");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext, PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //post service for insert data into database
    @PostMapping
    public String add(@Validated @RequestBody Supplier supplier) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUPPLIER");
        if(user!= null && priv.get("add")) {
            Supplier supreg = dao.findByRegno(supplier.getRegno());

            if (supreg == null) {
                //  return "Error : Supplier Allready Registered (Reg Number Exsits)";

                try {
                    for (Supply supply : supplier.getSupplyList())
                        supply.setSupplierId(supplier);
                    supplier.setTobepaid(BigDecimal.valueOf(0.00));
                    dao.save(supplier);
                    return "0";
                } catch (Exception ex) {
                    return "Error Saving: " + ex.getMessage();
                }

            } else {
                return "Error Saving : Supplier Allready Exsits (Reg Number Exsits)";
            }
        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update date in database
    @PutMapping
    public String update(@Validated @RequestBody Supplier supplier) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUPPLIER");
        if(user!= null && priv.get("update")) {
            //get supplier object with given nic
            Supplier sup = dao.getOne(supplier.getId());

            //check null of cusregno
            if (sup != null)
                try {
                    for (Supply supply : supplier.getSupplyList())
                        supply.setSupplierId((supplier));
                    dao.save(supplier);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }
            else {
                return "Error Updating : Supplier Allready Registered (Reg Number Exsits)";
            }

        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Supplier supplier) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"SUPPLIER");
        if(user!= null && priv.get("delete")) {

            Supplier sup = dao.getOne(supplier.getId());

            if (sup != null) {

                try {
                    for (Supply supply : supplier.getSupplyList())
                        supply.setSupplierId(sup);

                    sup.setSstatusId(daoStatus.getOne(3));
                    dao.save(sup);
                    return "0";
                } catch (Exception ex) {
                    return "Error Deleting : " + ex.getMessage();
                }

            } else {
                return "Error Deleting : Supplier not Exsits";
            }
        } else
            return "Error Deleting : You Have no Permission";

    }
}
