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
@Table(name = "customerreturnitem")
public class CustomerReturnItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic (optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "mprice")
    @Basic (optional = false)
    private BigDecimal mprice;

    @Column(name = "rqty")
    @Basic (optional = false)
    private Integer rqty;

    @Column(name = "linetotal")
    @Basic (optional = false)
    private BigDecimal linetotal;

    @JoinColumn(name = "item_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private  Item itemId;

    @JoinColumn(name = "batch_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Batch batchId;

    @JoinColumn(name = "customerreturn_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JsonIgnore
    private CustomerReturn customerreturnId;
}
