package lk.bitproject.repository;

import lk.bitproject.model.Subcategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubcategoryRepository extends JpaRepository<Subcategory , Integer> {
    //Query for get all by given category id
    @Query(value = "select s from  Subcategory s where s.categoryId.id=:categoryid")
    List<Subcategory> findAllByCategory(@Param("categoryid") Integer categoryid);



    //get item by given itemname number
    @Query(value = "select s from Subcategory s where s.name=:name")
    Subcategory findByName(@Param("name") String name);

        //Query for get all subcategory with given search value
    @Query(value = "select s from Subcategory s where s.name like concat('%' ,:searchtext, '%') or " +
            "s.categoryId.name like concat('%',:searchtext, '%')")
    Page<Subcategory> findAll(@Param("searchtext") String searchtext, Pageable of);
}
