package lk.bitproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Driver;
import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name= "distribute")
public class Distribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "distributionno")
    @Basic (optional = false)
    private String distributionno;

    @Column(name = "totalinvoice")
    @Basic (optional = false)
    private Integer totalinvoice;

    @Column(name = "description")
    private String description;

    @Column(name = "addeddate")
    @Basic (optional = false)
    private LocalDate addeddate;

    @Column(name = "distributiondate")
    @Basic (optional = false)
    private LocalDate distributiondate;




    @JoinColumn(name = "distributionstatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private DistributionStatus distributionstatusId;

    @JoinColumn(name = "vehicle_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Vehicle vehicleId;

    @JoinColumn(name = "distributionroute_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private DistributionRoute distributionrouteId;

    @JoinColumn(name = "driver_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee driverId;

    @JoinColumn(name = "deliveryagent_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee deliveryagentId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "distributeId", orphanRemoval = true)
    private List<DistributeInvoice> distributeInvoiceList;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "distributeId", orphanRemoval = true)
    private List<SupportiveCrew> supportiveCrewList;

    public Distribute(String number){
        this.distributionno = number;
    }

    public Distribute(Integer id, String distributionno, DistributionRoute distributionrouteId, Integer totalinvoice) {
        this.id = id;
        this.distributionno = distributionno;
        this.distributionrouteId = distributionrouteId;
        this.totalinvoice = totalinvoice;
    }

}