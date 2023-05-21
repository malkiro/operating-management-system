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
@Table(name = "cpaymentmethod")
public class CPaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic (optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "cashorchequevalue")
    @Basic (optional = false)
    private BigDecimal cashorchequevalue;

    @Column(name = "chequeno")
    @Basic (optional = false)
    private String chequeno;

    @Column(name = "chequedate")
    @Basic (optional = false)
    private LocalDate chequedate;

    @JoinColumn(name = "cpmethod_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private  CPMethod cpmethodId;

    @JoinColumn(name = "cpayment_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JsonIgnore
    private CPayment cpaymentId;



}
