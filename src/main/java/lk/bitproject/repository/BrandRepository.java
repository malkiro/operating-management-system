package lk.bitproject.repository;

import lk.bitproject.model.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand , Integer> {

    //Query for get all by given category id
    @Query(value = "select b from  Brand b where b.categoryId.id=:categoryid")
    List<Brand> findAllByCategory(@Param("categoryid") Integer categoryid);

    //get item by given itemname number
    @Query(value = "select b from Brand b where b.name=:name")
    Brand findByName(@Param("name") String name);

    //Query for get all brand with given search value
    @Query(value = "select b from Brand b where b.name like concat('%' ,:searchtext, '%') or " +
            "b.addeddate like concat('%',:searchtext, '%') or " +
            "b.categoryId.name like concat('%',:searchtext, '%') or " +
            "b.employeeId.callingname like concat('%',:searchtext, '%')")
    Page<Brand> findAll(@Param("searchtext") String searchtext, Pageable of);
}
