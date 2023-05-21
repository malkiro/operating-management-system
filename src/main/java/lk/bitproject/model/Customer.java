package lk.bitproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "customer")
public class Customer {

                    @Id
                    @GeneratedValue(strategy = GenerationType.IDENTITY)
                    @Basic (optional = false)
                    @Column(name = "id")
                    private Integer id;

                    @Column(name = "regno")
                    @Basic (optional = false)
                    private String regno;

                    @Column(name = "cname")
                    @Basic (optional = false)
                    private String cname;

                    @Column(name = "cmobile")
                    @Basic (optional = false)
                    private String cmobile;

                    @Column(name = "cland")
                    private String cland;

                    @Column(name = "cnic")
                    private String cnic;

                    @Column(name = "cemail")
//                     @Pattern(regexp = "'^([A-Za-z0-9_]+)@([A-Za-z]+)\\.([a-zA-Z]{2,5})$'")
                    private String cemail;

                    @Column(name = "address")
                    @Basic (optional = false)
                    private String address;

                    @Column(name = "cdescription")
                    private String cdescription;

                    @Column(name = "cpname")
                    private String cpname;

                    @Column(name = "cpmobile")
                    private String cpmobile;

                    @Column(name = "cpnic")
                    private String cpnic;

                    @Column(name = "cpemail")
                    private String cpemail;

                    @Column(name = "regdate")
                    @Basic (optional = false)
                    private LocalDate regdate;

                    @Column(name = "point")
                    private  Integer point;

                    @Column(name = "tobepaid")
                    private BigDecimal tobepaid;

                    @Column(name = "maxcreditlimt")
                    private BigDecimal maxcreditlimt;

                    @JoinColumn(name = "ctype_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = false, fetch = FetchType.EAGER)   //optional true nm null OK, lasy dammama fk wala value(1/2) eken wada karanne
                    private CType ctypeId;

                    @JoinColumn(name = "distributionroute_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = true, fetch = FetchType.EAGER)
                    private DistributionRoute distributionrouteId;

                    @JoinColumn(name = "cstatus_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = false, fetch = FetchType.EAGER)
                    private CStatus cstatusId;

                    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = false, fetch = FetchType.EAGER)
                    private  Employee employeeId;

                    public Customer(String number){
                        this.regno = number;
                    }

    public Customer(Integer id, String number, String cname, Integer point){
        this.id = id;
        this.regno = number;
        this.cname = cname;
        this.point = point;
    }

    public Customer(Integer id, String number, String cname, String cmobile, String address, String cemail, BigDecimal maxcreditlimt, Integer point, BigDecimal tobepaid, DistributionRoute distributionrouteId){
        this.id = id;
        this.regno = number;
        this.cname = cname;
        this.cmobile = cmobile;
        this.address = address;
        this.cemail = cemail;
        this.maxcreditlimt = maxcreditlimt;
        this.point = point;
        this.tobepaid = tobepaid;
        this.distributionrouteId = distributionrouteId;
    }
}
