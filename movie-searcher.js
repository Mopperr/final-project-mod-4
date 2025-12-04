// Movie Searcher - JavaScript

// DOM Elements
const movieInput = document.getElementById('movieInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const detailedResults = document.getElementById('detailedResults');
const simpleResults = document.getElementById('simpleResults');
const movieModal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close-modal');

// OMDB API Key - You'll need to get your own free API key from http://www.omdbapi.com/apikey.aspx
const API_KEY = 'f8fe875';

// Event Listeners
searchBtn.addEventListener('click', searchMovies);
movieInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

// Modal event listeners
closeModal.addEventListener('click', () => {
    movieModal.classList.add('hidden');
});

movieModal.addEventListener('click', (e) => {
    if (e.target === movieModal) {
        movieModal.classList.add('hidden');
    }
});

// Main search function
async function searchMovies() {
    const searchTerm = movieInput.value.trim();
    
    if (!searchTerm) {
        showError('Please enter a movie title');
        return;
    }

    // Show loading, hide error and results
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    detailedResults.innerHTML = '';
    simpleResults.innerHTML = '';

    try {
        // Search for movies
        const searchUrl = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie`;
        console.log('Searching:', searchUrl);
        
        const searchResponse = await fetch(searchUrl);
        console.log('Search response status:', searchResponse.status);
        
        const searchData = await searchResponse.json();
        console.log('Search data:', searchData);

        if (searchData.Response === 'False') {
            throw new Error(searchData.Error || 'No movies found');
        }

        // Get first 6 movies
        const movies = searchData.Search.slice(0, 6);
        console.log('Found movies:', movies.length);
        
        // Fetch detailed information for all 6 movies
        const movieDetailsPromises = movies.map(movie => 
            fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}&plot=full`)
                .then(res => res.json())
        );

        const movieDetails = await Promise.all(movieDetailsPromises);

        // Display first 3 with full details
        const detailedMovies = movieDetails.slice(0, 3);
        detailedMovies.forEach(movie => {
            displayDetailedMovie(movie);
        });

        // Display movies 4-6 with simple info
        const simpleMovies = movieDetails.slice(3, 6);
        simpleMovies.forEach(movie => {
            displaySimpleMovie(movie);
        });

        // Hide loading and show results
        loading.classList.add('hidden');
        resultsDiv.classList.remove('hidden');

    } catch (error) {
        loading.classList.add('hidden');
        showError(error.message);
    }
}

// Display detailed movie card (first 3 movies)
function displayDetailedMovie(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card-detailed';
    
    const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x400?text=No+Poster';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.Title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/300x400?text=No+Poster'">
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <p class="movie-year">${movie.Year} • ${movie.Rated} • ${movie.Runtime}</p>
            
            <div class="movie-details">
                <p class="movie-detail-item">
                    <span class="movie-detail-label">Genre:</span> ${movie.Genre}
                </p>
                <p class="movie-detail-item">
                    <span class="movie-detail-label">Director:</span> ${movie.Director}
                </p>
                <p class="movie-detail-item">
                    <span class="movie-detail-label">Actors:</span> ${movie.Actors}
                </p>
                <p class="movie-detail-item">
                    <span class="movie-detail-label">IMDb Rating:</span> ${movie.imdbRating}/10
                </p>
                ${movie.Awards !== 'N/A' ? `
                <p class="movie-detail-item">
                    <span class="movie-detail-label">Awards:</span> ${movie.Awards}
                </p>
                ` : ''}
            </div>
            
            ${movie.Plot !== 'N/A' ? `
            <p class="movie-plot">${movie.Plot}</p>
            ` : ''}
        </div>
    `;
    
    detailedResults.appendChild(card);
}

// Display simple movie card (movies 4-6)
function displaySimpleMovie(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card-simple';
    card.onclick = () => openModal(movie);
    
    const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x400?text=No+Poster';
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.Title}" class="movie-poster-small" onerror="this.src='https://via.placeholder.com/300x400?text=No+Poster'">
        <div class="movie-info-simple">
            <h3 class="movie-title">${movie.Title}</h3>
            <p class="movie-year">${movie.Year} • ${movie.Rated}</p>
            <p class="movie-detail-item">
                <span class="movie-detail-label">Genre:</span> ${movie.Genre}
            </p>
            <p class="movie-detail-item">
                <span class="movie-detail-label">IMDb:</span> ${movie.imdbRating}/10
            </p>
            <p style="margin-top: 1rem; color: #8b6f47; font-weight: 600; cursor: pointer;">
                Click to view details →
            </p>
        </div>
    `;
    
    simpleResults.appendChild(card);
}

// Open modal with full movie details
function openModal(movie) {
    const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x400?text=No+Poster';
    
    modalBody.innerHTML = `
        <div class="movie-card-detailed">
            <img src="${posterUrl}" alt="${movie.Title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/300x400?text=No+Poster'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year} • ${movie.Rated} • ${movie.Runtime}</p>
                
                <div class="movie-details">
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Genre:</span> ${movie.Genre}
                    </p>
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Director:</span> ${movie.Director}
                    </p>
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Actors:</span> ${movie.Actors}
                    </p>
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Writer:</span> ${movie.Writer}
                    </p>
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Language:</span> ${movie.Language}
                    </p>
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Country:</span> ${movie.Country}
                    </p>
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">IMDb Rating:</span> ${movie.imdbRating}/10 (${movie.imdbVotes} votes)
                    </p>
                    ${movie.Metascore !== 'N/A' ? `
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Metascore:</span> ${movie.Metascore}/100
                    </p>
                    ` : ''}
                    ${movie.BoxOffice !== 'N/A' ? `
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Box Office:</span> ${movie.BoxOffice}
                    </p>
                    ` : ''}
                    ${movie.Awards !== 'N/A' ? `
                    <p class="movie-detail-item">
                        <span class="movie-detail-label">Awards:</span> ${movie.Awards}
                    </p>
                    ` : ''}
                </div>
                
                ${movie.Plot !== 'N/A' ? `
                <p class="movie-plot">${movie.Plot}</p>
                ` : ''}
            </div>
        </div>
    `;
    
    movieModal.classList.remove('hidden');
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
}

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

console.log('Movie Searcher initialized! 🎬');
console.log('Please add your OMDB API key to the API_KEY variable');
console.log('Get a free API key at: http://www.omdbapi.com/apikey.aspx');
