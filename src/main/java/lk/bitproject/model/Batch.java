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
@Table(name = "batch")
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic (optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "batchcode")
    @Basic (optional = false)
    private String batchcode ;

    @Column(name = "purchaseprice")
    @Basic (optional = false)
    private BigDecimal purchaseprice;

    @Column(name = "salesprice")
    @Basic (optional = false)
    private BigDecimal salesprice;

    @Column(name = "marketprice")
    @Basic (optional = false)
    private BigDecimal marketprice;

    @Column(name = "expdate")
    @Basic (optional = false)
    private LocalDate expdate;

    @Column(name = "mnfdate")
    @Basic (optional = false)
    private LocalDate mnfdate;

    @Column(name = "batchqty")
    private Integer batchqty;

    @Column(name = "avalableqty")
    private Integer avalableqty;

    @Column(name = "returnqty")
    private Integer returnqty;


    @JoinColumn(name = "supplier_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Supplier supplierId;

    @JoinColumn(name = "item_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Item itemId;

    //Constructor function
    public Batch(Integer id, BigDecimal purchaseprice, BigDecimal marketprice){
        this.id = id;
        this.purchaseprice = purchaseprice;
        this.marketprice = marketprice;
    }

    public Batch(Integer id, String batchcode,Integer avalableqty , BigDecimal marketprice){
        this.id = id;
        this.batchcode = batchcode;
        this.avalableqty = avalableqty;
        this.marketprice = marketprice;
    }

    public Batch(Integer id, String batchcode, BigDecimal marketprice, BigDecimal salesprice, LocalDate mnfdate, LocalDate expdate, Item itemId){
        this.id = id;
        this.batchcode = batchcode;
        this.marketprice = marketprice;
        this.salesprice = salesprice;
        this.mnfdate = mnfdate;
        this.expdate = expdate;
        this.itemId = itemId;
    }
}