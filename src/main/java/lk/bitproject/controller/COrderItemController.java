package lk.bitproject.controller;

import lk.bitproject.model.COrder;
import lk.bitproject.model.COrderItem;
import lk.bitproject.model.User;
import lk.bitproject.repository.COrderItemRepository;
import lk.bitproject.repository.COrderRepository;
import lk.bitproject.repository.COrderStatusRepository;
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
@RequestMapping(value = "/corderitem")
public class COrderItemController {

    @Autowired
    private COrderItemRepository dao;


    @GetMapping(value = "/bycorderitem",params = {"corderid","itemid"}, produces = "application/json")
    public COrderItem cOrderitemListcoitem(@RequestParam("corderid")int corderid, @RequestParam("itemid")int itemid){
        return dao.byCorderItem(corderid,itemid);
    }


}
