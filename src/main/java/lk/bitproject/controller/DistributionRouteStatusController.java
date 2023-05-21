package lk.bitproject.controller;

import lk.bitproject.model.DistributionRouteStatus;
import lk.bitproject.repository.DistributionRouteStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/distributionroutestatus")
public class DistributionRouteStatusController {
    @Autowired
    private DistributionRouteStatusRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<DistributionRouteStatus> distributionRouteStatusList(){
        return dao.findAll();
    }
}
