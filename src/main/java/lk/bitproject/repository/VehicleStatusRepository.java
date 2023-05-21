package lk.bitproject.repository;

import lk.bitproject.model.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleStatusRepository extends JpaRepository<VehicleStatus, Integer> {
}
