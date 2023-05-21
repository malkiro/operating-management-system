package lk.bitproject.controller;


import lk.bitproject.model.Designation;
import lk.bitproject.repository.DesignationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RequestMapping(value = "/designation")
@RestController
public class DesignationController {

    @Autowired
    private DesignationRepository dao;


    @GetMapping(value = "/list", produces = "application/json")
    public List<Designation> designations() {
        return dao.list();
    }



}
