package lk.bitproject.controller;

import lk.bitproject.model.COrderStatus;
import lk.bitproject.model.CPMethod;
import lk.bitproject.repository.COrderStatusRepository;
import lk.bitproject.repository.CPMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/cpmethod")
public class CPMethodController {
    @Autowired
    private CPMethodRepository dao;


    @GetMapping(value = "/list", produces = "application/json")
    public List<CPMethod> cpMethodList(){
        return dao.findAll();
}
}