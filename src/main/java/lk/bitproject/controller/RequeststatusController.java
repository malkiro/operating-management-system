package lk.bitproject.controller;



import lk.bitproject.model.CStatus;
import lk.bitproject.model.Requeststatus;
import lk.bitproject.repository.CStatusRepository;
import lk.bitproject.repository.RequeststatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/requeststatus")
public class RequeststatusController {
    @Autowired
    private RequeststatusRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Requeststatus> requeststatusList(){
        return dao.findAll();
}
}
