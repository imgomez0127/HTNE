import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import torch
from models.lstm import get_weights, LSTM, filter_text

app = Flask(__name__)
CORS(app)

emotions = ["angry", "happy", "sad"]
emotion_mapping = {i: emotion for i, emotion in enumerate(emotions)}

with open("./models/mapping.json") as f:
    vocab_map = json.load(f)
_, weights = get_weights("./models/data/glove.6B.50d.txt",
                         vocab_map.keys(),
                         add_zero=True)

weights = torch.from_numpy(weights)
model = LSTM(weights, len(emotions), device=torch.device('cpu'), hidden_size=256)
model.load("./models/model.pt", map_location=torch.device('cpu'))

spotify_key = "INSERT KEY HERE"

@app.route("/", methods=["POST"])
def sentiment():
    print(request.json)
    print(request.data)
    text = request.json['text']
    text = [[vocab_map.get(word, len(vocab_map)) for word in filter_text(text)]]
    text = torch.Tensor(text).long()
    emotion = torch.argmax(model(text)).item()
    return jsonify({"emotion": emotion_mapping[emotion]})

@app.route("/get-song", methods=["POST"])
def get_song():
    emotion = request.json['emotion']
    return jsonify({"song-link":"INSERT LINK"})

if __name__ == "__main__":
    app.run(host="localhost", port=8000, debug=True)
