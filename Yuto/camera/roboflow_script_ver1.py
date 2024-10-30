import cv2
from roboflow import Roboflow

# RoboflowのAPIキーとモデル情報
rf = Roboflow(api_key="X6ALu0a2v4EeuHuJoa0V")
workspace = rf.workspace()
print("ワークスペースが読み込まれました:", workspace)

project = workspace.project("jpdtwd")
print("プロジェクトが読み込まれました:", project)

model = project.version(2).model
if model is None:
    print("モデルが読み込まれませんでした。")
else:
    print("モデルが正常に読み込まれました。")

# カメラのキャプチャ開始
cap = cv2.VideoCapture(1)  # '0'はデフォルトのカメラを指定

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # OpenCVでフレームを画像として保存
    cv2.imwrite("current_frame.jpg", frame)

    # Roboflowで予測を行う
    prediction = model.predict("current_frame.jpg", confidence=40, overlap=30).json()
    print(prediction)  # 予測結果を表示

    # 予測結果に基づいて矩形を描画（例）
    for detection in prediction['predictions']:
        x = int(detection['x'] - detection['width'] / 2)
        y = int(detection['y'] - detection['height'] / 2)
        width = int(detection['width'])
        height = int(detection['height'])
        label = detection['class']

        # 検出されたオブジェクトに枠とラベルを追加
        cv2.rectangle(frame, (x, y), (x + width, y + height), (0, 255, 0), 2)
        cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # フレームを表示
    cv2.imshow("Camera", frame)

    # 'q'キーで終了
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# リソースを解放
cap.release()
cv2.destroyAllWindows()
