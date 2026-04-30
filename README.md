═══════════════════════════════════════════════════════════════
        HƯỚNG DẪN CÀI ĐẶT & CHẠY MÃ NGUỒN (BẢN THỦ CÔNG)
        Hệ thống nhận diện khuôn mặt Web (Java + React)
═══════════════════════════════════════════════════════════════

I.  YÊU CẦU HỆ THỐNG (Phần mềm cần cài TRƯỚC)
------------------------------------------------
1.  JDK 21 (hoặc JDK 17, 21)
    - Tải tại: https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html
    - Sau khi cài xong, mở Command Prompt (cmd) gõ: java -version
    → Phải hiển thị phiên bản 21.x.x

2.  Maven (3.8.0 trở lên)
    - Tải tại: https://maven.apache.org/download.cgi
    - Giải nén vào thư mục (vd: C:\maven)
    - Thêm đường dẫn "C:\maven\bin" vào biến môi trường PATH
    - Kiểm tra: mvn -version

3.  MySQL Server (8.0 trở lên)
    - Tải tại: https://dev.mysql.com/downloads/mysql/
    - Cài đặt, chọn Authentication: "Use Legacy Authentication Method"
    - Đặt mật khẩu root (vd: 123456) => NHỚ MẬT KHẨU NÀY
    - Hoặc dùng XAMPP nếu quen thuộc

4.  Node.js (bản 18.x hoặc 20.x)
    - Tải tại: https://nodejs.org/
    - Cài xong kiểm tra: node -v  và  npm -v

5.  Trình duyệt (Chrome, Edge, Firefox) có hỗ trợ Webcam

6.  Git (không bắt buộc, chỉ để clone code nếu có)


II.  CẤU TRÚC THƯ MỤC MÃ NGUỒN SAU KHI GIẢI NÉN
------------------------------------------------
Gỉa sử giải nén vào ổ D: thì cấu trúc sẽ là:

D:\face-recognition\
    ├─ backend\          (bên trong này là code Spring Boot)
    │   ├─ pom.xml
    │   ├─ src\...
    │   └─ target\...
    │
    ├─ frontend\         (bên trong này là code React)
    │   ├─ package.json
    │   ├─ src\...
    │   └─ public\...
    │
    └─ database\         (chứa file SQL nếu có)
        └─ schema.sql


III. CÀI ĐẶT & CẤU HÌNH DATABASE (MySQL)
-------------------------------------------
Bước 1: Mở MySQL Command Line hoặc dùng phpMyAdmin (nếu XAMPP)

Bước 2: Tạo database tên là  face_db
    CREATE DATABASE face_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Bước 3: Dùng database vừa tạo
    USE face_db;

Bước 4: Chạy file schema.sql (nếu có) hoặc copy nội dung bên dưới:

------------  BẮT ĐẦU NỘI DUNG SQL  ------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    email VARCHAR(100) UNIQUE,
    face_label INT UNIQUE NOT NULL,
    is_trained BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS recognition_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    confidence DOUBLE,
    recognized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
------------  KẾT THÚC NỘI DUNG SQL  ------------

Bước 5: Kiểm tra bảng đã tạo thành công:
    SHOW TABLES;
    → Phải thấy 3 bảng: users, subjects, recognition_logs


IV.  CẤU HÌNH BACKEND (Spring Boot)
-------------------------------------
Bước 1: Dùng Notepad hoặc Visual Studio Code mở file:

    D:\face-recognition\backend\src\main\resources\application.yaml

Bước 2: Sửa đúng thông tin database của MÁY BẠN (quan trọng nhất):

    spring:
      datasource:
        url: jdbc:mysql://localhost:3306/face_db?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh
        username: root
        password: 123456          # <<< SỬA LẠI ĐÚNG MẬT KHẨU MYSQL CỦA BẠN

Bước 3: Tùy chọn: sửa cổng backend (mặc định 8080)

    server:
      port: 8080      # nếu muốn đổi thì sửa, ví dụ 9090

Bước 4: Kiểm tra đường dẫn lưu ảnh và model

    face:
      data:
        path: ./faces_data/          # thư mục lưu ảnh thu thập
      model:
        path: ./faces_data/trained_model.yml

    Các thư mục này sẽ tự tạo khi chạy backend lần đầu.

Bước 5: Lưu file application.yaml lại (Ctrl+S).


V.  CHẠY BACKEND (Spring Boot)
-------------------------------
Bước 1: Mở Command Prompt (cmd)

Bước 2: Di chuyển vào thư mục backend:

    cd /d D:\face-recognition\backend

Bước 3: Dùng Maven để clean và build (lần đầu sẽ hơi lâu vì tải thư viện)

    mvn clean install

    Nếu báo "BUILD SUCCESS" là OK.
    Nếu lỗi "JDK not found" thì cần kiểm lại JAVA_HOME.

