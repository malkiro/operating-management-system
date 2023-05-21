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
@Table(name= "invoice")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "invoiceno")
    @Basic (optional = false)
    private String invoiceno;

    @Column(name = "date")
    @Basic (optional = false)
    private LocalDate date;

    @Column(name = "grandtotal")
    @Basic (optional = false)
    private BigDecimal grandtotal;

    @Column(name = "discountedratio")
    @Basic (optional = false)
    private BigDecimal discountedratio;

    @Column(name = "nettotal")
    @Basic (optional = false)
    private BigDecimal nettotal;

    @Column(name = "returnvalue")
    private BigDecimal returnvalue;

    @Column(name = "payableamount")
    @Basic (optional = false)
    private BigDecimal payableamount;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private Boolean status;

    @Column(name = "paidamount")
    private BigDecimal paidamount;

    @JoinColumn(name = "invoicestatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private InvoiceStatus invoicestatusId;

    @JoinColumn(name = "corder_id" ,referencedColumnName = "id")
    @ManyToOne(optional = true, fetch = FetchType.EAGER)
    private COrder corderId;

    @JoinColumn(name = "customer_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Customer customerId;

    @JoinColumn(name = "customerreturn_id" ,referencedColumnName = "id")
    @ManyToOne(optional = true, fetch = FetchType.EAGER)
    private CustomerReturn customerreturnId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "invoiceId", orphanRemoval = true)
    private List<InvoiceItem> invoiceItemList;

    public Invoice(String number){
        this.invoiceno = number;
    }

    public Invoice(Integer id, Customer customerId, String invoiceno){
        this.id = id;
        this.customerId = customerId;
        this.invoiceno = invoiceno;
    }

    public Invoice(Integer id, String invoiceno, BigDecimal payableamount, BigDecimal paidamount, LocalDate date){
        this.id = id;
        this.invoiceno = invoiceno;
        this.payableamount = payableamount;
        this.paidamount = paidamount;
        this.date = date;
    }


}