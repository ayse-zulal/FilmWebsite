// App.tsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Question from "./components/Question";
import Results from "./components/Results";
import type { QuestionType } from "./types";
import "./index.css";
import logo from "./assets/fic.png";
import Chatbot from "./components/ChatBot";
import CreateFiction from "./CreateFiction";

const questions: QuestionType[] = [
  { q: "Which genre?", options: ["action", "sci-fi", "fantasy"] },
   
];

const MainMenu = () => {
  return (
    <div className="app">
      <div className="menu-options">
        <button className="menu-btn" onClick={() => {window.location.href="/quickfind"}}>Hızlı Bul</button>
        <button className="menu-btn" onClick={() => {window.location.href="/chat"}}>AI Sohbet</button>
        <button className="menu-btn" onClick={() => {window.location.href="/createfic"}}>Kurgu Ekle</button>
      </div>
    </div>
  );
};

const QuickFind = () => {
  const [current, setCurrent] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);

  const handleSelect = (tag: string) => {
    setAnimating(true);
    setSelectedTags((prev) => [...prev, tag]);

    setTimeout(() => {
      setAnimating(false);
      setCurrent((prev) => prev + 1);
    }, 400); 
  };

  return (
    <>
      {current < questions.length ? (
        <Question
          question={questions[current].q}
          options={questions[current].options}
          onSelect={handleSelect}
          animating={animating}
        />
      ) : (
        <Results selectedTags={selectedTags} />
      )}
      <div style={{display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "20px"}}>
        <button className="option-restart-btn" onClick={() => { setCurrent(0); setSelectedTags([]); }}>Başa Dön</button>
        <Link to="/"><button className="back-menu-btn">Ana Sayfa</button></Link>
      </div>
    </>
  );
};


function App() {
  return (
    <Router>
      <div className="app">
        <img src={logo} alt="Film App Logo" className="logo" />
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/quickfind" element={<QuickFind />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/createfic" element={<CreateFiction />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;