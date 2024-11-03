import cv2
import numpy as np
from roboflow import Roboflow
from collections import deque, Counter
import time

class ObjectDetector:
    def __init__(self, api_key, project_name, version=3):
        # Roboflow初期化
        self.rf = Roboflow(api_key=api_key)
        self.workspace = self.rf.workspace()
        self.project = self.workspace.project(project_name)
        self.model = self.project.version(version).model
        
        # 検出履歴を保持するキュー
        self.detection_history = deque(maxlen=5)
        
        # アダプティブな閾値の初期設定
        self.confidence_threshold = 40  # 閾値を下げて検出しやすくする
        self.min_confidence = 30
        self.max_confidence = 80

    def preprocess_frame(self, frame):
        """最小限の前処理"""
        # 基本的なノイズ除去のみ実施
        denoised = cv2.GaussianBlur(frame, (5, 5), 0)
        return denoised

    def draw_detection(self, frame, prediction):
        """検出結果の描画"""
        confidence = prediction['confidence']
        color = (0, int(255 * (confidence/100)), 0)
        
        x = int(prediction['x'] - prediction['width'] / 2)
        y = int(prediction['y'] - prediction['height'] / 2)
        width = int(prediction['width'])
        height = int(prediction['height'])
        
        # バウンディングボックスの描画
        cv2.rectangle(frame, (x, y), (x + width, y + height), color, 2)
        
        # ラベルと信頼度の表示（画像内）
        label = f"{prediction['class']} ({confidence:.1f}%)"
        cv2.putText(frame, label, (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

def main():
    detector = ObjectDetector(api_key="X6ALu0a2v4EeuHuJoa0V", project_name="jpdtwd")
    cap = cv2.VideoCapture(1)
    
    # カメラ設定
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # 最小限の前処理
        processed_frame = detector.preprocess_frame(frame)
        
        try:
            # 物体検出
            predictions = detector.model.predict(
                processed_frame,
                confidence=detector.confidence_threshold,
                overlap=30
            ).json()
            
            # 検出されたオブジェクトの集計
            detected_objects = Counter(pred['class'] for pred in predictions['predictions'])
            
            # コンソールに検出結果を表示
            print("\n検出されたオブジェクト:")
            for obj, count in detected_objects.items():
                print(f"{obj}: {count}個")
            
            # 結果の描画
            for pred in predictions['predictions']:
                detector.draw_detection(frame, pred)
            
            # 画面上部に検出サマリーを表示
            y_pos = 30
            for obj, count in detected_objects.items():
                text = f"{obj}: {count}"
                cv2.putText(frame, text, (10, y_pos),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                y_pos += 30
                
        except Exception as e:
            print(f"Error during detection: {e}")
        
        cv2.imshow("Object Detection", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()