from flask import Flask, Response, render_template, request
import cv2
from roboflow import Roboflow
import numpy as np

app = Flask(__name__)

rf = Roboflow(api_key="xZ3p0chUutwYSK3igU04")
project = rf.workspace().project("ttwdd")
model = project.version(1).model

cap = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start_camera')
def start_camera():
    global cap
    if cap:
        cap.release()
    cap = cv2.VideoCapture(1)  # デフォルトのカメラID（0）を指定
    if cap.isOpened():
        return "Camera started"
    else:
        return "Failed to start camera", 500

def generate_frames():
    global cap
    if cap is None or not cap.isOpened():
        return

    while True:
        success, frame = cap.read()
        if not success:
            break

        # OpenCVでフレームをJPEGエンコード
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue

        # エンコードされたフレームデータをRoboflowのモデルに直接送信
        frame_bytes = buffer.tobytes()
        np_frame = np.frombuffer(frame_bytes, dtype=np.uint8)
        image = cv2.imdecode(np_frame, cv2.IMREAD_COLOR)

        # Roboflowで予測を行う
        prediction = model.predict(image, confidence=40, overlap=30).json()

        # 予測結果に基づいて矩形を描画
        for detection in prediction['predictions']:
            x = int(detection['x'] - detection['width'] / 2)
            y = int(detection['y'] - detection['height'] / 2)
            width = int(detection['width'])
            height = int(detection['height'])
            label = detection['class']

            # 検出されたオブジェクトに枠とラベルを追加
            cv2.rectangle(frame, (x, y), (x + width, y + height), (0, 255, 0), 2)
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # JPEG形式でフレームをエンコード
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        # フレームをyieldしてHTTPレスポンスを返す
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True)
