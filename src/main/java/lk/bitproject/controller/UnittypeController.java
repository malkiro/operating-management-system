package lk.bitproject.controller;

import lk.bitproject.model.Unittype;
import lk.bitproject.repository.CStatusRepository;
import lk.bitproject.repository.UnittypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/unittype")
public class UnittypeController {
    @Autowired
    private UnittypeRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Unittype> unittypeList(){
        return dao.findAll();
    }
}
