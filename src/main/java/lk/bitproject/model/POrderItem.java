package lk.bitproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.access.method.P;

import javax.persistence.*;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "porderitem")
public class POrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic (optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "qty")
   // @Basic(optional = false)
    private String qty;

    @Column(name = "pprice")
   // @Basic(optional = false)
    private String pprice;

    @Column(name = "linetotal")
    //@Basic(optional = false)
    private String linetotal;

    @JoinColumn(name = "item_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private  Item itemId;

    @JoinColumn(name = "porder_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JsonIgnore
    private POrder porderId;



}
