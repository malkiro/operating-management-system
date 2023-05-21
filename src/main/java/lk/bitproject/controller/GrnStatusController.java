package lk.bitproject.controller;

import lk.bitproject.model.GrnStatus;
import lk.bitproject.repository.GrnStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/grnstatus")
public class GrnStatusController {
    @Autowired
    private GrnStatusRepository dao;


    @GetMapping(value = "/list", produces = "application/json")
    public List<GrnStatus> grnStatusList(){
        return dao.findAll();
}
}