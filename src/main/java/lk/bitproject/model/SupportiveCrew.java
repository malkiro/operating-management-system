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
@Table(name = "supportivecrew")
public class SupportiveCrew {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic (optional = false)
    @Column(name = "id")
    private Integer id;



    @JoinColumn(name = "employee_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    private  Employee employeeId;

    @JoinColumn(name = "distribute_id" ,referencedColumnName = "id")
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JsonIgnore
    private Distribute distributeId;



}
