package lk.bitproject.controller;

import lk.bitproject.model.GrnStatus;
import lk.bitproject.model.InvoiceStatus;
import lk.bitproject.repository.GrnStatusRepository;
import lk.bitproject.repository.InventorystatusRepository;
import lk.bitproject.repository.InvoiceStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/invoicestatus")
public class InvoiceStatusController {
    @Autowired
    private InvoiceStatusRepository dao;


    @GetMapping(value = "/list", produces = "application/json")
    public List<InvoiceStatus> invoiceStatusList(){
        return dao.findAll();
}
}