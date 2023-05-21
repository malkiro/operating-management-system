package lk.bitproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "invoiceitem")
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic (optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "avalableqty")
    @Basic (optional = false)
    private Integer avalableqty;

    @Column(name = "requestedqty")
    @Basic (optional = false)
    private Integer requestedqty;

    @Column(name = "deliveredqty")
    @Basic (optional = false)
    private Integer deliveredqty;

    @Column(name = "mprice")
    @Basic (optional = false)
    private BigDecimal mprice;

    @Column(name = "linetotal")
    @Basic (optional = false)
    private BigDecimal linetotal;

    @JoinColumn(name = "item_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private  Item itemId;

    @JoinColumn(name = "batch_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private  Batch batchId;

    @JoinColumn(name = "invoice_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JsonIgnore
    private Invoice invoiceId;



}
