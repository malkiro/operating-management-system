package lk.bitproject.repository;

import lk.bitproject.model.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

    //Query for get batch object by given batch code
    @Query(value = "SELECT i FROM Inventory i where i.itemId.id=:itemid")
    Inventory getByItemId(@Param("itemid") Integer itemid);

    //Query for get corder list with id, cono, customerId and discountedratio (active)
    @Query(value = "SELECT new Inventory(i.id, i.itemId, i.availableqty) from Inventory i where i.inventorystatusId.id=1")
    List<Inventory> activeList();

    //Query for get all customer with given search value
    @Query(value = "select i from Inventory i where i.itemId.itemname like concat('%' ,:searchtext, '%') or " +
            "i.totalqty like concat('%',:searchtext, '%') or " +
            "i.availableqty like concat('%',:searchtext, '%') or " +
            "i.inventorystatusId.name like concat('%',:searchtext, '%') or " +
            "i.itemId.rop like concat('%',:searchtext, '%') or " +
            "i.itemId.roq like concat('%',:searchtext, '%')")
    Page<Inventory> findAll(@Param("searchtext") String searchtext, Pageable of);
}
