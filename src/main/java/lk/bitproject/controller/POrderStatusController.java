package lk.bitproject.controller;

import lk.bitproject.model.POrderStatus;
import lk.bitproject.repository.POrderStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/porderstatus")
public class POrderStatusController {
    @Autowired
    private POrderStatusRepository dao;


    @GetMapping(value = "/list", produces = "application/json")
    public List<POrderStatus> pOrderStatusList(){
        return dao.findAll();
}
}