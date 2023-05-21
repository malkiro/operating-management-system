package lk.bitproject.repository;

import lk.bitproject.model.Customer;
import lk.bitproject.model.Request;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RequestReposiory extends JpaRepository<Request, Integer> {
    //Query for get request list
    @Query(value = "SELECT new Request(r.id, r.no, r.requestdetails) from Request r where r.requeststatusId.id=1")
    List<Request> activeList();

    //query for get next number
    @Query(value = "SELECT concat('REQ',lpad(substring(max(r.no),4)+1,5,'0')) FROM kaushalyadistributors.request as r;", nativeQuery = true)
    String getNextNumber();

    //get request by given reg number
    @Query(value = "select r from Request r where r.no=:no")
    Request findByNyumber(@Param("no") String no);


    //Query for get all request with given search value
    @Query(value = "select r from Request r where r.no like concat('%' ,:searchtext, '%') or " +
    "r.requeststatusId.name like concat('%',:searchtext, '%') or " +
            "r.requesteddate like concat('%',:searchtext, '%') or " +
            "r.employeeId.callingname like concat('%',:searchtext, '%') or " +
            "r.confirmdate like concat('%',:searchtext, '%')")
    Page<Request> findAll(@Param("searchtext") String searchtext, Pageable of);

}
