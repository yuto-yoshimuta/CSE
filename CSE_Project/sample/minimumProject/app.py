from flask import Flask, Response, render_template, request, jsonify
import cv2
from roboflow import Roboflow
import numpy as np
from flask_cors import CORS
import logging
import json
import base64

# ログ設定
logging.basicConfig(level=logging.DEBUG)  # DEBUGレベルに変更
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Roboflowの初期化
try:
    rf = Roboflow(api_key="X6ALu0a2v4EeuHuJoa0V")
    project = rf.workspace().project("jpdtwd")
    model = project.version(3).model
    logger.info("Roboflow model loaded successfully")
except Exception as e:
    logger.error(f"Failed to initialize Roboflow: {e}")
    raise

# セッション管理用の辞書
streams = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start_camera')
def start_camera():
    try:
        logger.info("Camera access requested")
        return jsonify({"status": "success", "message": "Camera access granted"}), 200
    except Exception as e:
        logger.error(f"Error in start_camera: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/video_feed/<stream_id>', methods=['GET', 'POST'])
def video_feed(stream_id):
    if request.method == 'POST':
        try:
            logger.debug("Received POST request for video feed")
            
            # POSTされたフレームデータを取得
            frame_data = request.get_data()
            logger.debug(f"Received frame data size: {len(frame_data)} bytes")
            
            # バイナリデータをnumpy配列に変換
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                logger.error("Failed to decode frame data")
                return jsonify({"error": "Invalid frame data"}), 400
            
            logger.debug(f"Frame shape: {frame.shape}")
            
            # Roboflowで予測
            logger.debug("Making prediction with Roboflow")
            prediction_result = model.predict(frame, confidence=40, overlap=30).json()
            logger.debug(f"Prediction result: {prediction_result}")
            
            # 予測結果の処理
            processed_predictions = []
            for detection in prediction_result['predictions']:
                # 基本情報の取得
                x = int(detection['x'] - detection['width'] / 2)
                y = int(detection['y'] - detection['height'] / 2)
                width = int(detection['width'])
                height = int(detection['height'])
                
                # 矩形とラベルの描画
                cv2.rectangle(frame, (x, y), (x + width, y + height), (0, 255, 0), 2)
                cv2.putText(frame, 
                           f"{detection['class']} ({detection['confidence']:.2f})", 
                           (x, y - 10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 
                           0.5, (0, 255, 0), 2)
                
                processed_predictions.append({
                    "class": detection['class'],
                    "confidence": detection['confidence'],
                    "x": x,
                    "y": y,
                    "width": width,
                    "height": height
                })
            
            # 処理済みフレームをBase64エンコード
            _, buffer = cv2.imencode('.jpg', frame)
            image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # JSON レスポンスを返す
            response_data = {
                "status": "success",
                "predictions": processed_predictions,
                "image": image_base64
            }
            
            logger.debug("Sending response")
            return jsonify(response_data)
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}", exc_info=True)
            return jsonify({
                "status": "error",
                "message": str(e),
                "type": "processing_error"
            }), 500

    # GETリクエストの場合
    return jsonify({"status": "error", "message": "GET method not supported"}), 405

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)