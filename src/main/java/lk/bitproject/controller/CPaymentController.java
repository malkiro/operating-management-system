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
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/cpayment")
public class CPaymentController {

    @Autowired
    private CPaymentRepository dao;

    @Autowired
    private CustomerReposiory daocustomer;

    @Autowired
    private InvoiceRepository daoinvoice;

    @Autowired
    private InvoiceStatusRepository daoinvoicestatus;

    @Autowired
    private DistributeRepository daodistribute;

    @Autowired
    private DistributionStatusRepository daodistributestatus;

    @Autowired
    private COrderRepository daocorder;

    @Autowired
    private COrderStatusRepository daocorderstatus;

    private AuthController authority;

    @Autowired
    private UserService userService;

//    @Autowired
//    private EmailService emailService;

    @Autowired
    private SMSService smsService;

    @Autowired
    private CPaymentstatusRepository daoStatus;

    //get service for get cpayment with next reg number
    @GetMapping(value = "/nextnumber", produces = "application/json")
    public CPayment getNextNumber() {
        String nextnumber = dao.getNextNumber();
        CPayment cpay = new CPayment(nextnumber);
        return cpay;
    }

    ///get service for get data from Database (/cpayment/findAll?page=0&size=3)
    @GetMapping(value = "/findAll", params = {"page", "size"}, produces = "application/json")
    public Page<CPayment> findAll(@RequestParam("page") int page, @RequestParam("size") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CPAYMENT");
        if(user!= null && priv.get("select"))
            return dao.findAll(PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }

    //get data with given parametters with searchtext (/cpayment/findAll?page=0&size=3&searchtext=yyy)
    @GetMapping(value = "/findAll", params = {"page", "size","searchtext"}, produces = "application/json")
    public Page<CPayment> findAll(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("searchtext") String searchtext) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CPAYMENT");
        if(user!= null && priv.get("select"))
            return dao.findAll(searchtext,PageRequest.of(page, size, Sort.Direction.DESC, "id"));
        else
            return null;
    }



