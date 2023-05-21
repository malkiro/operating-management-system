package lk.bitproject.repository;

import lk.bitproject.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

public interface ReportRepository extends JpaRepository<Invoice, Integer> {

    //Sales report query
    @Query(value = "SELECT count(i.id), i.date , sum(i.nettotal) from kaushalyadistributors.invoice as i where i.date between :sdate and :edate group by i.date;", nativeQuery = true )
    List getSalesReport(@Param("sdate") Date sdate, @Param("edate") Date edate);

    //grn report query
    @Query(value = "SELECT count(g.id), g.addeddate , sum(g.nettotal) FROM kaushalyadistributors.grn as g where g.addeddate between :sdate and :edate group by g.addeddate;", nativeQuery = true )
    List getGrnReport(@Param("sdate") Date sdate, @Param("edate") Date edate);

}
