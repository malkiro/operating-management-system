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
@Table(name= "cpayment")
public class CPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "cbillno")
    @Basic (optional = false)
    private String cbillno;

    @Column(name = "oldbalance")
    @Basic (optional = false)
    private BigDecimal oldbalance;

    @Column(name = "newbalance")
    @Basic (optional = false)
    private BigDecimal newbalance;

    @Column(name = "totalamount")
    @Basic (optional = false)
    private String totalamount;

    @Column(name = "recieveddate")
    @Basic (optional = false)
    private LocalDate recieveddate;

    @Column(name = "description")
    private String description;

    @JoinColumn(name = "customer_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Customer customerId;

    @JoinColumn(name = "cpaymentstatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private CPayamentstatus cpaymentstatusId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "cpaymentId", orphanRemoval = true)
    private List<CPaymentInvoice> cpaymentInvoiceList;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "cpaymentId", orphanRemoval = true)
    private List<CPaymentMethod> cpaymentMethodList;

    public CPayment(String number){
        this.cbillno = number;
    }
}
