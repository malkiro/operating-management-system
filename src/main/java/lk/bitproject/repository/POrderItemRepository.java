package lk.bitproject.repository;

import lk.bitproject.model.Item;
import lk.bitproject.model.POrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface POrderItemRepository extends JpaRepository<POrderItem,Integer> {


    //Query for get all by given porder id  //Grn porderitemlist
    @Query(value = "select poi from  POrderItem poi where poi.porderId.id=:porderid and poi.itemId.id=:itemid")
    POrderItem ByPOrderItem(@Param("itemid") Integer itemid, @Param("porderid") Integer porderid);
}
