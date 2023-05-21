package lk.bitproject.repository;

import lk.bitproject.model.COrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface COrderItemRepository extends JpaRepository<COrderItem,Integer> {

    //Query for get all by given corder id  //Invoice corderitemlist
    @Query(value = "select coitem from COrderItem coitem where coitem.corderId.id=:corderid and coitem.itemId.id=:itemid")
    COrderItem byCorderItem(@Param("corderid") Integer corderid, @Param("itemid") Integer itemid);
}
