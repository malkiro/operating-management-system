package lk.bitproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name= "vehicle")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "brand")
    @Basic(optional = false)
    private String brand;

    @Column(name = "model")
    @Basic(optional = false)
    private String model;

    @Column(name = "modelyear")
    @Basic(optional = false)
    private String modelyear;

    @Column(name = "vehiclename")
    @Basic(optional = false)
    private String vehiclename;

    @Column(name = "vehicleno")
    @Basic(optional = false)
    private String vehicleno;

    @Column(name = "description")
    private String description;

    @Column(name = "photo")
    private byte[] photo;

    @Column(name = "date")
    @Basic(optional = false)
    private String date;

    @JoinColumn(name = "vehicletype_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private VehicleType vehicletypeId;

    @JoinColumn(name = "vehiclestatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private VehicleStatus vehiclestatusId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    public Vehicle(Integer id, String vehiclename, VehicleType vehicletypeId){
        this.id = id;
        this.vehiclename = vehiclename;
        this.vehicletypeId = vehicletypeId;
    }

}
