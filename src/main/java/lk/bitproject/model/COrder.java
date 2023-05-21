package lk.bitproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name= "corder")
public class COrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "cono")
    @Basic(optional = false)
    private String cono;

    @Column(name = "grandtotal")
    @Basic(optional = false)
    private BigDecimal grandtotal;

    @Column(name = "discountedratio")
    @Basic(optional = false)
    private BigDecimal discountedratio;

    @Column(name = "nettotal")
    @Basic(optional = false)
    private BigDecimal nettotal;

    @Column(name = "requiredate")
    @Basic(optional = false)
    private LocalDate requiredate;

    @Column(name = "description")
    private String description;

    @Column(name = "date")
    @Basic(optional = false)
    private LocalDate date;

    @JoinColumn(name = "corderstatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = true, fetch = FetchType.EAGER)
    private COrderStatus corderstatusId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    @JoinColumn(name = "customer_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Customer customerId;


    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "corderId", orphanRemoval = true)
    private List<COrderItem> corderItemList;

    public COrder(String number){
        this.cono = number;
    }

    public COrder(Integer id, String cono,  Customer customerId, BigDecimal discountedratio, LocalDate requiredate){
        this.id = id;
        this.cono = cono;
        this.customerId = customerId;
        this.discountedratio = discountedratio;
        this.requiredate = requiredate;
    }
}