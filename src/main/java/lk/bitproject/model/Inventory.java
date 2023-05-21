package lk.bitproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name= "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "availableqty")
    @Basic(optional = false)
    private Integer availableqty;

    @Column(name = "totalqty")
//    @Basic (optional = false)
    private Integer totalqty;

    @JoinColumn(name = "inventorystatus_id", referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Inventorystatus inventorystatusId;

    @JoinColumn(name = "item_id", referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Item itemId;

    public Inventory(Integer id, Item itemId, Integer availableqty) {
        this.id = id;
        this.itemId = itemId;
        this.availableqty = availableqty;
    }
}
