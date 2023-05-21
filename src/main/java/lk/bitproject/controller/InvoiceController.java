package lk.bitproject.controller;

import lk.bitproject.model.*;
import lk.bitproject.repository.*;
import lk.bitproject.service.EmailService;
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

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/invoice")
public class InvoiceController {

    @Autowired
    private InvoiceRepository dao;

    @Autowired
    private CustomerReposiory daocustomer;

    @Autowired
    private COrderRepository daocorder;

    @Autowired
    private COrderStatusRepository daocorderstatus;

    @Autowired
    private CustomerReturnReposiory daoreturn;

    @Autowired
    private CustomerReturnStatusRepository daoreturnstatus;

    private AuthController authority;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SMSService smsService;

    @Autowired
    private BatchRepository daoBatch;

    @Autowired
    private InvoiceStatusRepository daoStatus;

    @Autowired
    private InventoryRepository daoInventory;

    @Autowired
    private InventorystatusRepository daoInventoryStatus;

    //GET mapping for get invoice list Invoice (id, invoiceno)
    @GetMapping(value = "/list", produces = "application/json")
    public List<Invoice> invoiceList(){
        return dao.List();
    }

    //GET mapping for get invoice list Invoice (id, invoiceno, payableamount, paidamount, date)
    @GetMapping(value = "/cpaymentlist", produces = "application/json")
    public List<Invoice> cpinvoiceList(){
        return dao.cpaymentList();
    }


    // get list by customer [invoice/listbycustomer?customerid=]  //Cpayment invoicelist
    @GetMapping(value = "/listbycustomer",params = {"customerid"},produces = "application/json")
    public List<Invoice> itemListbycustomer(@RequestParam("customerid")int customerid) {
        return dao.listByCustomer(customerid);
    }

    // get list by route [invoice/listbyroute?routeid=]  //Distribute invoicelist
    @GetMapping(value = "/listbyroute",params = {"routeid"},produces = "application/json")
    public List<Invoice> invoiceListbyroute(@RequestParam("routeid")int routeid) {
        return dao.listByRoute(routeid);
    }



