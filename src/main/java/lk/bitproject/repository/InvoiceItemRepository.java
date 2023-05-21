package lk.bitproject.repository;

import lk.bitproject.model.InvoiceItem;
import lk.bitproject.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem,Integer> {

}
