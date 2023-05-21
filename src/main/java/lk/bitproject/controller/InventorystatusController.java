package lk.bitproject.controller;

import lk.bitproject.model.Inventorystatus;
import lk.bitproject.model.Itemstatus;
import lk.bitproject.repository.InventorystatusRepository;
import lk.bitproject.repository.ItemstatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/inventorystatus")
public class InventorystatusController {
    @Autowired
    private InventorystatusRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Inventorystatus> inventorystatusList(){
        return dao.findAll();
    }
}
