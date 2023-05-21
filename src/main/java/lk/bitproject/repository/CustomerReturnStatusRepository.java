package lk.bitproject.repository;

import lk.bitproject.model.CStatus;
import lk.bitproject.model.CustomerReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerReturnStatusRepository extends JpaRepository<CustomerReturnStatus, Integer> {
}
