package face_recognition.opencv;

import jakarta.annotation.PostConstruct;
import org.bytedeco.javacpp.Loader;
import org.bytedeco.opencv.global.opencv_core;
import org.bytedeco.opencv.global.opencv_face;
import org.bytedeco.opencv.global.opencv_imgcodecs;
import org.bytedeco.opencv.global.opencv_imgproc;
import org.bytedeco.opencv.global.opencv_objdetect;
import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.opencv_core.MatVector;
import org.bytedeco.opencv.opencv_core.Rect;
import org.bytedeco.opencv.opencv_core.RectVector;
import org.bytedeco.opencv.opencv_core.Size;
import org.bytedeco.opencv.opencv_face.LBPHFaceRecognizer;
import org.bytedeco.opencv.opencv_objdetect.CascadeClassifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Objects;

import static org.bytedeco.opencv.global.opencv_core.CV_32SC1;
import static org.bytedeco.opencv.global.opencv_imgcodecs.IMREAD_COLOR;
import static org.bytedeco.opencv.global.opencv_imgcodecs.IMREAD_GRAYSCALE;
import static org.bytedeco.opencv.global.opencv_imgcodecs.imwrite;
import static org.bytedeco.opencv.global.opencv_imgcodecs.imread;
import static org.bytedeco.opencv.global.opencv_imgcodecs.imdecode;
import static org.bytedeco.opencv.global.opencv_imgproc.COLOR_BGR2GRAY;
import static org.bytedeco.opencv.global.opencv_imgproc.cvtColor;
import static org.bytedeco.opencv.global.opencv_imgproc.equalizeHist;
import static org.bytedeco.opencv.global.opencv_imgproc.resize;

@Service
public class FaceRecognitionService {

    @Value("${face.data.path}")
    private String faceDataPath;

    @Value("${face.model.path}")
    private String modelPath;

    private CascadeClassifier faceDetector;
    private LBPHFaceRecognizer faceRecognizer;
    private boolean modelTrained = false;

    @PostConstruct
    public void init() {
        try {
            Loader.load(opencv_objdetect.class);
            Loader.load(opencv_face.class);

            InputStream is = getClass().getResourceAsStream(
                    "/haarcascades/haarcascade_frontalface_default.xml"
            );
            if (is == null) throw new RuntimeException("Không tìm thấy file haarcascade!");

            File tempFile = File.createTempFile("haarcascade", ".xml");
            tempFile.deleteOnExit();
            Files.copy(is, tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            is.close();

            faceDetector = new CascadeClassifier(tempFile.getAbsolutePath());
            if (faceDetector.empty()) throw new RuntimeException("CascadeClassifier load thất bại!");

            faceRecognizer = LBPHFaceRecognizer.create();

            File modelFile = new File(modelPath);
            if (modelFile.exists()) {
                faceRecognizer.read(modelPath);
                modelTrained = true;
            }

            new File(faceDataPath).mkdirs();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khởi tạo OpenCV: " + e.getMessage(), e);
        }
    }

    // THU THẬP ẢNH

    public int collectFaceImage(String base64Image, int subjectLabel) throws Exception {
       
        byte[] imageBytes = Base64.getDecoder().decode(
                base64Image.replace("data:image/jpeg;base64,", "")
        );

        Mat imageMat = imdecode(new Mat(imageBytes), IMREAD_COLOR);
        Mat gray = new Mat();
        cvtColor(imageMat, gray, COLOR_BGR2GRAY);

        RectVector faces = new RectVector();
        faceDetector.detectMultiScale(gray, faces);

        if (faces.empty()) throw new RuntimeException("Không tìm thấy khuôn mặt!");
        if (faces.size() > 1) throw new RuntimeException("Phát hiện nhiều hơn 1 khuôn mặt!");


        Rect faceRect = faces.get(0);
        Mat faceCrop = new Mat(gray, faceRect);
        resize(faceCrop, faceCrop, new Size(200, 200));
        equalizeHist(faceCrop, faceCrop);

        String subjectDir = faceDataPath + "subject_" + subjectLabel + "/";
        new File(subjectDir).mkdirs();

        int count = Objects.requireNonNull(new File(subjectDir).list()).length;
        imwrite(subjectDir + "face_" + count + ".jpg", faceCrop);
        return count + 1;
    }

    // TRAIN - HUẤN LUYỆN MÔ HÌNH

    public void trainModel(List<Integer> labels) throws Exception {

        List<Mat> imageList = new ArrayList<>();
        List<Integer> labelList = new ArrayList<>();

        for (int label : labels) {
            File dir = new File(faceDataPath + "subject_" + label + "/");
            if (!dir.exists()) continue;
            
            File[] files = dir.listFiles(f -> f.getName().endsWith(".jpg"));
            if (files == null) continue;

            for (File f : files) {
                Mat img = imread(f.getAbsolutePath(), IMREAD_GRAYSCALE);
                if (!img.empty()) {
                    imageList.add(img);
                    labelList.add(label);
                }
            } 
        }

        if (imageList.isEmpty()) throw new RuntimeException("Không có dữ liệu để train!");


        MatVector images = new MatVector(imageList.toArray(new Mat[0]));
        Mat labelsMat = new Mat(labelList.size(), 1, CV_32SC1);
        for (int i = 0; i < labelList.size(); i++) {
            labelsMat.ptr(i).putInt(labelList.get(i));
        }


        faceRecognizer.train(images, labelsMat);
        faceRecognizer.save(modelPath);
        modelTrained = true;
    }

    /////3. RECOGNIZE - NHẬN DIỆN KHUÔN MẶT

    public RecognitionResult recognize(String base64Image) throws Exception {
        if (!modelTrained) throw new RuntimeException("Model chưa được train!");

        byte[] imageBytes = Base64.getDecoder().decode(
                base64Image.replace("data:image/jpeg;base64,", "")
        );

        Mat imageMat = imdecode(new Mat(imageBytes), IMREAD_COLOR);
        Mat gray = new Mat();
        cvtColor(imageMat, gray, COLOR_BGR2GRAY);

        RectVector faces = new RectVector();
        faceDetector.detectMultiScale(gray, faces);

        if (faces.empty()) throw new RuntimeException("Không phát hiện khuôn mặt!");


        Rect faceRect = faces.get(0);
        Mat faceCrop = new Mat(gray, faceRect);
        resize(faceCrop, faceCrop, new Size(200, 200));
        equalizeHist(faceCrop, faceCrop);

        int[] labelOut = new int[]{0};
        double[] confidenceOut = new double[]{0.0};
    
        faceRecognizer.predict(faceCrop, labelOut, confidenceOut);

        return new RecognitionResult(
                labelOut[0],
                confidenceOut[0],
                confidenceOut[0] < 80,
                faceRect.x(),
                faceRect.y(),
                faceRect.width(),
                faceRect.height()
        );
    }

    public record RecognitionResult(
            int label,
            double confidence,
            boolean recognized,
            int faceX,
            int faceY,
            int faceW,
            int faceH
    ) {}
}