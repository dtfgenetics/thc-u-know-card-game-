import { useEffect, useState } from 'react';
import { Events } from '@thc-u-know/shared';
import { socket } from '../realtime/socket';

type ChatMessage = {
  playerId: string;
  playerName: string;
  message: string;
  createdAt: number;
};

type Props = {
  code: string;
  playerId: string;
};

export function ChatBox({ code, playerId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    function onMessage(message: ChatMessage) {
      setMessages(current => [...current.slice(-20), message]);
    }

    socket.on(Events.CHAT_RECEIVE, onMessage);
    return () => {
      socket.off(Events.CHAT_RECEIVE, onMessage);
    };
  }, []);

  function send() {
    const message = draft.trim();
    if (!message) return;
    socket.emit(Events.CHAT_SEND, { code, playerId, message });
    setDraft('');
  }

  return (
    <section className="chat-box">
      <h3>Smoke Talk</h3>
      <div className="chat-messages">
        {messages.length === 0 && <p className="muted">No messages yet.</p>}
        {messages.map(item => (
          <p key={`${item.createdAt}-${item.playerId}`}>
            <strong>{item.playerName}:</strong> {item.message}
          </p>
        ))}
      </div>
      <div className="chat-input-row">
        <input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => event.key === 'Enter' && send()} placeholder="Say something..." />
        <button type="button" onClick={send}>Send</button>
      </div>
    </section>
  );
}
