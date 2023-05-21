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
@Table(name= "spayment")
public class SPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "sbillno")
    @Basic (optional = false)
    private String sbillno;

    @Column(name = "tobepaidamount")
    @Basic (optional = false)
    private BigDecimal tobepaidamount;

    @Column(name = "paidamount")
    @Basic (optional = false)
    private BigDecimal paidamount;

    @Column(name = "balance")
    @Basic (optional = false)
    private BigDecimal balance;

    @Column(name = "chequeno")
    private String chequeno;

    @Column(name = "chequedate")
    private LocalDate chequedate;

    @Column(name = "bankname")
    private String bankname;

    @Column(name = "bankbranch")
    private String bankbranch;

    @Column(name = "bankaccount")
    private String bankaccount;

    @Column(name = "accountholder")
    private String accountholder;

    @Column(name = "description")
    private String description;

    @Column(name = "date")
    @Basic (optional = false)
    private LocalDate date;

    @JoinColumn(name = "supplier_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Supplier supplierId;

    @JoinColumn(name = "spaymentstatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private SPayamentstatus spaymentstatusId;

    @JoinColumn(name = "spaymentmethod_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private SPayamentmethod spaymentmethodId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    public SPayment(String number){
        this.sbillno = number;
    }
}
