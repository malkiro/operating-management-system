package lk.bitproject.controller;

import lk.bitproject.model.*;
import lk.bitproject.repository.*;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/grn")
public class GrnController {

    @Autowired
    private GrnRepository dao;

    @Autowired
    private ItemRepository daoItem;


    @Autowired
    private SupplierRepository daosupplier;

    private AuthController authority;

    @Autowired
    private BatchRepository daoBatch;

    @Autowired
    private UserService userService;

    @Autowired
    private GrnStatusRepository daoStatus;

    @Autowired
    private InventoryRepository daoInventory;

    @Autowired
    private InventorystatusRepository daoInventoryStatus;

    @Autowired
    private POrderRepository daoporder;

    @Autowired
    private POrderStatusRepository daoporderstatus;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Grn> grnList(){
        return dao.findAll();
    }


    //get service for get grn with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public Grn getNextNumber() {
        String nextnumber = dao.getNextNumber();
        Grn grn = new Grn(nextnumber);
        return grn;
    }

    //get service for get data from Database (/grn/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Grn> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"GRN");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;

    }

    //get data with given parametters with searchtext (/grn/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size", "searchtext"}, produces = "application/json")
    public Page<Grn> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"GRN");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext, PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //post service for insert data into database
    @PostMapping
    public String add(@Validated @RequestBody Grn grn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"GRN");
        if(user!= null && priv.get("add")) {
          /*  System.out.println(grn);
           return "0";*/
            Grn grnno = dao.findByGrnno(grn.getGrnno());

            if (grnno != null)
                  return "Error Saving : GRN Allready Ordered (POrno Number Exsits)";

                try {
                    Supplier supplier = daosupplier.getOne(grn.getPorderId().getSupplierId().getId());
                    supplier.setTobepaid(supplier.getTobepaid().add(grn.getNettotal()));
                    for (Supply supply : supplier.getSupplyList())
                        supply.setSupplierId(supplier);
                    daosupplier.save(supplier);

                    for (GrnBatch grnBatch :grn.getGrnBatchList()){
                        //Batch Update
                        Batch resivedbatch = grnBatch.getBatchId();
                        System.out.println(resivedbatch.getBatchcode());
                        Batch extbatch = daoBatch.getByBatchno(resivedbatch.getBatchcode());
                        if (extbatch != null){
                            extbatch.setBatchqty(extbatch.getBatchqty()+grnBatch.getRecievedqty());
                            extbatch.setAvalableqty(extbatch.getAvalableqty()+grnBatch.getRecievedqty());
                            Batch savedbatch = daoBatch.saveAndFlush(extbatch);
                            grnBatch.setBatchId(savedbatch);
                            grnBatch.setGrnId(grn);
                        }else {
                            //new  batch
                            resivedbatch.setAvalableqty(grnBatch.getRecievedqty());
                            resivedbatch.setBatchqty(grnBatch.getRecievedqty());
                            resivedbatch.setReturnqty(0);
                            resivedbatch.setSupplierId(daosupplier.getOne(grn.getPorderId().getSupplierId().getId()));
                            Batch savedbatch = daoBatch.saveAndFlush(resivedbatch);
                            grnBatch.setBatchId(savedbatch);
                            grnBatch.setGrnId(grn);
                        }

                        // Inventory update
                        Item recieveditem = daoItem.getOne(grnBatch.getBatchId().getItemId().getId());
                        Inventory iteminventory = daoInventory.getByItemId(grnBatch.getBatchId().getItemId().getId());
                        if(iteminventory != null){
                            iteminventory.setAvailableqty(iteminventory.getAvailableqty()+grnBatch.getRecievedqty());
                            // total quantity add
                            iteminventory.setTotalqty(iteminventory.getTotalqty()+grnBatch.getRecievedqty());
                            if(iteminventory.getAvailableqty() > recieveditem.getRop() )
                                iteminventory.setInventorystatusId(daoInventoryStatus.getOne(3));
                            else
                                iteminventory.setInventorystatusId(daoInventoryStatus.getOne(1));

                            daoInventory.save(iteminventory);
                        }else{
                            Inventory newinventory = new Inventory();
                            newinventory.setItemId(grnBatch.getBatchId().getItemId());
                            newinventory.setAvailableqty(grnBatch.getRecievedqty());
                            // total quantity add
                            newinventory.setTotalqty(grnBatch.getRecievedqty());
                            newinventory.setInventorystatusId(daoInventoryStatus.getOne(3));
                            daoInventory.save(newinventory);
                        }



                    }

                    // chanage order status
                        POrder pOrder = daoporder.getOne(grn.getPorderId().getId());
                        pOrder.setPorderstatusId(daoporderstatus.getOne(1));
                        for (POrderItem pOrderItem : pOrder.getPorderItemList())
                            pOrderItem.setPorderId(pOrder);
                        daoporder.save(pOrder);

                    grn.setGrnstatusId(daoStatus.getOne(1));
                   dao.save(grn);
                    return "0";
                } catch (Exception ex) {
                    return "Error Saving: " + ex.getMessage();
                }

        } else
            return "Error Saving : You Have no Permission";
    }

    //Put service for update date in database
    @PutMapping
    public String update(@Validated @RequestBody Grn grn) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"GRN");
        if(user!= null && priv.get("update")) {
            //get supplier object with given nic
            Grn gr = dao.getOne(grn.getId());

            //check null of cusregno
            if (gr != null)
                try {
                    for (GrnBatch grnBatch :grn.getGrnBatchList())
                        grnBatch.setGrnId(grn);

//                    for (GrnBatch grnBatch :grn.getGrnBatchList()){
//
//                        Batch resivedbatch = grnBatch.getBatchId();
//                        System.out.println(resivedbatch.getBatchcode());
//                        Batch extbatch = daoBatch.getByBatchno(resivedbatch.getBatchcode());
//                        if (extbatch != null ){
//                            extbatch.setBatchqty(extbatch.getBatchqty()+grnBatch.getRecievedqty());
//                            extbatch.setAvalableqty(extbatch.getAvalableqty()+grnBatch.getRecievedqty());
//                            Batch savedbatch = daoBatch.saveAndFlush(extbatch);
//                            grnBatch.setBatchId(savedbatch);
//                            grnBatch.setGrnId(grn);
//                        }else {
//                            //new  batch
//                            resivedbatch.setAvalableqty(grnBatch.getRecievedqty());
//                            resivedbatch.setBatchqty(grnBatch.getRecievedqty());
//                            resivedbatch.setReturnqty(0);
//                            Batch savedbatch = daoBatch.saveAndFlush(resivedbatch);
//                            grnBatch.setBatchId(savedbatch);
//                            grnBatch.setGrnId(grn);
//                        }
//                    }

                    dao.save(grn);
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
    public String delete(@RequestBody Grn grn) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"GRN");
        if(user!= null && priv.get("delete")) {

            Grn gr = dao.getOne(grn.getId());

            if (gr != null) {

                try {
                    for (GrnBatch grnBatch : grn.getGrnBatchList())
                        grnBatch.setGrnId(gr);

                    gr.setGrnstatusId(daoStatus.getOne(3));
                    dao.save(gr);
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
