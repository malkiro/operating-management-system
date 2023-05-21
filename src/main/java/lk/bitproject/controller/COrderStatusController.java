package lk.bitproject.controller;

import lk.bitproject.model.COrderStatus;
import lk.bitproject.repository.COrderStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/corderstatus")
public class COrderStatusController {
    @Autowired
    private COrderStatusRepository dao;


    @GetMapping(value = "/list", produces = "application/json")
    public List<COrderStatus> pOrderStatusList(){
        return dao.findAll();
}
}