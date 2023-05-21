package lk.bitproject.controller;


import lk.bitproject.model.Role;
import lk.bitproject.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping(value = "/role")
@RestController
public class RoleController {

    @Autowired
    private RoleRepository dao;

    @GetMapping(value = "/list", produces = "application/json")
    public List<Role> gender() {
        return dao.list();
    }


}
