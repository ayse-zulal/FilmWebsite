import { useEffect, useState } from "react";
import Question from "./components/Question";
import Results from "./components/Results";
import type { Movie, QuestionType } from "./types";
import "./index.css";

const questions: QuestionType[] = [
  { q: "Which genre?", options: ["action", "romance"] },
  { q: "Age rating?", options: ["pg13", "r18"] },
  { q: "Tone?", options: ["comedy", "drama"] }
];

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetch("/movies.json")
      .then((res) => res.json())
      .then((data: Movie[]) => setMovies(data));
  }, []);

  const handleSelect = (tag: string) => {
    setAnimating(true);
    setSelectedTags((prev) => [...prev, tag]);

    setTimeout(() => {
      setAnimating(false);
      setCurrent((prev) => prev + 1);
    }, 400); 
  };

  return (
    <div className="app">
      <h1>Find Films With Filmer</h1>

      {current < questions.length ? (
        <Question
          question={questions[current].q}
          options={questions[current].options}
          onSelect={handleSelect}
          animating={animating}
        />
      ) : (
        <Results movies={movies} selectedTags={selectedTags} />
      )}
      <button className="option-restart-btn" onClick={() => { setCurrent(0); setSelectedTags([]); }}>Restart</button>
    </div>
  );
}

export default App;
