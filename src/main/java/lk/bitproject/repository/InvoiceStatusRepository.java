package lk.bitproject.repository;

import lk.bitproject.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceStatusRepository extends JpaRepository<InvoiceStatus,Integer> {

}