    //post service for insert data ino database
    @Transactional
    @PostMapping
    public String add(@RequestBody CPayment cpayment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CPAYMENT");
        if(user!= null && priv.get("add")) {
            CPayment cpaybillno = dao.findByBillno(cpayment.getCbillno());
            if (cpaybillno != null)
                return "Error Saving : Customer Payment Allready Paid (Bill No Number Exsits)";

            try {
                System.out.println(cpayment);
//                SMS sms = new SMS();
////                sms.setTo("+94702135621");
//                sms.setTo("+94"+cpayment.getCustomerId().getCmobile().substring(1));
//                sms.setMessage("Your Payment has been SuccessFully Completed.....!" +
//                        "\n\n Reciept No : " +cpayment.getCbillno()+
//                        "\n Recieved Date :"+cpayment.getRecieveddate()+
//                        "\n Customer Id : " +cpayment.getCustomerId().getRegno()+
//                        "\n Customer Name : " +cpayment.getCustomerId().getCname()+
//                        "\n Previous Arrears (Rs) : " +cpayment.getOldbalance()+
//                        "\n Recieved Amount (Rs) : " +cpayment.getTotalamount()+
//                        "\n New Arrears (Rs) : " +cpayment.getNewbalance()+
//                        "\n\n Thank you for your Payment" +
//                "\n\n Kaushalya Distributors");
//
//                    smsService.send(sms);



//                StringBuffer message = new StringBuffer("No \t\t"+" Invoice Number \t\t\t"+ "Invoice Date \t\t\t"+ "Invoice Amount \t\t\t"+ "Outstanding  \t\t\t"+ "Applying Amount \n");
//                int i= 1;

                for (CPaymentInvoice cPaymentInvoice :cpayment.getCpaymentInvoiceList()) {
                    cPaymentInvoice.setCpaymentId(cpayment);

//                   invoice paidamount
//                  change invoice status into delivered or comlpete
                    Invoice invoice = daoinvoice.getOne(cPaymentInvoice.getInvoiceId().getId());
                    invoice.setPaidamount(invoice.getPaidamount().add(cPaymentInvoice.getApplingamount()));
                    if(invoice.getPaidamount().equals(invoice.getPayableamount())){
                        invoice.setInvoicestatusId(daoinvoicestatus.getOne(6));
                    } else {
                        invoice.setInvoicestatusId(daoinvoicestatus.getOne(3));

                        Distribute distribute = daodistribute.byInvoice(invoice.getId());
                        Boolean deliverd = true;
                        for(DistributeInvoice dinl : distribute.getDistributeInvoiceList()){
                            dinl.setDistributeId(distribute);
                            if(dinl.getInvoiceId().getInvoicestatusId().getName().equals("In-Delivery")){
                                deliverd = false;
                            }
                        }
                        if(deliverd==true){
                            distribute.setDistributionstatusId(daodistributestatus.getOne(2));

                            for (SupportiveCrew supportiveCrew : distribute.getSupportiveCrewList())
                                supportiveCrew.setDistributeId(distribute);

                            daodistribute.save(distribute);
                        }
                    }
                    for (InvoiceItem invoiceItem :invoice.getInvoiceItemList())
                        invoiceItem.setInvoiceId(invoice);
                    daoinvoice.save(invoice);


//                  change corder status into delivered or comlpete
                    if(invoice.getCorderId() != null){
                        COrder cOrder = daocorder.getOne(invoice.getCorderId().getId());
                        if(invoice.getPaidamount().equals(invoice.getPayableamount())){
                            cOrder.setCorderstatusId(daocorderstatus.getOne(5));
                        } else {
                            cOrder.setCorderstatusId(daocorderstatus.getOne(4));
                        }
                        for (COrderItem cOrderItem :cOrder.getCorderItemList())
                            cOrderItem.setCorderId(cOrder);
                        daocorder.save(cOrder);
                    }

//                    message.append(i).append("\t\t")
//                            .append(cPaymentInvoice.getInvoiceId().getInvoiceno()).append("\t\t\t\t")
//                            .append(cPaymentInvoice.getInvoiceId().getDate()).append("\t\t\t\t")
//                            .append(cPaymentInvoice.getInvoiceId().getPayableamount()).append("\t\t\t\t")
//                            .append(cPaymentInvoice.getOutstanding()).append("\t\t\t\t")
//                            .append(cPaymentInvoice.getApplingamount()).append("\n");
//
//                    i++;
                }

                for (CPaymentMethod cPaymentMethod : cpayment.getCpaymentMethodList())
                    cPaymentMethod.setCpaymentId(cpayment);

//                customer tobe paid
                Customer customer = daocustomer.getOne(cpayment.getCustomerId().getId());
                customer.setTobepaid(cpayment.getNewbalance());
                daocustomer.save(customer);

                cpayment.setCbillno(getNextNumber().getCbillno());
                cpayment.setCpaymentstatusId(daoStatus.getOne(2));
                dao.save(cpayment);
//                emailService.sendMail("malkidilsha9@gmail.com",
//                        "Your Payment has been SuccessFully Completed",
//                        "Invoice Number : "+cpayment.getCbillno()+"\n Invoice Details : \n\n" +message+ "\n\n");
                return "0";
            } catch (Exception ex) {
                return "Error Saving : " + ex.getMessage();
            }

        } else
            return "Error Saving : You Have no Permission";

    }

//    //Put service for update date in database
//    @PutMapping
//    public String update(@RequestBody CPayment cpayment) {
//        //get authentincate object with login user --> not permisson the auth -- null
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        User user = userService.findUserByUserName(auth.getName());
//        //check login user has permission for insert data into database
//        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CPAYMENT");
//        if(user!= null && priv.get("update")) {
//            //get customer object with given nic
//            CPayment cpaybillno = dao.getOne(cpayment.getId());
//
//            //check null of cusregno
//            if (cpaybillno != null)
//                try {
//                    dao.save(cpayment);
//                    return "0";
//                } catch (Exception ex) {
//                    return "Error Saving: " + ex.getMessage();
//                }else {
//                return "Error : Customer Payment Allready Registered (Bill No Exsits)";
//
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
    public String delete(@RequestBody CPayment cpayment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        HashMap<String,Boolean> priv = authority.getPrivilages(user,"CPAYMENT");
        if(user!= null && priv.get("delete")) {

            CPayment cpayexsits = dao.getOne(cpayment.getId());

            if (cpayexsits == null)
                return "Error Deleting : Customer Payment not Exsits";

            try {
                cpayexsits.setCpaymentstatusId(daoStatus.getOne(4));
                dao.save(cpayexsits);
                return "0";
            } catch (Exception ex) {
                return "Error Deleting : " + ex.getMessage();
            }

        } else
            return "Error Deleting : You Have no Permission";

    }
}
