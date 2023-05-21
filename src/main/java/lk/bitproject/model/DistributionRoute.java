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
@Table(name= "distributionroute")
public class DistributionRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "routeno")
    @Basic (optional = false)
    private String routeno;

    @Column(name = "routename")
    @Basic (optional = false)
    private String routename;

    @Column(name = "date")
    @Basic (optional = false)
    private String date;

    @JoinColumn(name = "distributionroutestatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private DistributionRouteStatus distributionroutestatusId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    public DistributionRoute(String number){
        this.routeno = number;
    }

    public DistributionRoute(Integer id, String routename){
        this.id = id;
        this.routename = routename;
    }
}
