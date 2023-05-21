package lk.bitproject.controller;

import lk.bitproject.model.SPayamentmethod;
import lk.bitproject.repository.SPaymentmethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/spaymentmethod")
public class SPaymentmethodController {
    @Autowired
    private SPaymentmethodRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<SPayamentmethod> sPayamentmethodList(){
        return dao.findAll();
    }
}
