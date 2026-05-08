import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class MovieRecommender:
    def __init__(self, csv_path: str):
        self.df = pd.read_csv(csv_path)
        self.df['genres'] = self.df['genres'].fillna('')
        self.df['description'] = self.df['description'].fillna('')
        self.df['feature'] = self.df['genres'] + ' ' + self.df['description']
        self.tfidf = TfidfVectorizer(stop_words='english')
        self.feature_matrix = self.tfidf.fit_transform(self.df['feature'])

    def _find_item_index(self, item_name: str):
        normalized = item_name.strip().lower()
        exact_match = self.df[self.df['title'].str.lower() == normalized]
        if not exact_match.empty:
            return exact_match.index[0]

        contains_match = self.df[self.df['title'].str.lower().str.contains(normalized, na=False)]
        if not contains_match.empty:
            return contains_match.index[0]

        fuzzy = self.df[self.df['title'].str.lower().str.split().apply(lambda words: normalized in ' '.join(words))]
        if not fuzzy.empty:
            return fuzzy.index[0]

        return None

    def get_recommendations(self, item_name: str, top_n: int = 6):
        idx = self._find_item_index(item_name)
        if idx is None:
            suggestions = self.df.sort_values('rating', ascending=False).head(top_n)
            return [
                {
                    'title': row['title'],
                    'genres': row['genres'],
                    'rating': float(row['rating']),
                    'score': None,
                    'note': 'Top rated suggestion'
                }
                for _, row in suggestions.iterrows()
            ]

        similarity_scores = cosine_similarity(self.feature_matrix[idx], self.feature_matrix).flatten()
        ranked_indices = similarity_scores.argsort()[::-1]
        recommended = []
        for i in ranked_indices:
            if i == idx:
                continue
            recommended.append((i, similarity_scores[i]))
            if len(recommended) >= top_n:
                break

        results = []
        for rec_idx, score in recommended:
            row = self.df.loc[rec_idx]
            results.append({
                'title': row['title'],
                'genres': row['genres'],
                'rating': float(row['rating']),
                'score': round(float(score), 3),
                'note': 'Content similarity'
            })

        return results
