package lk.bitproject.repository;

import lk.bitproject.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item , Integer> {
//    //Query for get item list with id and name
//    @Query(value = "SELECT new Item(i.id, i.itemname) from Item i")
//    List<Item> List();

    //Query for get supplier list with id and name (active)
    @Query(value = "SELECT new Item(i.id, i.itemname) from Item i where i.itemstatusId.id=1")
    List<Item> activeList();


    //Query for get all by given porder id  //Porder porderitemlist
    @Query(value = "select new Item (i.id,i.itemname,i.roq,i.subcategoryId)from  Item i where i in(select s.itemId from Supply s where s.supplierId.id=:supplierid)")
    List<Item> listBySupplier(@Param("supplierid") Integer supplierid);

    //Query for get all by given category id  //Porder categoryitemlist
    @Query(value = "select new Item (i.id,i.itemname,i.roq,i.subcategoryId)from  Item i where i in(select s.itemId from Supply s where s.supplierId.id=:supplierid) and i.subcategoryId.categoryId.id=:categoryid and i.itemstatusId.id=1")
    List<Item> listBySupplierCategory(@Param("supplierid") Integer supplierid,@Param("categoryid") Integer categoryid);

    //Query for get all by given porder id  //Grn grnitemlist
    @Query(value = "select new Item (i.id,i.itemname)from  Item i where i in(select p.itemId from POrderItem p where p.porderId.id=:porderid)")
    List<Item> listByPorder(@Param("porderid") Integer porderid);

    //Query for get all by given category id  //Grn categoryitemlist
    @Query(value = "select new Item (i.id,i.itemname)from  Item i where i in(select p.itemId from POrderItem p where p.porderId.id=:porderid) and i.subcategoryId.categoryId.id=:categoryid and i.itemstatusId.id=1")
    List<Item> listByPorderCategory(@Param("porderid") Integer porderid,@Param("categoryid") Integer categoryid);

    //Query for get all by given corder id  //Invoice corderitemlist
    @Query(value = "select new Item (i.id,i.itemname)from  Item i where i in(select c.itemId from COrderItem c where c.corderId.id=:corderid)")
    List<Item> listByCorder(@Param("corderid") Integer corderid);


    //get item by given reg number
    @Query(value = "select i from Item i where i.itemcode=:itemcode and i.itemstatusId.id=1")
    Item findByCode(@Param("itemcode") String code);

    //get item by given itemname number
    @Query(value = "select i from Item i where i.itemname=:itemname and i.itemstatusId.id=1")
    Item findByName(@Param("itemname") String itemname);


    //Query for get all item with given search value
    @Query(value = "select i from Item i where i.itemcode like concat('%' ,:searchtext, '%') or " +
            "i.brandId.categoryId.name like concat('%',:searchtext, '%') or " +
            "i.brandId.name like concat('%',:searchtext, '%') or" +
            " i.subcategoryId.name like concat('%',:searchtext, '%') or " +
            "i.itemname like concat('%',:searchtext, '%') or " +
            "i.unittypeId.name like concat('%',:searchtext, '%') or " +
            "i.itemsize like concat('%',:searchtext, '%') or " +
            "i.rop like concat('%',:searchtext, '%') or " +
            "i.roq like concat('%',:searchtext, '%') or " +
            "i.itemstatusId.name like concat('%',:searchtext, '%') or " +
            "i.date like concat('%',:searchtext, '%') or " +
            " i.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<Item> findAll(@Param("searchtext") String searchtext, Pageable of);
}
