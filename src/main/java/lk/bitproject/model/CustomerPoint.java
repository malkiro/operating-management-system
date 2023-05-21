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
@Table(name = "customerpoint")
public class CustomerPoint {

                    @Id
                    @GeneratedValue(strategy = GenerationType.IDENTITY)
                    @Basic (optional = false)
                    @Column(name = "id")
                    private Integer id;

                    @Column(name = "name")
                    @Basic (optional = false)
                    private String name;

                    @Column(name = "startrate")
                    @Basic (optional = false)
                    private String startrate;

                    @Column(name = "endrate")
                    @Basic (optional = false)
                    private String endrate;

                    @Column(name = "discountratio")
                    @Basic (optional = false)
                    private String discountratio;

                    @Column(name = "pointperinvoice")
                    @Basic (optional = false)
                    private String pointperinvoice;

                    @Column(name = "invoiceamount")
                    @Basic (optional = false)
                    private String invoiceamount;
}
