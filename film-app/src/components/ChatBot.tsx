import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const FicCard: React.FC<{ message: string }> = ({ message }) => {
  const lines = message.split('\n');

  const extractInfo = (key: string) => {
    const line = lines.find(l => l.includes(`**${key}:**`));
    return line ? line.split(`**${key}:**`)[1].trim() : '';
  };
  
  const title = extractInfo('Başlık');
  const author = extractInfo('Yazar');
  const summary = extractInfo('Özet');
  const url = extractInfo('URL');


  const cleanTitle = title.replace(/\*+/g, '').trim();

  return (
    <div style={{
      fontFamily: 'sans-serif',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      margin: '20px auto',
      maxWidth: '500px',
      border: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <h2 style={{
          margin: '0',
          fontSize: '1.5rem',
          color: '#5f0e0d'
        }}>{cleanTitle}</h2>
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '1rem',
          color: '#888'
        }}>Yazar: {author}</p>
      </div>
      
      <div style={{
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #eee'
      }}>
        <p style={{
          margin: '0',
          fontSize: '0.9rem',
          color: '#555',
          lineHeight: '1.5'
        }}>
          <strong>Özet:</strong> {summary}
        </p>
      </div>

      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'none',
          alignSelf: 'center'
        }}
      >
        <button style={{
          padding: '10px 20px',
          borderRadius: '25px',
          border: 'none',
          backgroundColor: '#5f0e0d',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#99948e'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = '#5f0e0d'}
        >
          Hikayeyi Oku
        </button>
      </a>
    </div>
  );
};

const API_BASE_URL = "http://localhost:3000";

const parseMarkdown = (text: string) => {
  let html = text;

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\* (.*)/g, '<li style="margin-left: 20px;">$1</li>');

  html = html.replace(/\n/g, '<br/>');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

interface Message {
  sender: "user" | "ai";
  type: "text" | "fic";
  content: string; 
}


const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const effectRan = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (effectRan.current) {
        return;
    }
    effectRan.current = true;
    const initConversation = async () => {
      const storedId = localStorage.getItem("conversationId");
      if (storedId) { setConversationId(Number(storedId)); return; }

      try {
        const res = await axios.post(`${API_BASE_URL}/conversation`);
        const newId = res.data.conversation.id;
        setConversationId(newId);
        localStorage.setItem("conversationId", newId.toString());
      } catch (err) {
        console.error("Conversation oluşturulamadı", err);
      }
    };
    initConversation();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || conversationId === null) return;

    const messageToSend = input;
    setMessages(prev => [...prev, { sender: "user", type: "text", content: messageToSend }]);
    setInput("");

    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, { conversationId, message: messageToSend });
      const aiReplyText = res.data.reply;

      const ficIds = extractIdsFromReply(aiReplyText);

      const cleanedReply = aiReplyText.replace(/id:\d+/g, "").trim();

      const newMessages: Message[] = [];

      if (cleanedReply.length > 0) {
        newMessages.push({ sender: "ai", type: "text", content: cleanedReply });
      }

      if (ficIds.length > 0) {
        const ficRes = await axios.get(`${API_BASE_URL}/fics/list`, {
          params: { ids: ficIds.join(",") }
        });

        const fics = ficRes.data; 
        const ficMessages = fics.map((fic: any) => ({
          sender: "ai",
          type: "fic",
          content: `**Başlık:** ${fic.title}
            **Yazar:** ${fic.author}
            **Özet:** ${fic.summary}
            **URL:** ${fic.url}`
        }));

        newMessages.push(...ficMessages);
      }

      setMessages(prev => [...prev, ...newMessages]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: "ai", type: "text", content: "Bir hata oluştu." }]);
    }
  };



  const handleBackToMenu = () => {
    localStorage.removeItem("conversationId");
  };
  {console.log(messages)}

  return (
    <div style={{ maxWidth: "600px", margin: "auto", border: "1px solid #5f0e0d", borderRadius: "10px", padding: "20px", backgroundColor: "#f2efe6", display: "flex", flexDirection: "column", height: "70vh" }}>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "10px 0" }}>
            {msg.type === "fic" ? (
              <FicCard message={msg.content} />
            ) : (
              <span style={{
                display: "inline-block",
                padding: "10px 15px",
                borderRadius: "20px",
                backgroundColor: msg.sender === "user" ? "#5f0e0d" : "#99948e",
                color: msg.sender === "user" ? "white" : "black",
                maxWidth: "80%",
                wordWrap: "break-word"
              }}>
                {parseMarkdown(msg.content)}
              </span>
            )}
          </div>
        ))}

        <div ref={messagesEndRef}></div>
      </div>

      <div style={{ display: "flex", gap: "10px"}}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => { if (e.key === "Enter") sendMessage(); }}
          placeholder="Mesaj yaz..."
          style={{ flex: 1, padding: "10px 15px", width: "100px", borderRadius: "20px", border: "1px solid #ccc", outline: "none" }}
        />
        <button onClick={sendMessage} style={{ padding: "10px 20px", borderRadius: "20px", border: "none", backgroundColor: "#5f0e0d", color: "white", cursor: "pointer" }}>Gönder</button>
      </div>
      <Link to="/" onClick={handleBackToMenu}>
        <button className="back-menu-btn">Menüye Dön</button>
      </Link>
    </div>
  );
};

const extractIdsFromReply = (reply: string) => {
  const regex = /\(id:\s*(\d+)\)/g;
  const ids: number[] = [];
  let match;
  while ((match = regex.exec(reply)) !== null) {
    ids.push(Number(match[1]));
  }
  return ids;
};


export default Chatbot;
