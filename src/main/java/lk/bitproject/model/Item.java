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
@Table(name= "item")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "itemcode")
    @Basic (optional = false)
    private String itemcode;

    @Column(name = "itemname")
    @Basic (optional = false)
    private String itemname;

    @Lob
    @Column(name = "photo")
    private byte[] photo;

    @Column(name = "itemsize")
    @Basic (optional = false)
    private String itemsize;

    @Column(name = "rop")
    private Integer rop;

    @Column(name = "roq")
    private Integer roq;

    @Column(name = "description")
    private String description;

    @Column(name = "date")
    @Basic (optional = false)
    private LocalDate date;

    @JoinColumn(name = "brand_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Brand brandId;

    @JoinColumn(name = "subcategory_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Subcategory subcategoryId;

    @JoinColumn(name = "unittype_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Unittype unittypeId;

    @JoinColumn(name = "itemstatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Itemstatus itemstatusId;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    //Constructor function
    public Item(Integer id, String itemname, Integer roq, Subcategory subcategoryId){
        this.id = id;
        this.itemname = itemname;
        this.roq = roq;
        this.subcategoryId = subcategoryId;
    }

    public Item(Integer id, String itemname){
        this.id = id;
        this.itemname = itemname;
    }
}
