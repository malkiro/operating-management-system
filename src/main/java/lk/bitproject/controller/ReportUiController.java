package lk.bitproject.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class ReportUiController {

    @RequestMapping(value = "/grnreport", method = RequestMethod.GET)
    public ModelAndView grnreport() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("ui/grnreport.html");
        return modelAndView;
    }


    @RequestMapping(value = "/salesreport", method = RequestMethod.GET)
    public ModelAndView salesreport() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("ui/salesreport.html");
        return modelAndView;
    }

    @RequestMapping(value = "/employeereport", method = RequestMethod.GET)
    public ModelAndView employeereport() {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("ui/employeereport.html");
        return modelAndView;
    }

}
