package face_recognition.repository;

import face_recognition.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByFaceLabel(Integer faceLabel);

    @Query("SELECT s.faceLabel FROM Subject s WHERE s.faceLabel IS NOT NULL")
    List<Integer> findAllFaceLabels();

    @Query("SELECT COALESCE(MAX(s.faceLabel), 0) FROM Subject s")
    Integer findMaxFaceLabel();
}