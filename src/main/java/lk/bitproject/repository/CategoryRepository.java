package lk.bitproject.repository;

import lk.bitproject.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Locale;

public interface CategoryRepository extends JpaRepository<Category , Integer> {

    @Query(value = "select c from Category  c where c in(select s.itemId.subcategoryId.categoryId from Supply s where s.supplierId.id=:supplierid)")
    List<Category> listBysupplier(@Param("supplierid")Integer supplierid);

    @Query(value = "select c from Category  c where c in(select p.itemId.subcategoryId.categoryId from POrderItem p where p.porderId.id=:porderid)")
    List<Category> listByporder(@Param("porderid")Integer porderid);



    //get item by given itemname number
    @Query(value = "select c from Category c where c.name=:name")
    Category findByName(@Param("name") String name);

    //Query for get all category with given search value
    @Query(value = "select c from Category c where c.name like concat('%' ,:searchtext, '%')")
    Page<Category> findAll(@Param("searchtext") String searchtext, Pageable of);
}
