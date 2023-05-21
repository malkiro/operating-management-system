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
@Table(name = "request")
public class Request {
                    @Id
                    @GeneratedValue(strategy = GenerationType.IDENTITY)
                    @Basic (optional = false)
                    @Column(name = "id")
                    private Integer id;

                    @Column(name = "no")
                    @Basic (optional = false)
                    private String no;

                    @Column(name = "requestdetails")
                    @Basic (optional = false)
                    private String requestdetails;

                    @Column(name = "requesteddate")
                    @Basic (optional = false)
                    private LocalDate requesteddate;

                    @Column(name = "confirmdate")
                    private LocalDate confirmdate;

                    @JoinColumn(name = "requeststatus_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = false, fetch = FetchType.EAGER)
                    private Requeststatus requeststatusId;

                    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = false, fetch = FetchType.EAGER)
                    private Employee employeeId;

                    @JoinColumn(name = "conemployee_id" ,referencedColumnName = "id")
                    @ManyToOne(optional = true, fetch = FetchType.EAGER)
                    private Employee conemployeeId;

                    public Request(String number){
                        this.no = number;
                    }

                    public Request(Integer id,String no, String requestdetails) {
                        this.id = id;
                        this.no = no;
                    this.requestdetails = requestdetails;
    }
}
