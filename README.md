# FilmWebsite
## 🎬 Movie Recommender (React)

A simple React application.
The user answers a few binary questions (e.g., Action or Romance?, 18+ or Family-friendly?).
Based on the selected tags, the app filters a static movie list and displays the matching movies.

## 🚀 Features

Built with React + Vite

Movies are loaded from a JSON file (no backend, fully frontend)

Questions are displayed step by step

Movies are filtered according to selected tags

Styled with plain CSS for simplicity

## 📂 Project Structure
film-app/
  public/
    movies.json   # Movie list (sample data)
  src/
    components/
      Question.jsx
      Results.jsx
    App.jsx
    index.css
    main.jsx

## 🔧 Setup

To run locally:

# Clone the repo
git clone https://github.com/ayse-zulal/FilmWebsite.git
cd FilmWebsite

# Install dependencies
npm install

# Start development server
npm run dev


Then open http://localhost:5173 in your browser.
