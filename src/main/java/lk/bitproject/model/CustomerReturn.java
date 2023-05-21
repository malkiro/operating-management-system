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
@Table(name = "customerreturn")
public class CustomerReturn {

                    @Id
                    @GeneratedValue(strategy = GenerationType.IDENTITY)
                    @Basic (optional = false)
                    @Column(name = "id")
                    private Integer id;

                    @Column(name = "returnno")
                    @Basic (optional = false)
                    private String returnno;

                    @Column(name = "totalamount")
                    @Basic (optional = false)
                    private BigDecimal totalamount;

                    @Column(name = "description")
                    private String description;

                    @Column(name = "taxvalue")
                    private String taxvalue;

                    @Column(name = "nettotal")
                    private String nettotal;

                    @Column(name = "date")
                    @Basic (optional = false)
                    private LocalDate date;


                    @JoinColumn(name = "customer_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = false, fetch = FetchType.EAGER)
                    private Customer customerId;

                    @JoinColumn(name = "customerreturnstatus_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = false, fetch = FetchType.EAGER)
                    private CustomerReturnStatus customerreturnstatusId;

                    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = false, fetch = FetchType.EAGER)
                    private  Employee employeeId;

                    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "customerreturnId", orphanRemoval = true)
                    private List<CustomerReturnItem> customerReturnItemList;

                    public CustomerReturn(String number){
                        this.returnno = number;
                    }

    //Constructor function
    public CustomerReturn(Integer id, String returnno, BigDecimal totalamount){
        this.id = id;
        this.returnno = returnno;
        this.totalamount = totalamount;
    }

}
