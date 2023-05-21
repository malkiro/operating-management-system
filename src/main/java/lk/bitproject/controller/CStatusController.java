package lk.bitproject.controller;



import lk.bitproject.model.CStatus;
import lk.bitproject.repository.CStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/cstatus")
public class CStatusController {
    @Autowired
    private CStatusRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<CStatus> cstatusList(){
        return dao.findAll();
}
}
