package lk.bitproject.controller;

import lk.bitproject.model.CType;
import lk.bitproject.repository.CTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/ctype")

public class CTypeController {
    @Autowired
    private CTypeRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<CType> ctypeList(){
        return dao.findAll();
    }
}