Bước 4: Chạy ứng dụng backend:

    mvn spring-boot:run

    (Hoặc nếu đã build thành công:  java -jar target/face-recognition-0.0.1-SNAPSHOT.jar)

Bước 5: Khi thấy dòng chữ:

    "Started Application in X seconds"
    "JVM running for"

    → Backend đã chạy thành công ở cổng 8080.

Bước 6: Để test nhanh, mở trình duyệt gõ:

    http://localhost:8080/api/auth/login

    Nếu thấy {"error":"Method Not Allowed"} hoặc mã 405 là được (vì chưa gửi POST).

LƯU Ý: ĐỂ NGUYÊN CMD NÀY, KHÔNG TẮT. Nếu muốn chạy ngầm thì dùng lệnh khác.


VI.  CẤU HÌNH FRONTEND (ReactJS)
---------------------------------
Bước 1: Mở file:

    D:\face-recognition\frontend\src\api\axios.js

Bước 2: Kiểm tra BASE_URL có đúng địa chỉ backend không:

    const BASE_URL = "http://localhost:8080/api";

    Nếu backend chạy cổng 8080 thì giữ nguyên.
    Nếu backend chạy cổng khác (vd 9090) thì sửa lại.

Bước 3: Lưu file.


VII. CHẠY FRONTEND (React)
---------------------------
Bước 1: Mở Command Prompt MỚI (không đóng cmd backend)

Bước 2: Di chuyển vào thư mục frontend:

    cd /d D:\face-recognition\frontend

Bước 3: Cài đặt các thư viện Node (chỉ cần làm lần đầu):

    npm install

    Lệnh này sẽ tải toàn bộ dependencies trong package.json
    (có thể chạy 2-3 phút tùy tốc độ mạng)

Bước 4: Chạy frontend:

    npm start

Bước 5: Trình duyệt tự động mở tại http://localhost:3000

    Nếu không tự mở, gõ địa chỉ trên vào trình duyệt.


VIII. KIỂM TRA TOÀN BỘ HỆ THỐNG
--------------------------------
1.  Đăng ký tài khoản:
    - Vào màn hình Register, tạo user (ví dụ: user / 123456)

2.  Đăng nhập:
    - Đăng nhập bằng user vừa tạo.

3.  Tạo Subject (người cần nhận diện):
    - Trong Dashboard, chọn "Thêm Subject"
    - Nhập họ tên, phone, email. Lưu lại.

4.  Thu thập ảnh:
    - Vào màn hình Scan
    - Chọn subject vừa tạo
    - Bấm "Bắt đầu thu thập", nhìn thẳng webcam để chụp 50 ảnh.

5.  Train model:
    - Sau khi thu thập đủ, bấm nút "Train Model"
    - Đợi vài giây, hệ thống báo thành công.

6.  Nhận diện:
    - Vào màn hình Scan
    - Bấm "Bắt đầu nhận diện"
    - Đưa mặt trước cam → tên hiển thị + khung xanh nếu đúng.


IX.  CÁC LỖI THƯỜNG GẶP VÀ CÁCH SỬA (THỦ CÔNG)
------------------------------------------------
Lỗi 1: "Access denied for user 'root'@'localhost'"
→ Sửa sai mật khẩu MySQL trong file application.yaml.

Lỗi 2: "Connection refused: connect"
→ MySQL chưa chạy. Bật MySQL lên.

Lỗi 3: "Unable to find javacv-platform"
→ Mất internet khi build lần đầu, hoặc lỗi maven. Xóa thư mục .m2/repository và chạy lại mvn clean install.

Lỗi 4: Backend chạy nhưng frontend báo network error
→ Kiểm tra cổng backend (8080) và frontend (3000) không trùng, kiểm tra BASE_URL.

Lỗi 5: Webcam không hoạt động trên trình duyệt
→ Phải bấm "Cho phép" khi trình duyệt hỏi quyền camera.
→ Vào chrome://settings/content/camera để kiểm tra.

Lỗi 6: Không detect được mặt
→ Kiểm tra ánh sáng đủ, mặt nhìn thẳng.
→ Kiểm tra file haarcascade_frontalface_default.xml có trong thư mục resources không.

Lỗi 7: Train xong mà nhận diện toàn sai
→ Cần thu thập ít nhất 30-50 ảnh, đủ nhiều góc độ.
→ Train lại sau khi thu thập thêm ảnh.


X.  THÔNG TIN BỔ SUNG
---------------------
- Thư mục lưu ảnh sau khi thu thập: backend/faces_data/subject_1/
- File model sau khi train: backend/faces_data/trained_model.yml
- Log nhận diện lưu trong bảng recognition_logs của MySQL.
- JWT token hết hạn sau 10 giờ, phải đăng nhập lại.

═══════════════════════════════════════════════════════════════
  Chúc bạn chạy thành công! 
  Nếu vẫn lỗi, kiểm tra kỹ từ bước MySQL và application.yaml.
═══════════════════════════════════════════════════════════════
