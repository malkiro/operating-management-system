package lk.bitproject.controller;

import lk.bitproject.model.*;
import lk.bitproject.repository.*;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/distribute")
public class DistributeController {
    @Autowired
    private DistributeRepository dao;

    private AuthController authority;

    @Autowired
    private UserService userService;
    @Autowired
    private DistributionStatusRepository daoStatus;

    @Autowired
    private InvoiceRepository daoinvoice;

    @Autowired
    private InvoiceStatusRepository daoinvoiceStatus;

    @Autowired
    private COrderRepository daocorder;

    @Autowired
    private COrderStatusRepository daocorderstatus;


    //GET mapping for get distribute list Distribute
    @GetMapping(value = "/activelist", produces = "application/json")
    public List<Distribute> activeList(){
        return dao.activeList();
    }

    //get service for get distribute with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public Distribute getNextNumber() {
        String nextnumber = dao.getNextNumber();
        Distribute dis = new Distribute(nextnumber);
        return dis;
    }

    //get service for get data from Database (/distribute/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Distribute> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTE");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/distribute/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<Distribute> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTE");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }



    //post service for insert data ino database
    @Transactional
    @PostMapping
    public String add(@RequestBody Distribute distribute) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTE");
        if(user!= null && priv.get("add")) {
            Distribute distributionno = dao.findByDistributionno(distribute.getDistributionno());
            if (distributionno != null)
                return "Error Saving : Distribution No Allready Paid (Distribution No Number Exsits)";

            try {

                for (DistributeInvoice distributeInvoice : distribute.getDistributeInvoiceList()){
                    distributeInvoice.setDistributeId(distribute);

                    // chanage Invoice status
                    Invoice invoice = daoinvoice.getOne(distributeInvoice.getInvoiceId().getId());

                    invoice.setInvoicestatusId(daoinvoiceStatus.getOne(2));
                    for (InvoiceItem invoiceItem : invoice.getInvoiceItemList())
                        invoiceItem.setInvoiceId(invoice);
                    daoinvoice.save(invoice);

                    // chanage order status
                    COrder cOrder = daocorder.getOne(invoice.getCorderId().getId());
                    cOrder.setCorderstatusId(daocorderstatus.getOne(3));
                    for (COrderItem cOrderItem : cOrder.getCorderItemList())
                        cOrderItem.setCorderId(cOrder);
                    daocorder.save(cOrder);
                }

                for (SupportiveCrew supportiveCrew : distribute.getSupportiveCrewList())
                    supportiveCrew.setDistributeId(distribute);



                dao.save(distribute);
                return "0";
            } catch (Exception ex) {
                return "Error Saving: " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

    //Put service for update date in database
    @PutMapping
    public String update(@RequestBody Distribute distribute) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTE");
        if(user!= null && priv.get("update")) {
            //get customer object with given nic
            Distribute distributionno = dao.getOne(distribute.getId());


            //check null of cusregno
            if (distributionno != null)
                try {
                    for (DistributeInvoice distributeInvoice : distribute.getDistributeInvoiceList())
                        distributeInvoice.setDistributeId(distribute);

                    for (SupportiveCrew supportiveCrew : distribute.getSupportiveCrewList())
                        supportiveCrew.setDistributeId(distribute);

                    dao.save(distribute);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }else {
                return "Error Updating : Distribution No Allready Registered (Distribution No Exsits)";

            }



        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Distribute distribute) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"DISTRIBUTE");
        if(user!= null && priv.get("delete")) {

            Distribute disexsits = dao.getOne(distribute.getId());

            if (disexsits == null)
                return "Error Deleting : Distribute not Exsits";

            try {
                disexsits.setDistributionstatusId(daoStatus.getOne(4));
                dao.save(disexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
