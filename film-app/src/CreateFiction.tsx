import React, { useState } from "react";
import { Link } from "react-router-dom";

const AVAILABLE_TAGS = [
  "Romance",
  "Fantasy",
  "Adventure",
  "Drama",
  "Comedy",
  "Mystery",
  "Historical",
  "Music",
  "Angst",
  "Slice of Life"
];

const FicCreatePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const handleTagSelect = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const handleTagRemove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const filteredTags = AVAILABLE_TAGS.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(t)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, author, tags, summary, description, url, cover_url: coverUrl, is_completed: isCompleted };

    try {
      const res = await fetch("http://localhost:3000/fics/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Fic eklenemedi");
      alert("Fic başarıyla eklendi!");
      setTitle(""); setAuthor(""); setTags([]); setSummary(""); setDescription(""); setUrl(""); setCoverUrl(""); setIsCompleted(false);
    } catch (err) {
      console.error(err);
      alert("Hata oluştu! Bu fic çoktan mevcut.");
    }
  };

  return (
    <div className="fic-create-container">
      <h1 className="form-title">Yeni Fanfic Ekle</h1>
      <form onSubmit={handleSubmit} className="fic-form">
        <label>
          Başlık:
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Yazar:
          <input value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </label>

        <label>
          Etiketler:
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Etiket ara..."
          />
          {tagInput && filteredTags.length > 0 && (
            <ul className="tag-suggestions">
              {filteredTags.map((tag) => (
                <li key={tag} onClick={() => handleTagSelect(tag)}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </label>

        <div className="selected-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag} <button type="button" onClick={() => handleTagRemove(tag)}>x</button>
            </span>
          ))}
        </div>

        <label>
          Açıklama:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label>
          Özet veya Kişisel Yorum:
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
        </label>

        <label>
          URL:
          <input value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>

        <label>
          Kapak Fotoğrafı URL:
          <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          Quick Find mı?
        </label>

        <button type="submit" className="submit-btn">Ekle</button>
      </form>
      <Link to="/"><button className="back-menu-btn">Back to Menu</button></Link>
    </div>
  );
};

export default FicCreatePage;