    //get service for get invoice with next saman number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public Invoice getNextNumber() {
        String nextnumber = dao.getNextNumber();
        Invoice inv = new Invoice(nextnumber);
        return inv;
    }

    //get service for get data from Database (/invoice/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<Invoice> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"INVOICE");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;

    }

    //get data with given parametters with searchtext (/invoice/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size", "searchtext"}, produces = "application/json")
    public Page<Invoice> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"INVOICE");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext, PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //post service for insert data into database
    @Transactional
    @PostMapping
    public String add(@Validated @RequestBody Invoice invoice) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"INVOICE");
        if(user!= null && priv.get("add")) {
          /*  System.out.println(grn);
           return "0";*/
            Invoice invno = dao.findByInvno(invoice.getInvoiceno());

            if (invno != null)
                return "Error Saving : Invoice Allready Created (Invoice Number Exsits)";

            try {
                invoice.setPaidamount(BigDecimal.valueOf(0.00));
                System.out.println(invoice);
//                StringBuffer message = new StringBuffer("No \t\t"+" Item Name \t\t\t\t\t\t\t"+ "Quantity \t\t\t"+ "Market Price \t\t\t"+ "Line Total\n");
//                int i= 1;



                for (InvoiceItem invoiceItem :invoice.getInvoiceItemList())
                {

                    //Batch Update
                    Batch orderedbatch = invoiceItem.getBatchId();
                    Batch extbatch = daoBatch.getByBatchno(orderedbatch.getBatchcode());
                    if (extbatch != null ){
//                            extbatch.setBatchqty(extbatch.getBatchqty()+invoiceItem.getDeliveredqty());
                        extbatch.setAvalableqty(extbatch.getAvalableqty()-invoiceItem.getDeliveredqty());
                        Batch savedbatch = daoBatch.saveAndFlush(extbatch);
                        invoiceItem.setBatchId(savedbatch);

                    }

                    // Inventory update
                    Inventory orderediteminventory = daoInventory.getByItemId(invoiceItem.getItemId().getId());

                    if(orderediteminventory != null){
                        orderediteminventory.setAvailableqty(orderediteminventory.getAvailableqty()-invoiceItem.getDeliveredqty());
                        if(orderediteminventory.getAvailableqty() > orderediteminventory.getItemId().getRop() )
                            orderediteminventory.setInventorystatusId(daoInventoryStatus.getOne(3));
                        else
                            orderediteminventory.setInventorystatusId(daoInventoryStatus.getOne(1));
                        daoInventory.save(orderediteminventory);
                    }else{
                        return "Error Saving : "+invoiceItem.getItemId().getItemname()+" Not Available";
                    }
                    invoiceItem.setInvoiceId(invoice);

//                    message.append(i).append("\t\t")
//                            .append(invoiceItem.getItemId().getItemname()).append("\t\t\t\t")
//                            .append(invoiceItem.getDeliveredqty()).append("\t\t\t\t")
//                            .append(invoiceItem.getMprice()).append("\t\t\t\t")
//                            .append(invoiceItem.getLinetotal()).append("\n");
//
//                    i++;




//                    SMS sms = new SMS();
////                sms.setTo("+94702135621");
//                sms.setTo("+94"+invoice.getCustomerId().getCmobile().substring(1));
//                sms.setMessage("Your Invoice is Ready....!" +
//                        "\n\n Invoice No : " +invoice.getInvoiceno()+
//                        "\n Invoice Date :"+invoice.getDate()+
//                        "\n Customer Id : " +invoice.getCustomerId().getRegno()+
//                        "\n Customer Name : " +invoice.getCustomerId().getCname()+
//                        "\n Grand Total (Rs) : " +invoice.getGrandtotal()+
//                        "\n Discount Ratio (%) : " +invoice.getDiscountedratio()+
//                        "\n Net Total (Rs) : " +invoice.getNettotal()+
//                        "\n Amount Payable (Rs) : " +invoice.getPayableamount()+
//                        "\n\n You will Recieve your order within 24 hours" +
//                "\n\n Kaushalya Distributors");
//
//                    smsService.send(sms);
                }

                // chanage order status
                if(invoice.getCorderId() != null){
                    //save customer
                    Customer customer1 = daocustomer.getOne(invoice.getCorderId().getCustomerId().getId());
//                    customer.setPoint(customer.getPoint() + invoice.getCustomerId().getPoint());
                    customer1.setTobepaid(customer1.getTobepaid().add(invoice.getPayableamount()));
                    daocustomer.save(customer1);

                    COrder cOrder = daocorder.getOne(invoice.getCorderId().getId());
                    cOrder.setCorderstatusId(daocorderstatus.getOne(2));
                    for (COrderItem cOrderItem : cOrder.getCorderItemList())
                        cOrderItem.setCorderId(cOrder);
                    daocorder.save(cOrder);
                }else {
                    //save customer
                    Customer customer = daocustomer.getOne(invoice.getCustomerId().getId());
//                    customer.setPoint(customer.getPoint() + invoice.getCustomerId().getPoint());
                    customer.setTobepaid(customer.getTobepaid().add(invoice.getPayableamount()));
                    daocustomer.save(customer);
                }

                // chanage return status
                if(invoice.getCustomerreturnId() != null){
                    CustomerReturn customerReturn = daoreturn.getOne(invoice.getCustomerreturnId().getId());
                    customerReturn.setCustomerreturnstatusId(daoreturnstatus.getOne(2));
                    for (CustomerReturnItem customerReturnItem : customerReturn.getCustomerReturnItemList())
                        customerReturnItem.setCustomerreturnId(customerReturn);
                    daoreturn.save(customerReturn);
                }

                dao.save(invoice);

//                emailService.sendMail("malkidilsha9@gmail.com",
//                        "Your Order is Ready",
//                        "Invoice Number : "+invoice.getInvoiceno()+"\n Item Detail : \n\n" +message+ "\n\n Grand Total : " + invoice.getGrandtotal() + "\n Discounted Ratio : " +invoice.getDiscountedratio() + "\n Net Total : " + invoice.getNettotal() + "\n\n Kaushalya Distributors");

                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";
    }

    //Put service for update date in database
    @PutMapping
    public String update(@Validated @RequestBody Invoice invoice) {
        //get authentincate object with login user --> not permisson the auth -- null
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        //check login user has permission for insert data into database
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"INVOICE");
        if(user!= null && priv.get("update")) {
            //get supplier object with given nic
            Invoice inv = dao.getOne(invoice.getId());

            //check null of cusregno
            if (inv != null)
                try {
                    for (InvoiceItem invoiceItem :invoice.getInvoiceItemList())
                        invoiceItem.setInvoiceId(invoice);
                    dao.save(invoice);
                    return "0";
                } catch (Exception ex) {
                    return "Error Updating : " + ex.getMessage();
                }
            else {
                return "Error Updating : Invoice Allready Created (Invoice Number Exsits)";
            }

        } else
            return "Error Updating : You Have no Permission";

    }

    //delete service for delete data in database (no delete change status into delete)
    @DeleteMapping
    public String delete(@RequestBody Invoice invoice) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"INVOICE");
        if(user!= null && priv.get("delete")) {

            Invoice inv = dao.getOne(invoice.getId());

            if (inv != null) {

                try {
                    for (InvoiceItem invoiceItem : invoice.getInvoiceItemList()){

                        invoiceItem.setInvoiceId(invoice);
                    }



                    invoice.setInvoicestatusId(daoStatus.getOne(5));
                    dao.save(invoice);
                    return "0";
                } catch (Exception ex) {
                    return "Error Deleting : " + ex.getMessage();
                }

            } else {
                return "Error Deleting : Invoice not Exsits";
            }
        } else
            return "Error Deleting : You Have no Permission";

    }
}
