import { useEffect, useState } from "react";

type Fic = {
  id: number;
  title: string;
  author: string;
  tags: string[];
  summary: string;
  description: string;
  url: string;
  cover_url: string;
  created_at: string;
};

type Props = {
  selectedTags: string[];
};

function Results({ selectedTags }: Props) {
  const [fics, setFics] = useState<Fic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFics = async () => {
      try {
        let url = "http://localhost:3000/fics";
        if (selectedTags.length > 0) {
          url += `?tags=${selectedTags.join(",")}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setFics(data.fics || []);
      } catch (err) {
        console.error("Error fetching fics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFics();
  }, [selectedTags]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="results-container">
      <h2 className="results-title">Sonuçlar</h2>

      {selectedTags.length > 0 && (
        <p className="results-filters">
          Aşağıdaki etiketlerle eşleşen ficler gösteriliyor:{" "}
          <span className="filter-tags">{selectedTags.join(", ")}</span>
        </p>
      )}

      {fics.length === 0 ? (
        <p className="no-results">Eşleşen fic bulunamadı.</p>
      ) : (
        <div className="movies-grid">
          {fics.map((fic) => (
            <div key={fic.id} className="movie-card">
              {fic.cover_url && (
                <img
                  src={fic.cover_url}
                  alt={fic.title}
                  className="movie-cover"
                />
              )}
              <div className="movie-info">
                <h3 className="movie-title">{fic.title}</h3>
                <p className="movie-author">by {fic.author}</p>
                {fic.summary && <p className="movie-desc">{fic.summary}</p>}
                {fic.description && (
                  <p className="movie-comment">“{fic.description}”</p>
                )}
                <div className="movie-tags">
                  {fic.tags?.map((tag) => (
                    <span key={tag} className="movie-tag">#{tag}</span>
                  ))}
                </div>
                {fic.url && (
                  <a
                    href={fic.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="read-story-btn"
                  >
                    📖 Read Story
                  </a>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Results;
