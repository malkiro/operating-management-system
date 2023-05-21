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
@Table(name = "corderitem")
public class COrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic (optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "mprice")
    private BigDecimal mprice;

    @Column(name = "qty")
    private Integer qty;

    @Column(name = "linetotal")
    private BigDecimal linetotal;

    @JoinColumn(name = "item_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private  Item itemId;

    @JoinColumn(name = "corder_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JsonIgnore
    private COrder corderId;



}
