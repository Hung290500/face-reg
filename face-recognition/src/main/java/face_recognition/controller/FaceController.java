package face_recognition.controller;

import face_recognition.opencv.FaceRecognitionService;
import face_recognition.service.SubjectService;
import face_recognition.model.Subject;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/face")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FaceController {

    private final FaceRecognitionService faceService;
    private final SubjectService subjectService;

    @PostMapping("/collect/{subjectId}")
    public ResponseEntity<?> collectFace(
            @PathVariable Long subjectId,
            @RequestBody Map<String, String> body) {
        try {
            Subject subject = subjectService.getById(subjectId);
            int count = faceService.collectFaceImage(
                    body.get("image"),
                    subject.getFaceLabel()
            );
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "imageCount", count,
                    "message", "Đã thu thập " + count + "/50 ảnh"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/train")
    public ResponseEntity<?> trainModel() {
        try {
            var labels = subjectService.getAllFaceLabels();
            faceService.trainModel(labels);
            subjectService.markAllTrained();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Train model thành công!"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }


    @PostMapping("/recognize")
    public ResponseEntity<?> recognize(@RequestBody Map<String, String> body) {
        try {
            var result = faceService.recognize(body.get("image"));
            Subject subject = null;
            if (result.recognized()) {
                subject = subjectService.getByFaceLabel(result.label());
                subjectService.logRecognition(subject.getId(), result.confidence());
            }
            return ResponseEntity.ok(Map.of(
                    "recognized", result.recognized(),
                    "confidence", result.confidence(),
                    "faceX", result.faceX(),
                    "faceY", result.faceY(),
                    "faceW", result.faceW(),
                    "faceH", result.faceH(),
                    "subject", subject != null ? subject : Map.of()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}