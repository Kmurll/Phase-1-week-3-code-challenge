// URL of the server endpoint to fetch movie data
const filmsUrl = "http://localhost:3000/films"

// References to various DOM elements
const movieInfoContainer = document.getElementById("movieInfo")
const filmsList = document.getElementById("films")
const buyTicketBtn = document.getElementById("buyTicketBtn")

// Variable to keep track of the currently displayed movie
let currentMovie;

// Function to fetch movies data from the server asynchronously
async function fetchMovies() {
  try {
    const response = await fetch(filmsUrl)
    const movies = await response.json()
    return movies
  } catch (error) {
    console.error("Error fetching movies:", error)
  }
}

// Function to display the movie details on the right side of the page
function displayMovieDetails(movie) {
  const availableTickets = movie.capacity - movie.tickets_sold
  currentMovie = movie

  movieInfoContainer.innerHTML = `
    <h3>${movie.title}</h3>
    <img src="${movie.poster}" alt="${movie.title} Poster">
    <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
    <p><strong>Showtime:</strong> ${movie.showtime}</p>
    <p><strong>Available Tickets:</strong> ${availableTickets}</p>
    <p>${movie.description}</p>
  `

  buyTicketBtn.disabled = availableTickets === 0
}

// Function to handle movie selection from the left-side menu
function handleMovieSelection(movie) {
  displayMovieDetails(movie);

  const allFilms = document.querySelectorAll(".film");
  allFilms.forEach((film) => film.classList.remove("selected"));
  this.classList.add("selected");
}

// Function to update the number of tickets sold and display the updated movie details
async function buyTicket(movie) {
  const updatedTicketsSold = movie.tickets_sold + 1;

  try {
    const response = await fetch(`${filmsUrl}/${movie.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tickets_sold: updatedTicketsSold }),
    })

    if (!response.ok) {
      throw new Error("Failed to update tickets_sold on the server.")
    }

    movie.tickets_sold = updatedTicketsSold;
    displayMovieDetails(movie)
  } catch (error) {
    console.error("Error buying a ticket:", error)
  }
}

// Function to handle film deletion from the left-side menu
async function deleteFilm(movie, filmItem) {
  try {
    const response = await fetch(`${filmsUrl}/${movie.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete the film on the server.")
    }

    filmItem.remove()

    if (currentMovie && currentMovie.id === movie.id) {
      const movies = await fetchMovies()
      displayMovieDetails(movies[0])
    }
  } catch (error) {
    console.error("Error deleting the film:", error)
  }
}

// Function to create a film item, attach a click event listener, and add a delete button
function createFilmItem(movie) {
  const filmItem = document.createElement("li")
  filmItem.classList.add("film", "item")
  filmItem.textContent = movie.title

  filmItem.addEventListener("click", handleMovieSelection.bind(filmItem, movie))

  const deleteBtn = document.createElement("button")
  deleteBtn.textContent = "Delete"
  deleteBtn.classList.add("delete-button")
  deleteBtn.addEventListener("click", (event) => {
    event.stopPropagation()
    deleteFilm(movie, filmItem)
  })

  filmItem.appendChild(deleteBtn)

  filmsList.appendChild(filmItem)
}

// Function to initialize the app and display movies in the left-side menu
async function init() {
  const movies = await fetchMovies()
  movies.forEach(createFilmItem)
  displayMovieDetails(movies[0])
}

buyTicketBtn.addEventListener("click", () => buyTicket(currentMovie))
init()
