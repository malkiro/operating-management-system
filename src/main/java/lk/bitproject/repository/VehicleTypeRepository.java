package lk.bitproject.repository;

import lk.bitproject.model.VehicleStatus;
import lk.bitproject.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleTypeRepository extends JpaRepository<VehicleType, Integer> {
}
