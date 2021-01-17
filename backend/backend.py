import base64
import json
from random import shuffle
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import numpy as np
import torch
from models.lstm import get_weights, LSTM, filter_text

app = Flask(__name__)
CORS(app)

emotions = ["angry", "happy", "sad"]
emotion_mapping = {i: emotion for i, emotion in enumerate(emotions)}

with open("./models/mapping.json") as f:
    vocab_map = json.load(f)
weights = np.zeros((len(vocab_map)+1, 50))

weights = torch.from_numpy(weights)
model = LSTM(weights, len(emotions), device=torch.device('cpu'), hidden_size=256)
model.load("./models/model.pt", map_location=torch.device('cpu'))

spotify_key = "764915ada4714643a561bb17286a9882:5f33e816137f43c2979824f69987c63e"
key_bytes = spotify_key.encode("ascii")
key_b64 = base64.b64encode(key_bytes)
key_repr = key_b64.decode("ascii")
auth = "Basic " + key_repr
auth_key = ""
def authorize_spotify():
    headers = {
        "Authorization": auth,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    payload = [("grant_type","client_credentials")]
    r = requests.post(
        "https://accounts.spotify.com/api/token",
        headers=headers,
        data=payload
    )
    return r.json()["access_token"]

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
    url  = f'https://api.spotify.com/v1/search?q=${emotion} playlist&type=playlist&limit=5'
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + auth_key
    }
    r = requests.get(url, headers=headers)
    items = r.json()['playlists']['items']
    shuffle(items)
    playlist = items[0]["external_urls"]["spotify"]
    return jsonify({"song-link":playlist})

if __name__ == "__main__":
    auth_key = authorize_spotify()
    app.run(host="localhost", port=8000, debug=True)
