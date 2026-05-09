const input = document.getElementById('item-input');
const button = document.getElementById('recommend-btn');
const status = document.getElementById('status');
const resultsGrid = document.getElementById('results-grid');

const API_BASE = '';

const createCard = (movie) => {
  const card = document.createElement('article');
  card.className = 'result-card';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = movie.title;

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.innerHTML = `
    <span class="card-badge">Genres: ${movie.genres}</span>
    <span class="card-badge">Rating: ${movie.rating.toFixed(1)}</span>
    ${movie.score !== null ? `<span class="card-badge">Score: ${movie.score}</span>` : ''}
  `;

  const note = document.createElement('p');
  note.className = 'card-note';
  note.textContent = movie.note || 'Recommended choice';

  card.append(title, meta, note);
  return card;
};

const showStatus = (message, isError = false) => {
  status.textContent = message;
  status.style.color = isError ? '#ffdddd' : '#dcd6ff';
};

const renderResults = (movies) => {
  resultsGrid.innerHTML = '';
  if (!movies.length) {
    showStatus('No recommendations were found. Try a different title.');
    return;
  }
  movies.forEach((movie) => resultsGrid.appendChild(createCard(movie)));
  showStatus('Recommendations generated successfully. Scroll for the results.');
};

const fetchRecommendations = async (query) => {
  const url = `${API_BASE}/recommend/${encodeURIComponent(query)}`;

  try {
    showStatus('Fetching recommendations…');
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Unable to reach the recommendation engine.');
    }

    const json = await response.json();
    renderResults(json);
  } catch (error) {
    showStatus(error.message, true);
    resultsGrid.innerHTML = '';
  }
};

button.addEventListener('click', () => {
  const query = input.value.trim();

  if (!query) {
    showStatus('Please enter a title to get recommendations.', true);
    return;
  }

  fetchRecommendations(query);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    button.click();
  }
});