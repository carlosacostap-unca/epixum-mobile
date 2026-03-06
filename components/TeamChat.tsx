"use client";

import { useEffect, useState, useRef } from "react";
import pb from "@/lib/pocketbase";
import { Message, User } from "@/types";

interface TeamChatProps {
  teamId: string;
  currentUser: User;
}

export default function TeamChat({ teamId, currentUser }: TeamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const result = await pb.collection("messages").getList<Message>(1, 50, {
        filter: `team = "${teamId}"`,
        sort: "created",
        expand: "sender",
        requestKey: null, // Disable auto-cancellation
      });
      setMessages(result.items);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [teamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const data = {
        text: newMessage,
        sender: currentUser.id,
        team: teamId,
      };
      await pb.collection("messages").create(data);
      setNewMessage("");
      await fetchMessages(); // Refresh immediately after sending
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar el mensaje. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">
            Chat del Equipo
          </h3>
        </div>
        <button
          onClick={fetchMessages}
          title="Recargar mensajes"
          className="p-2 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg
            className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-zinc-400 animate-pulse">
            Cargando mensajes...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-zinc-400 text-sm p-8 text-center">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p>No hay mensajes aún.</p>
            <p>¡Saluda a tu equipo!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {!isMe && (
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 overflow-hidden shrink-0">
                            {msg.expand?.sender?.avatar ? (
                                <img 
                                    src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(/\/$/, "")}/api/files/${msg.expand.sender.collectionId}/${msg.expand.sender.id}/${msg.expand.sender.avatar}`} 
                                    alt={msg.expand.sender.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                msg.expand?.sender?.name?.charAt(0).toUpperCase() || "?"
                            )}
                        </div>
                    )}
                    
                    <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                        isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-bl-none"
                    }`}
                    >
                    {!isMe && (
                        <p className="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        {msg.expand?.sender?.name || "Usuario"}
                        </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                </div>
                <span className={`text-[10px] mt-1 px-1 ${isMe ? "text-right mr-8 text-zinc-400" : "text-left ml-8 text-zinc-400"}`}>
                    {new Date(msg.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 backdrop-blur-sm flex gap-2 rounded-b-2xl">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-600/20"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
