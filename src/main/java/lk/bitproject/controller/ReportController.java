package lk.bitproject.controller;

import lk.bitproject.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Date;
import java.time.LocalDate;
import java.util.AbstractList;
import java.util.ArrayList;
import java.util.List;

@RestController
public class ReportController {

    @Autowired
    private ReportRepository dao;

    @RequestMapping(value = "/salesreport", params = {"sdate","edate"}, produces = "application/json")
    public List getSalesReport(@RequestParam("sdate")Date sdate, @RequestParam("edate")Date edate){
        return  dao.getSalesReport(sdate, edate);
    }

    @RequestMapping(value = "/grnreport", params = {"sdate","edate"}, produces = "application/json")
    public List getGrnReport(@RequestParam("sdate")Date sdate, @RequestParam("edate")Date edate){
        return  dao.getGrnReport(sdate, edate);
    }
}
