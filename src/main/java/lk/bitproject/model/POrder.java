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
@Table(name= "porder")
public class POrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "pono")
    @Basic(optional = false)
    private String pono;

    @Column(name = "totalprice")
    @Basic(optional = false)
    private BigDecimal totalprice;

    @JoinColumn(name = "supplier_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Supplier supplierId;

    @Column(name = "description")
    private String description;

    @JoinColumn(name = "porderstatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private POrderStatus porderstatusId;

    @Column(name = "date")
    @Basic (optional = false)
    private LocalDate date;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;


    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "porderId", orphanRemoval = true)
    private List<POrderItem> porderItemList;


    public POrder(String number){
        this.pono = number;
    }

//    Constructor function
    public POrder(Integer id, String number){
        this.id = id;
        this.pono = number;
    }

    public POrder(Integer id, String number,Supplier supplierId){
        this.id = id;
        this.pono = number;
        this.supplierId = supplierId;
    }


}