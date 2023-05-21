package lk.bitproject.repository;


import lk.bitproject.model.CPaymentInvoice;
import lk.bitproject.model.POrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CPaymentInvoiceRepository extends JpaRepository<CPaymentInvoice,Integer> {

}
