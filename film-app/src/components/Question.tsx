type Props = {
  question: string;
  options: string[];
  onSelect: (tag: string) => void;
  animating: boolean;
};

function Question({ question, options, onSelect, animating }: Props) {
  return (
    <>
      <h2>{question}</h2>
      <div className={`card ${animating ? "animating" : ""}`}>
        <div className="options-row" data-count={options.length}>
          {options.map((opt) => (
            <button
              key={opt}
              className="option-btn"
              onClick={() => !animating && onSelect(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default Question;
