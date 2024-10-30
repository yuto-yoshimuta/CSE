from flask import Flask, Response, render_template
import cv2
from roboflow import Roboflow

app = Flask(__name__)

# RoboflowのAPIキーとモデル情報
rf = Roboflow(api_key="xZ3p0chUutwYSK3igU04")
project = rf.workspace().project("ttwdd")
model = project.version(1).model  # MODEL_ENDPOINT と VERSION に置き換える

# カメラのキャプチャ設定を起動時にはしない（ボタン押下時にのみ起動）
cap = None

@app.route('/')
def index():
    # トップページの表示（カメラ許可ボタン付き）
    return render_template('index.html')

@app.route('/start_camera')
def start_camera():
    global cap
    cap = cv2.VideoCapture(0)  # 指定カメラのキャプチャを開始
    return "Camera started"

def generate_frames():
    global cap
    if cap is None or not cap.isOpened():
        return

    while True:
        success, frame = cap.read()
        if not success:
            break

        # OpenCVでフレームを画像として保存
        cv2.imwrite("current_frame.jpg", frame)

        # Roboflowで予測を行う
        prediction = model.predict("current_frame.jpg", confidence=40, overlap=30).json()

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
