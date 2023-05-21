package lk.bitproject.controller;


import lk.bitproject.model.Brand;
import lk.bitproject.model.Gender;
import lk.bitproject.repository.GenderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping(value = "/gender")
@RestController
public class GenderController {

    @Autowired
    private GenderRepository dao;

    @RequestMapping(value = "/list", method = RequestMethod.GET, produces = "application/json")
    public List<Gender> gender() {
        return dao.list();
    }



}
