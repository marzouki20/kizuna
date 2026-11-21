import { useEffect, useRef, useState } from "react";
import { Bot, Eraser, Leaf, MessageCircle, Send, X } from "lucide-react";
import "./AssistantChat.css";

const suggestions = [
  "Analyze my farm health",
  "Show detected anomalies",
  "Explain plant diseases",
  "Give me the latest robot mission report",
];

function detectLanguage(value) {
  if (/[\u0600-\u06ff]/.test(value)) return "ar";
  if (/[àâçèéêëîïôùûüœ]/i.test(value) || /\b(les|des|une|quel|quelle|maladie|culture|olivier|tomate|bonjour|donne|montre|mes|mon|ma|est|sont|comment|pourquoi|explique|analyse|anomalies|plantes|récolte|vigne|blé)\b/i.test(value)) return "fr";
  return "en";
}

export default function AssistantChat({ context }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  async function sendMessage(text = draft) {
    const message = text.trim();
    if (!message || loading) return;
    const next = [...messages, { role: "user", content: message }];
    setMessages(next);
    setDraft("");
    setError("");
    setLoading(true);
    try {
      const selected = context.selectedPlant;
      const plantSummary = (plant, detailed = false) => ({
        id: plant.id, name: plant.name, cropType: plant.cropType, cropName: plant.cropName,
        x: plant.x, y: plant.y, status: plant.status, lastInspection: plant.lastInspection,
        simulated: true, imageAvailable: Boolean(plant.photo), imageIsIllustrative: true,
        detection: plant.detection ? {
          issueName: plant.detection.issueName, diseaseName: plant.detection.diseaseName,
          symptoms: plant.detection.symptoms, result: plant.detection.result,
          confidence: plant.detection.confidence, cropConfidence: plant.detection.cropConfidence,
          model: plant.detection.model, detectedAt: plant.detection.detectedAt,
        } : null,
        treatment: plant.treatment ? {
          suspectedProblem: plant.treatment.suspectedProblem,
          preventiveMeasures: plant.treatment.preventiveMeasures,
          recommendedActions: plant.treatment.recommendedActions,
          authorizedUse: plant.treatment.authorizedUse,
        } : null,
        ...(detailed ? { history: plant.history || [] } : {}),
      });
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          language: detectLanguage(message),
          history: next.slice(0, -1).slice(-12),
          context: { ...context, plants: context.plants.map((plant) => plantSummary(plant)), selectedPlant: selected ? plantSummary(selected, true) : null },
          image_data_url: null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 503) {
          const lang = detectLanguage(message);
          const configMessage = {
            en: "AI provider is not configured. Set ROBOCORE_AI_PROVIDER, ROBOCORE_AI_CHAT_COMPLETIONS_URL, ROBOCORE_AI_API_KEY, and ROBOCORE_AI_MODEL in the backend environment.",
            fr: "Le fournisseur IA n’est pas configuré. Définissez ROBOCORE_AI_PROVIDER, ROBOCORE_AI_CHAT_COMPLETIONS_URL, ROBOCORE_AI_API_KEY et ROBOCORE_AI_MODEL dans l’environnement du backend.",
            ar: "مزود الذكاء الاصطناعي غير مُعدّ. عيّن ROBOCORE_AI_PROVIDER وROBOCORE_AI_CHAT_COMPLETIONS_URL وROBOCORE_AI_API_KEY وROBOCORE_AI_MODEL في بيئة الخادم الخلفي.",
          };
          throw new Error(configMessage[lang]);
        }
        throw new Error(result.detail || "The assistant service is unavailable. Please try again.");
      }
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    } catch (exception) {
      setError(exception.message || "Could not reach RoboCore AI Assistant.");
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setMessages([]);
    setError("");
    setDraft("");
  }

  return <>
    <button className={`assistant-launcher ${open ? "is-open" : ""}`} onClick={() => setOpen((value) => !value)} aria-label={open ? "Close RoboCore AI Assistant" : "Open RoboCore AI Assistant"}>
      {open ? <X size={23} /> : <><Bot size={24} /><span className="assistant-launcher-label">Ask RoboCore AI</span></>}
    </button>
    {open && <section className="assistant-panel" aria-label="RoboCore AI Assistant">
      <header className="assistant-header"><div className="assistant-brand"><div className="assistant-logo"><Leaf size={22} /></div><div><h2>RoboCore AI Assistant</h2><p>Multi-crop agricultural support</p></div></div><div className="assistant-actions">
        <button onClick={clearConversation} aria-label="Clear conversation" title="Clear conversation"><Eraser size={17} /></button>
        <button onClick={() => setOpen(false)} aria-label="Close chat"><X size={19} /></button>
      </div></header>
      <div className="assistant-messages" aria-live="polite">
        <div className="assistant-welcome"><span className="assistant-bot-mark"><Bot size={18} /></span><div><strong>Welcome to RoboCore AI Assistant</strong><p>Ask about crop health, plant records, anomalies, or your robot mission. Farm and robot readings in this app are simulated.</p></div></div>
        {messages.length === 0 && <div className="assistant-suggestions"><span>Try asking</span>{suggestions.map((question) => <button key={question} onClick={() => sendMessage(question)}>{question}</button>)}</div>}
        {messages.map((item, index) => <div className={`assistant-message ${item.role}`} key={`${index}-${item.role}`}><span className="assistant-message-icon">{item.role === "assistant" ? <Bot size={16} /> : "You"}</span><div className="assistant-message-content">{item.content}</div></div>)}
        {loading && <div className="assistant-message assistant"><span className="assistant-message-icon"><Bot size={16} /></span><div className="assistant-typing"><i /><i /><i /></div></div>}
        {error && <div className="assistant-error" role="alert"><strong>Assistant unavailable</strong><p>{error}</p><small>Configure the AI provider on the FastAPI backend. No generated answer was returned.</small></div>}
        <div ref={endRef} />
      </div>
      <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
        <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={context.selectedPlant ? `Ask about ${context.selectedPlant.id}…` : "Ask about your crops…"} maxLength={4000} aria-label="Message RoboCore AI Assistant" />
        <button type="submit" disabled={!draft.trim() || loading} aria-label="Send message"><Send size={18} /></button>
      </form>
      <footer className="assistant-footnote"><MessageCircle size={12} /> Read-only assistant · Verify uncertain findings with an agronomist</footer>
    </section>}
  </>;
}
