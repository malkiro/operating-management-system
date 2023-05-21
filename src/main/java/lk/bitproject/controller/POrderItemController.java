package lk.bitproject.controller;


import lk.bitproject.model.POrder;
import lk.bitproject.model.POrderItem;
import lk.bitproject.model.User;
import lk.bitproject.repository.POrderItemRepository;
import lk.bitproject.repository.POrderRepository;
import lk.bitproject.repository.POrderStatusRepository;
import lk.bitproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping(value = "/porderitem")
public class POrderItemController {

    @Autowired
    private POrderItemRepository dao;

    // get list by category [porderitem/bypoitem?itemid=&porderid=]
    @GetMapping(value = "/bypoitem",params = {"itemid","porderid"},produces = "application/json")
    public POrderItem poitembypoitem(@RequestParam("itemid")int itemid, @RequestParam("porderid")int porderid) {
        return dao.ByPOrderItem(itemid, porderid);
    }


}
