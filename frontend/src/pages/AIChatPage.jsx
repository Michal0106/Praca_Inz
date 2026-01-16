import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import Layout from "../components/Layout";
import { aiAPI } from "../services/api";
import "./AIChatPage.css";

const SAMPLE_PROMPTS = [
  "Biorąc pod uwagę moje ostatnie aktywności czy bezpiecznie będzie pobiec maraton?",
  "Czy moje ostatnie treningi przygotowują mnie do półmaratonu?",
  "Jakie są moje najsilniejsze i najsłabsze strony na podstawie moich ostatnich biegów?",
  "Jakie trzy konkretne rady możesz mi dać na podstawie moich ostatnich aktywności?",
];

export default function AIChatPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);


  

  const send = async (text) => {
    const messageText = text ?? prompt;
    if (!messageText || !messageText.trim()) return;

    const userMessage = { role: "user", text: messageText };
    setMessages((m) => [...m, userMessage]);
    setLoading(true);
    try {
      const res = await aiAPI.chat(messageText);
      const reply = res.data?.reply || "Brak odpowiedzi";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
      setPrompt("");
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "Błąd połączenia z AI" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="ai-chat-grid">
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-row">
              <Bot size={28} className="chat-header-icon" />
              <h2 className="chat-header-title">AI Coach</h2>
            </div>
            <div className="chat-sub">
              Zapytaj AI o ocenę na podstawie Twoich aktywności
            </div>
          </div>


          <div className="chat-window" ref={chatRef}>
            {messages.length === 0 && (
              <div className="empty">Rozpocznij rozmowę — przykładowe pytania po prawej.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="msg-role">{m.role === 'user' ? 'Ty' : 'AI'}</div>
                <div className="msg-text">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg assistant">
                <div className="msg-role">AI</div>
                <div className="msg-text loading-dots"><span></span><span></span><span></span></div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Napisz tutaj swoje pytanie..."
            />
            <button onClick={() => send()} disabled={loading}>{loading ? 'Wysyłanie...' : 'Wyślij'}</button>
          </div>
        </div>

        <aside className="chat-sidebar">
          <div className="examples">
            <h4>Przykłady</h4>
            {SAMPLE_PROMPTS.map((p) => (
              <button key={p} className="example" onClick={() => send(p)}>{p}</button>
            ))}
          </div>

          <div className="notes">
            <h4>Uwaga</h4>
            <p>AI używa TYLKO danych z Twojego konta. Jeśli nie masz aktywności, AI poprosi o dodatkowe informacje.</p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
