package lk.bitproject.controller;

import lk.bitproject.model.SPayamentstatus;
import lk.bitproject.repository.SPaymentstatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/spaymentstatus")
public class SPaymentstatusController {
    @Autowired
    private SPaymentstatusRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<SPayamentstatus> sPayamentstatusList(){
        return dao.findAll();
    }
}
