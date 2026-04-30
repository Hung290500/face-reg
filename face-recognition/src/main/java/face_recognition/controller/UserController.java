package face_recognition.controller;

import face_recognition.model.User;
import face_recognition.repository.UserRepository;
import face_recognition.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;


    @PutMapping("/{id}/lock")
    public ResponseEntity<?> lock(@PathVariable Long id) {
        authService.lockUser(id);
        return ResponseEntity.ok(Map.of("message", "Đã khóa tài khoản!"));
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<?> unlock(@PathVariable Long id) {
        authService.unlockUser(id);
        return ResponseEntity.ok(Map.of("message", "Đã mở khóa!"));
    }


    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}