const input = document.getElementById("item-input");
const button = document.getElementById("recommend-btn");
const statusText = document.getElementById("status");
const resultsGrid = document.getElementById("results-grid");
const totalResults = document.getElementById("total-results");
const topRating = document.getElementById("top-rating");
const quickButtons = document.querySelectorAll(".quick-btn");

const API_BASE = "";

const showStatus = (message, isError = false) => {
  statusText.textContent = message;
  statusText.style.color = isError ? "#fecdd3" : "#dcd6ff";
};

const setLoading = () => {
  resultsGrid.innerHTML = `
    <div class="loading">
      <p>Analyzing movie similarity and generating recommendations...</p>
    </div>
  `;
};

const safeRating = (rating) => {
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1) : "N/A";
};

const safeScore = (score) => {
  const value = Number(score);
  return Number.isFinite(value) ? value.toFixed(3) : "N/A";
};

const createCard = (movie, index) => {
  const card = document.createElement("article");
  card.className = "result-card";

  const genres = movie.genres || "Genre not available";
  const rating = safeRating(movie.rating);
  const score = safeScore(movie.score);

  card.innerHTML = `
    <div class="rank">#${index + 1}</div>
    <h3 class="card-title">${movie.title || "Untitled Movie"}</h3>

    <div class="card-meta">
      <span class="card-badge">🎭 ${genres}</span>
      <span class="card-badge">⭐ Rating: ${rating}</span>
      <span class="card-badge">📊 Score: ${score}</span>
    </div>

    <p class="card-note">
      ${movie.note || "Recommended based on content similarity and movie features."}
    </p>
  `;

  return card;
};

const updateStats = (movies) => {
  totalResults.textContent = movies.length;

  if (!movies.length) {
    topRating.textContent = "--";
    return;
  }

  const ratings = movies
    .map((movie) => Number(movie.rating))
    .filter((rating) => Number.isFinite(rating));

  topRating.textContent = ratings.length ? Math.max(...ratings).toFixed(1) : "--";
};

const renderResults = (movies) => {
  resultsGrid.innerHTML = "";

  if (!Array.isArray(movies) || movies.length === 0) {
    updateStats([]);
    showStatus("No recommendations found. Try another movie title.", true);
    return;
  }

  movies.forEach((movie, index) => {
    resultsGrid.appendChild(createCard(movie, index));
  });

  updateStats(movies);
  showStatus("Recommendations generated successfully. Scroll down to view results.");
};

const fetchRecommendations = async (query) => {
  const url = `${API_BASE}/recommend/${encodeURIComponent(query)}`;

  try {
    setLoading();
    showStatus(`Finding best recommendations for "${query}"...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Movie not found or recommendation engine is unavailable.");
    }

    const data = await response.json();
    renderResults(data);
  } catch (error) {
    updateStats([]);
    resultsGrid.innerHTML = "";
    showStatus(error.message || "Failed to fetch recommendations.", true);
  }
};

button.addEventListener("click", () => {
  const query = input.value.trim();

  if (!query) {
    showStatus("Please enter a movie title first.", true);
    input.focus();
    return;
  }

  fetchRecommendations(query);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    button.click();
  }
});

quickButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    input.value = btn.dataset.title;
    fetchRecommendations(btn.dataset.title);
  });
});