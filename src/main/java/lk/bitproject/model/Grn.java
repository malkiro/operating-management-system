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
@Table(name= "grn")
public class Grn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "grnno")
    @Basic (optional = false)
    private String grnno;

    @Column(name = "supinvoiceno")
    private String supinvoiceno;

    @Column(name = "grandtotal")
    @Basic (optional = false)
    private BigDecimal grandtotal;

    @Column(name = "discountedratio")
    private BigDecimal discountedratio;

    @Column(name = "discount")
    @Basic (optional = false)
    private BigDecimal discount;

    @Column(name = "nettotal")
    @Basic (optional = false)
    private BigDecimal nettotal;

    @Column(name = "description")
    private String description;

    @Column(name = "receiveddate")
    @Basic (optional = false)
    private LocalDate receiveddate;

    @Column(name = "addeddate")
    @Basic (optional = false)
    private LocalDate addeddate;


    @JoinColumn(name = "porder_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private POrder porderId;

    @JoinColumn(name = "category_id" ,referencedColumnName = "id")
    @ManyToOne(optional = true, fetch = FetchType.EAGER)
    private Category categoryId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    @JoinColumn(name = "grnstatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private GrnStatus grnstatusId;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "grnId", orphanRemoval = true)
    private List<GrnBatch> grnBatchList;


    public Grn(String number){
        this.grnno = number;
    }


}