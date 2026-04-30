package face_recognition.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recognition_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RecognitionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    private Double confidence;

    @Column(name = "recognized_at", updatable = false)
    private LocalDateTime recognizedAt;

    @PrePersist
    public void prePersist() {
        this.recognizedAt = LocalDateTime.now();
    }
}