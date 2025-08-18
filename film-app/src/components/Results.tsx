import type { Movie } from "../types";

type Props = {
  movies: Movie[];
  selectedTags: string[];
};

function Results({ movies, selectedTags }: Props) {
  const filtered = movies.filter((m) => {
  const match = selectedTags.every((tag) => m.tags.includes(tag));
  console.log("Movie tags:", m.tags, "Selected:", selectedTags, "Match:", match);
  return match;
});

console.log("Filtered movies:", filtered);


  return (
    <div className="results-container">
      <h2 className="results-title">Results</h2>

      {selectedTags.length > 0 && (
        <p className="results-filters">
          Showing movies that match:{" "}
          <span className="filter-tags">{selectedTags.join(", ")}</span>
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="no-results">No matching movies found.</p>
      ) : (
        <div className="movies-grid">
          {filtered.map((m) => (
            <div key={m.title} className="movie-card">
              <img src={m.cover} alt={m.title} className="movie-cover" />
              <div className="movie-info">
                <h3 className="movie-title">{m.title}</h3>
                <p className="movie-desc">{m.description}</p>
                <p className="movie-comment">“{m.comment}”</p>
                <div className="movie-tags">
                  {m.tags.map((tag) => (
                    <span key={tag} className="movie-tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Results;
