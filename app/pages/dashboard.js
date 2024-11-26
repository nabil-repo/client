import ToolTipMenu from "../components/ToolTipMenu";
import { useContacts } from "../contacts/contacts";
import { useEffect, useRef, useState, useMemo } from "react";
import { useConversation } from "../contacts/conversationProvider";
import Image from "next/image";
import io from "socket.io-client";
import useLocalStore from "../hooks/localstore";

import user_img3 from "../images/user3.png";
import user_img4 from "../images/user4.png";
//const API_URL = process.env.ENDPOINT;

const API_URL ="https://chatting-app-server-9v6p.onrender.com";

export default function dashboard() {
  const [id, setId] = useLocalStore("id");
  // const CONVERSATION_KEY = "conversations";
  const [modalOpen, setModalOpen] = useState(false);
  // const [activeKey, setActivekey] = useState(CONVERSATION_KEY);
  const idRef = useRef();
  const nameRef = useRef();
  const { contacts = [], createContact } = useContacts();
  // const conversationsOpen = activeKey === CONVERSATION_KEY;
  const [selectedCont, selectContact] = useState(null);
  const { conversations, createConversation, addMessageToConversation } =
    useConversation();

  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  useEffect(() => {
    if (!id) return;
    const socketIo = io(API_URL, {
      query: { id: id },
    });
    setSocket(socketIo);

    socketIo.on("recive-message", ({ recipients, sender, text }) => {
      console.log("Received message:", { sender, text });
      addMessageToConversation(sender, text, sender);
    });

    return () => socketIo.disconnect();
  }, [id]);

  const selectedConversation = useMemo(() => {
    return conversations.find((conv) =>
      conv.recipients.some((recipient) => recipient.id === selectedCont)
    );
  }, [conversations, selectedCont]);

  function closeModal() {
    setModalOpen(false);
  }

  function saveCont() {
    const id = idRef.current.value;
    const name = nameRef.current.value;
    if (id && name) {
      createContact(id, name);
      createConversation(id, name);
      closeModal();
    } else {
      console.error("Invalid input for contact creation");
    }
  }

  function handleSendMessage(message) {
    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    if (!message.trim()) {
      console.warn("Cannot send an empty message");
      return;
    }

    if (selectedCont === "chatgpt") {
      addMessageToConversation(selectedCont, message, "you");
      const conversationHistory =
        selectedConversation?.messages?.map((msg) => ({
          role: msg.sender === "you" ? "user" : "assistant",
          content:
            typeof msg.message === "string"
              ? msg.message
              : JSON.stringify(msg.message),
        })) || [];

      setTimeout(() => {
        fetch(API_URL + "/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history: conversationHistory }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (typeof data.response === "string") {
              addMessageToConversation(selectedCont, data.response, "ChatGPT");
            } else {
              console.error("ChatGPT response is not a string:", data.response);
            }
          })
          .catch((error) => console.error("Error:", error));
      }, 1000);
    } else if (selectedCont) {
      socket.emit("send-msg", {
        recipients: [selectedCont],
        text: message,
      });
      console.log("sent:", message);
      addMessageToConversation(selectedCont, message, "you");
    }

    setMessage("");
  }

  useEffect(() => {
    const chatBotAdded = localStorage.getItem("chatbot-added");

    if (!chatBotAdded) {
      createConversation("chatgpt", "ChatGPT Bot");
      createContact("chatgpt", "ChatGPT Bot");
      localStorage.setItem("chatbot-added", "true");
    }
  }, []);

  useEffect(() => {
    console.log("Selected Contact updated:", selectedCont);
    console.log("Conv: " + selectedConversation);
  }, [selectedCont, selectedConversation]);

  return (
    <div className="dashboard">
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-900 text-white flex flex-col rounded-r-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer">
                <ToolTipMenu id={id} username={username} />
                <Image
                  className="flex w-8 h-8 rounded-full"
                  src={user_img3}
                  alt="Avatar"
                />
              </div>
              <h1 className="text-lg font-bold">Chats</h1>
            </div>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setModalOpen(true)}
            >
              +
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Chat List */}
            {contacts.map((contact) => {
              const conversation = conversations.find((conv) =>
                conv.recipients.some((recipient) => recipient.id === contact.id)
              );

              const lastMessage =
                conversation?.messages?.[conversation.messages.length - 1];
              const lastMessagePreview = lastMessage
                ? `${lastMessage.sender === "you" ? "You: " : ""}${
                    lastMessage.message
                  }`
                : "No messages yet";

              return (
                <div
                  key={contact.id}
                  onClick={() => selectContact(contact.id)}
                  className={`flex items-center p-3 hover:bg-gray-800 cursor-pointer ${
                    selectedCont === contact.id ? "bg-gray-800" : ""
                  }`}
                >
                  <div className="flex flex-shrink-0 w-10 h-10 bg-gray-700 items-center justify-center rounded-full mr-3">
                    <Image
                      className="flex w-8 h-8 rounded-full"
                      src={user_img4}
                      alt="Avatar"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{contact.name}</h3>
                    <p className="text-xs text-gray-400 truncate overflow-hidden text-ellipsis w-64">
                      {lastMessagePreview}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 flex flex-col bg-white ">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-medium">
              {selectedConversation
                ? selectedConversation?.recipients[0]?.name
                : "Select a Contact"}
            </h2>
            <button className="text-gray-400 hover:text-gray-600">⋮</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedConversation && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  Please select a contact to start chatting.
                </p>
              </div>
            )}
            {selectedConversation?.messages?.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  msg.sender === "you" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.sender === "you"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          {selectedConversation && (
            <div className="flex items-center px-4 py-3 border-t bg-gray-50">
              <input
                type="text"
                value={message}
                className="flex-1 px-3 py-2 border rounded-lg outline-none"
                placeholder="Type a message..."
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    handleSendMessage(e.target.value);
                    setMessage("");
                  }
                }}
              />
              <button
                className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => handleSendMessage(message)}
              >
                Send
              </button>
            </div>
          )}
        </main>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-1/3 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Create New Chat</h2>
              <input
                type="text"
                ref={idRef}
                placeholder="Enter contact ID..."
                className="w-full px-3 py-2 mb-4 border rounded-lg outline-none"
              />
              <input
                type="text"
                ref={nameRef}
                placeholder="Enter contact name..."
                className="w-full px-3 py-2 mb-4 border rounded-lg outline-none"
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={saveCont}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg ml-2"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
