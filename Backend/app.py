import os
from flask import Flask, jsonify
from models.recommender import MovieRecommender

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DATA_PATH = os.path.join(DATA_DIR, 'movies.csv')
recommender = MovieRecommender(DATA_PATH)


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Movie Recommender API',
        'usage': 'Use /recommend/<movie_name> to get recommendations',
        'example': '/recommend/Inception'
    })


@app.route('/recommend/<item>', methods=['GET'])
def recommend(item):
    recommendations = recommender.get_recommendations(item)
    return jsonify(recommendations)


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    return response


# ✅ IMPORTANT FIX FOR RENDER
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)