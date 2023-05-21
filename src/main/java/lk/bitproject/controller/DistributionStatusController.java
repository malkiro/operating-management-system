package lk.bitproject.controller;

import lk.bitproject.model.DistributionStatus;
import lk.bitproject.repository.DistributionStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/distributionstatus")
public class DistributionStatusController {

    @Autowired
    private DistributionStatusRepository dao;


    @GetMapping(value = "/list", produces = "application/json")
    public List<DistributionStatus> distributionStatusList(){
        return dao.findAll();
    }
}