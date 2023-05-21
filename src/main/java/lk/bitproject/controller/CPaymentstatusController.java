package lk.bitproject.controller;

import lk.bitproject.model.CPayamentstatus;
import lk.bitproject.repository.CPaymentstatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/cpaymentstatus")
public class CPaymentstatusController {
    @Autowired
    private CPaymentstatusRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<CPayamentstatus> cPayamentstatusList(){
        return dao.findAll();
    }
}
