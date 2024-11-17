import cv2
import numpy as np
from roboflow import Roboflow
import time

# RoboflowのAPIキーとモデル情報
rf = Roboflow(api_key="4jFLZZIZSslfmqbOl4lq")
workspace = rf.workspace()
project = workspace.project("jpytwd")
model = project.version(1).model

def preprocess_frame(frame):
    """フレームの前処理を行う関数"""
    # リサイズして処理を高速化（必要に応じてサイズを調整）
    frame = cv2.resize(frame, (640, 480))
    
    # ノイズ除去
    frame = cv2.GaussianBlur(frame, (5, 5), 0)
    
    # コントラスト調整
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    enhanced = cv2.merge((cl,a,b))
    frame = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    return frame

def apply_non_max_suppression(predictions, iou_threshold=0.5):
    """重複する検出を除去する関数"""
    if not predictions['predictions']:
        return predictions
    
    boxes = []
    scores = []
    classes = []
    
    for pred in predictions['predictions']:
        x = pred['x'] - pred['width']/2
        y = pred['y'] - pred['height']/2
        boxes.append([x, y, x + pred['width'], y + pred['height']])
        scores.append(pred['confidence'])
        classes.append(pred['class'])
    
    boxes = np.array(boxes)
    scores = np.array(scores)
    
    # Non-max suppression の実行
    selected_indices = cv2.dnn.NMSBoxes(
        boxes.tolist(), 
        scores.tolist(), 
        score_threshold=0.4, 
        nms_threshold=iou_threshold
    )
    
    filtered_predictions = {
        'predictions': [predictions['predictions'][i] for i in selected_indices]
    }
    return filtered_predictions

def draw_predictions(frame, predictions, fps=None):
    """検出結果を描画する関数"""
    for detection in predictions['predictions']:
        x = int(detection['x'] - detection['width'] / 2)
        y = int(detection['y'] - detection['height'] / 2)
        width = int(detection['width'])
        height = int(detection['height'])
        confidence = detection['confidence']
        label = f"{detection['class']} {confidence:.2f}"
        
        # 信頼度に応じて色を変える
        color = (0, int(255 * confidence), 0)
        
        # バウンディングボックスを描画
        cv2.rectangle(frame, (x, y), (x + width, y + height), color, 2)
        
        # ラベルの背景を描画
        (label_width, label_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
        cv2.rectangle(frame, (x, y - 25), (x + label_width, y), color, -1)
        
        # ラベルのテキストを描画
        cv2.putText(frame, label, (x, y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
    
    # FPSを表示
    if fps is not None:
        cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    return frame

def main():
    cap = cv2.VideoCapture(0)
    
    # カメラの設定を最適化
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # FPS計測用の変数
    fps = 0
    frame_count = 0
    start_time = time.time()
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # フレームの前処理
        processed_frame = preprocess_frame(frame)
        
        # 物体検出の実行
        predictions = model.predict(processed_frame, confidence=40, overlap=30).json()
        
        # Non-max suppressionの適用
        filtered_predictions = apply_non_max_suppression(predictions)
        
        # FPSの計算
        frame_count += 1
        if frame_count % 30 == 0:  # 30フレームごとに更新
            end_time = time.time()
            fps = 30 / (end_time - start_time)
            start_time = time.time()
        
        # 結果の描画
        result_frame = draw_predictions(processed_frame, filtered_predictions, fps)
        
        # フレームの表示
        cv2.imshow("Object Detection", result_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()