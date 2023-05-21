package lk.bitproject.controller;

import lk.bitproject.model.User;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class UIController {

    @Autowired
    private UserService userService;

    @RequestMapping(value = "/access-denied", method = RequestMethod.GET)
    public ModelAndView error(){
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("error.html");
        return modelAndView;
    }

    @RequestMapping(value = "/config", method = RequestMethod.GET)
    public ModelAndView config(){
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("config.html");
        return modelAndView;
    }

    @GetMapping(value = "/employee")
    public ModelAndView employeeui() {
        ModelAndView modelAndView = new ModelAndView();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        if(user!= null){
            System.out.println("123654");
            modelAndView.setViewName("employee.html");
        }
        else
            modelAndView.setViewName("error.html");

        return modelAndView;
    }

    @GetMapping(value = "/privilage")
    public ModelAndView privilageui() {
        ModelAndView modelAndView = new ModelAndView();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByUserName(auth.getName());
        if(user!= null){
            System.out.println("123654");
            modelAndView.setViewName("privilage.html");
        }
        else
            modelAndView.setViewName("error.html");

        return modelAndView;
    }




    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public ModelAndView user() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("user.html");
        return modelAndView;
    }

    @RequestMapping(value = "/customer", method = RequestMethod.GET)
    public ModelAndView customerUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("customer.html");
        return modelAndView;
    }

    @RequestMapping(value = "/item", method = RequestMethod.GET)
    public ModelAndView itemUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("item.html");
        return modelAndView;
    }

    @RequestMapping(value = "/supplier", method = RequestMethod.GET)
    public ModelAndView supplierUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("supplier.html");
        return modelAndView;
    }

    @RequestMapping(value = "/porder", method = RequestMethod.GET)
    public ModelAndView porderUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("porder.html");
        return modelAndView;
    }

    @RequestMapping(value = "/grn", method = RequestMethod.GET)
    public ModelAndView grnUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("grn.html");
        return modelAndView;
    }

    @RequestMapping(value = "/inventory", method = RequestMethod.GET)
    public ModelAndView inventoryUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("inventory.html");
        return modelAndView;
    }

    @RequestMapping(value = "/batch", method = RequestMethod.GET)
    public ModelAndView batchUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("batch.html");
        return modelAndView;
    }

    @RequestMapping(value = "/spayment", method = RequestMethod.GET)
    public ModelAndView spaymentUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("spayment.html");
        return modelAndView;
    }

    @RequestMapping(value = "/corder", method = RequestMethod.GET)
    public ModelAndView corderUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("corder.html");
        return modelAndView;
    }

    @RequestMapping(value = "/invoice", method = RequestMethod.GET)
    public ModelAndView invoiceUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("invoice.html");
        return modelAndView;
    }

    @RequestMapping(value = "/cpayment", method = RequestMethod.GET)
    public ModelAndView cpaymentUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("cpayment.html");
        return modelAndView;
    }

    @RequestMapping(value = "/distribute", method = RequestMethod.GET)
    public ModelAndView distributeUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("distribute.html");
        return modelAndView;
    }

    @RequestMapping(value = "/vehicle", method = RequestMethod.GET)
    public ModelAndView vehicleUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("vehicle.html");
        return modelAndView;
    }

    @RequestMapping(value = "/route", method = RequestMethod.GET)
    public ModelAndView routeUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("route.html");
        return modelAndView;
    }

    @RequestMapping(value = "/brand", method = RequestMethod.GET)
    public ModelAndView brandUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("brand.html");
        return modelAndView;
    }

    @RequestMapping(value = "/category", method = RequestMethod.GET)
    public ModelAndView categoryUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("category.html");
        return modelAndView;
    }

    @RequestMapping(value = "/creturn", method = RequestMethod.GET)
    public ModelAndView creturnUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("creturn.html");
        return modelAndView;
    }

    @RequestMapping(value = "/customerpoint", method = RequestMethod.GET)
    public ModelAndView customerpointUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("customerpoint.html");
        return modelAndView;
    }

    @RequestMapping(value = "/request", method = RequestMethod.GET)
    public ModelAndView requestUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("request.html");
        return modelAndView;
    }

    @RequestMapping(value = "/modification", method = RequestMethod.GET)
    public ModelAndView modificationUI() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("hello.html");
        return modelAndView;
    }
}
