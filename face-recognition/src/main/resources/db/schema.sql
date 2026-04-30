CREATE DATABASE IF NOT EXISTS face_recognition_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE face_recognition_db;

CREATE TABLE IF NOT EXISTS users (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(100),
    full_name  VARCHAR(100),
    role       ENUM('ADMIN','STAFF') DEFAULT 'STAFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name         VARCHAR(100) NOT NULL,
    date_of_birth     DATE,
    phone             VARCHAR(20),
    email             VARCHAR(100),
    address           TEXT,
    notes             TEXT,
    face_label        INT UNIQUE,
    face_images_path  VARCHAR(255),
    is_trained        BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recognition_logs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id    BIGINT,
    confidence    DOUBLE,
    recognized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- Tài khoản admin mặc định (password gốc: Admin@123)
INSERT INTO users (username, password, email, full_name, role)
VALUES (
    'admin',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH',
    'admin@faceapp.com',
    'Administrator',
    'ADMIN'
) ON DUPLICATE KEY UPDATE username = username;
```

**Chạy bằng cách nào?**
```
Option 1: Dùng MySQL Workbench
→ Mở MySQL Workbench → paste toàn bộ SQL trên → bấm Execute (Ctrl+Shift+Enter)

Option 2: Dùng terminal
→ mysql -u root -p
→ paste nội dung SQL vào