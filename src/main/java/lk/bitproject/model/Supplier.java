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
@Table(name= "supplier")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Column(name = "regno")
    @Basic(optional = false)
    private String regno;

    @Column(name = "brnumber")
    @Basic (optional = false)
    private String brnumber;

    @Column(name = "sname")
    @Basic (optional = false)
    private String sname;

    @Column(name = "sland")
    @Basic (optional = false)
    private String sland;

    @Column(name = "semail")
    @Basic (optional = false)
    private String semail;

    @Column(name = "address")
    @Basic (optional = false)
    private String address;

    @Column(name = "description")
    private String description;

    @Column(name = "cpname")
    @Basic (optional = false)
    private String cpname;

    @Column(name = "cpmobile")
    @Basic (optional = false)
    private String cpmobile;

    @Column(name = "cpnic")
    @Basic (optional = false)
    private String cpnic;

    @Column(name = "cpemail")
    private String cpemail;

    @Column(name = "bankname")
    @Basic (optional = false)
    private String bankname;

    @Column(name = "bankbranch")
    @Basic (optional = false)
    private String bankbranch;

    @Column(name = "bankaccount")
    @Basic (optional = false)
    private String bankaccount;

    @Column(name = "accountholder")
    private String accountholder;

    @Column(name = "tobepaid")
    private BigDecimal tobepaid;

    @JoinColumn(name = "sstatus_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private SStatus sstatusId;

    @Column(name = "regdate")
    @Basic (optional = false)
    private LocalDate regdate;

    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private Employee employeeId;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "supplierId", orphanRemoval = true)
    private List<Supply> supplyList;

    public Supplier(String number){
        this.regno = number;
    }

    //Default constructor
    //    public Supplier(){}

    //constructor function with 2(id, name) paramiters
    public Supplier(Integer id, String name, BigDecimal tobepaid){
        this.id = id;
        this.sname = name;
        this.tobepaid = tobepaid;
    }

    //constructor function with 2(id, name) paramiters
    public Supplier(Integer id, String name, String bankname, String bankbranch, String bankaccount, String accountholder, BigDecimal tobepaid){
        this.id = id;
        this.sname = name;
        this.bankname = bankname;
        this.bankbranch = bankbranch;
        this.bankaccount = bankaccount;
        this.accountholder = accountholder;
        this.tobepaid = tobepaid;
    }



}