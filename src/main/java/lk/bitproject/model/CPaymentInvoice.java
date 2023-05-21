package lk.bitproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "cpaymentinvoice")
public class CPaymentInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic (optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "invoiceamount")
    @Basic (optional = false)
    private BigDecimal invoiceamount;

    @Column(name = "outstanding")
    @Basic (optional = false)
    private BigDecimal outstanding;

    @Column(name = "applingamount")
    @Basic (optional = false)
    private BigDecimal applingamount;

    @Column(name = "paidamount")
    @Basic (optional = false)
    private BigDecimal paidamount;

    @JoinColumn(name = "invoice_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private  Invoice invoiceId;

    @JoinColumn(name = "cpayment_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JsonIgnore
    private CPayment cpaymentId;



}
