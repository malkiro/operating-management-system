package lk.bitproject.repository;

import lk.bitproject.model.Batch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Integer> {
    //Query for get bath list with id, batchcode,avalableqty and marketprice
    @Query(value = "SELECT new Batch(b.id, b.batchcode,b.avalableqty, b.marketprice) from Batch b")
    List<Batch> List();

    //Query for get bath list with id, batchcode, marketprice, salesprice, mnfdate, expdate and itemId
    @Query(value = "SELECT new Batch(b.id, b.batchcode,b.marketprice, b.salesprice, b.mnfdate, b.expdate, b.itemId) from Batch b")
    List<Batch> grnList();


    //Query for get bath object by given batch code //POrder purchaseprice
    @Query(value="SELECT new Batch(b.id,b.purchaseprice, b.marketprice) from Batch b where b.itemId.id=:itemid order by b.id DESC")
    List<Batch> byItem(@Param("itemid") Integer itemid);

    //Query for get all by given item id  //Invoice batchlist
    @Query(value = "select new Batch (b.id,b.batchcode,b.avalableqty,b.marketprice)from  Batch b where b.itemId.id=:itemid and b.avalableqty <> 0")
    List<Batch> listByItem(@Param("itemid") Integer itemid);



    //Query for get batch object by given batch code
    @Query(value = "SELECT b FROM Batch b where b.batchcode=:bcode")
    Batch getByBatchno(@Param("bcode") String bcode);

    //Query for get all batch with given search value
    @Query(value = "select bt from Batch bt where bt.batchcode like concat('%' ,:searchtext, '%') or " +
            "bt.itemId.itemname like concat('%',:searchtext, '%') or " +
            "bt.supplierId.sname like concat('%',:searchtext, '%') or " +
            "bt.mnfdate like concat('%',:searchtext, '%') or " +
            "bt.expdate like concat('%',:searchtext, '%') or " +
            "bt.purchaseprice like concat('%',:searchtext, '%') or " +
            "bt.marketprice like concat('%',:searchtext, '%') or " +
            "bt.salesprice like concat('%',:searchtext, '%') or " +
            "bt.batchqty like concat('%',:searchtext, '%') or " +
            "bt.avalableqty like concat('%',:searchtext, '%') or " +
            "bt.returnqty like concat('%',:searchtext, '%')")
    Page<Batch> findAll(@Param("searchtext") String searchtext, Pageable of);
}
