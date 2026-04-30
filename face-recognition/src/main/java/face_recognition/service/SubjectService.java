package face_recognition.service;

import face_recognition.model.RecognitionLog;
import face_recognition.model.Subject;
import face_recognition.repository.RecognitionLogRepository;
import face_recognition.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final RecognitionLogRepository logRepository;

    // Lấy subject theo ID
    public Subject getById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy subject id: " + id));
    }

    // Lấy subject theo face label (dùng sau khi nhận diện)
    public Subject getByFaceLabel(Integer label) {
        return subjectRepository.findByFaceLabel(label)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy face label: " + label));
    }

    // Lấy tất cả face label để train model
    public List<Integer> getAllFaceLabels() {
        return subjectRepository.findAllFaceLabels();
    }

    // Tạo subject mới — tự động sinh face_label
    public Subject create(Subject subject) {
        int nextLabel = subjectRepository.findMaxFaceLabel() + 1;
        subject.setFaceLabel(nextLabel);
        subject.setFaceImagesPath("./faces_data/subject_" + nextLabel + "/");
        subject.setIsTrained(false);
        return subjectRepository.save(subject);
    }

    // Lấy tất cả subject
    public List<Subject> getAll() {
        return subjectRepository.findAll();
    }

    // Cập nhật subject
    public Subject update(Long id, Subject updated) {

        if (updated.getFullName() == null || updated.getFullName().isBlank())
            throw new RuntimeException("Họ tên không được để trống!");
        if (updated.getPhone() != null && !updated.getPhone().matches("^(0[0-9]{9})$"))
            throw new RuntimeException("Số điện thoại không hợp lệ!");
        if (updated.getEmail() != null && !updated.getEmail().matches("^[\\w.]+@[\\w.]+\\.[a-z]{2,}$"))
            throw new RuntimeException("Email không hợp lệ!");

        Subject existing = getById(id);
        existing.setFullName(updated.getFullName());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setAddress(updated.getAddress());
        existing.setNotes(updated.getNotes());
        return subjectRepository.save(existing);
    }

    // ==================== XÓA SUBJECT (ĐÃ SỬA) ====================
    // Xóa subject, kèm theo xóa thư mục ảnh và log
    public void delete(Long id) {
        // Bước 1: Lấy subject cần xóa
        Subject subject = getById(id);
        
        // Bước 2: Xóa thư mục ảnh trong faces_data/
        String dirPath = "./faces_data/subject_" + subject.getFaceLabel() + "/";
        File dir = new File(dirPath);
        if (dir.exists()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.delete()) {
                        System.out.println("Đã xóa file: " + file.getName());
                    }
                }
            }
            if (dir.delete()) {
                System.out.println("Đã xóa thư mục: " + dirPath);
            }
        }
        
        // Bước 3: Xóa log trong bảng recognition_logs
        List<RecognitionLog> logs = logRepository.findBySubjectIdOrderByRecognizedAtDesc(id);
        if (!logs.isEmpty()) {
            logRepository.deleteAll(logs);
            System.out.println("Đã xóa " + logs.size() + " log của subject id: " + id);
        }
        
        // Bước 4: Xóa subject trong database
        subjectRepository.deleteById(id);
        System.out.println("Đã xóa subject id: " + id);
    }

    // Đánh dấu tất cả đã train xong
    public void markAllTrained() {
        List<Subject> all = subjectRepository.findAll();
        all.forEach(s -> s.setIsTrained(true));
        subjectRepository.saveAll(all);
    }

    // Lưu log mỗi lần nhận diện thành công
    public void logRecognition(Long subjectId, Double confidence) {
        Subject subject = getById(subjectId);
        RecognitionLog log = RecognitionLog.builder()
                .subject(subject)
                .confidence(confidence)
                .build();
        logRepository.save(log);
    }
}

