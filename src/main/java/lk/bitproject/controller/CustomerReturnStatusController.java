package lk.bitproject.controller;



import lk.bitproject.model.CStatus;
import lk.bitproject.model.CustomerReturnStatus;
import lk.bitproject.repository.CStatusRepository;
import lk.bitproject.repository.CustomerReturnStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/customerreturnstatus")
public class CustomerReturnStatusController {
    @Autowired
    private CustomerReturnStatusRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<CustomerReturnStatus> customerReturnStatusList(){
        return dao.findAll();
}
}
