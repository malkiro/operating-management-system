package lk.bitproject.controller;

import lk.bitproject.model.VehicleStatus;
import lk.bitproject.model.VehicleType;
import lk.bitproject.repository.VehicleStatusRepository;
import lk.bitproject.repository.VehicleTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/vehicletype")
public class VehicleTypeController {
    @Autowired
    private VehicleTypeRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<VehicleType> vehicleTypeList(){
        return dao.findAll();
    }
}
