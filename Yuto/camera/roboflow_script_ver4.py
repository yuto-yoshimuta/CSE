import cv2
from roboflow import Roboflow
import time

def draw_detection(frame, detection):
    """検出結果を描画する関数"""
    # バウンディングボックスの座標を計算
    x = int(detection['x'] - detection['width'] / 2)
    y = int(detection['y'] - detection['height'] / 2)
    width = int(detection['width'])
    height = int(detection['height'])
    
    # 信頼度を取得
    confidence = detection['confidence']
    label = f"{detection['class']} ({confidence:.1f}%)"
    
    # 矩形とラベルを描画
    cv2.rectangle(frame, (x, y), (x + width, y + height), (0, 255, 0), 2)
    cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

# Roboflowの初期化
rf = Roboflow(api_key="X6ALu0a2v4EeuHuJoa0V")
project = rf.workspace().project("jpdtwd")
model = project.version(3).model

# カメラの初期化
cap = cv2.VideoCapture(1)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# FPS計測用の変数
prev_time = time.time()
fps = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    # FPSの計算
    current_time = time.time()
    fps = 1 / (current_time - prev_time)
    prev_time = current_time
    
    try:
        # 物体検出の実行
        predictions = model.predict(frame, confidence=40, overlap=30).json()
        
        # 検出結果の表示
        if 'predictions' in predictions:
            for detection in predictions['predictions']:
                draw_detection(frame, detection)
        
        # FPSの表示
        cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 検出数の表示
        num_detections = len(predictions.get('predictions', []))
        cv2.putText(frame, f"Detections: {num_detections}", (10, 60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    
        # 生の予測結果をコンソールに出力（デバッグ用）
        print("Raw predictions:", predictions)
        
    except Exception as e:
        print(f"Error during prediction: {e}")
    
    # フレームの表示
    cv2.imshow("Object Detection", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()