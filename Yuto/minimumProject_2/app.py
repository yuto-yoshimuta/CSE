from flask import Flask, Response, render_template, request, jsonify
import cv2
from roboflow import Roboflow
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

rf = Roboflow(api_key="X6ALu0a2v4EeuHuJoa0V")
project = rf.workspace().project("jpdtwd")
model = project.version(3).model

# セッション管理用の辞書
streams = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start_camera')
def start_camera():
    return "Camera access requested", 200

@app.route('/video_feed/<stream_id>', methods=['GET', 'POST'])
def video_feed(stream_id):
    if request.method == 'POST':
        try:
            # POSTされたフレームデータを取得
            frame_data = request.get_data()
            
            # バイナリデータをnumpy配列に変換
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return "Invalid frame data", 400
            
            # Roboflowで予測
            prediction = model.predict(frame, confidence=40, overlap=30).json()
            
            # 予測結果に基づいて矩形を描画
            for detection in prediction['predictions']:
                x = int(detection['x'] - detection['width'] / 2)
                y = int(detection['y'] - detection['height'] / 2)
                width = int(detection['width'])
                height = int(detection['height'])
                label = detection['class']
                
                cv2.rectangle(frame, (x, y), (x + width, y + height), (0, 255, 0), 2)
                cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            # 処理済みフレームをJPEGにエンコード
            _, buffer = cv2.imencode('.jpg', frame)
            response = Response(buffer.tobytes(), mimetype='image/jpeg')
            return response
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return str(e), 500

    # GETリクエストの場合は空のレスポンスを返す
    return Response(mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)