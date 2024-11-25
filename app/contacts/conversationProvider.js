import React, { createContext, useContext, useState, useMemo } from "react";
import useLocalStore from "../hooks/localstore"; // Custom hook to manage local storage
import { useContacts } from "./contacts";

// Create the conversation context
const conversationContext = createContext();

// Custom hook to access the conversation context
export function useConversation() {
  return useContext(conversationContext);
}

// Conversation provider component
export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useLocalStore("conversations", []);
  const { contacts } = useContacts();

  // Create a new conversation
  function createConversation(id, name) {
    const newConversation = {
      recipients: [{ id, name }],
      messages: [],
    };
    setConversations((prev) => [...prev, newConversation]);
  }

  // Add a message to an existing conversation
  function addMessageToConversation(contact, message, sender) {
    setConversations((prevConversations) => {
      const newConversations = prevConversations.map((conv) => {
        // Ensure 'contact' is an object before accessing 'id' and 'name'
        const recipientId = contact.id || contact;

        if (conv.recipients.some((c) => c.id === recipientId)) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              { sender, message, timestamp: new Date().toISOString() },
            ],
          };
        }
        return conv;
      });

      // If conversation doesn't exist, create a new one
      if (
        !newConversations.some((conv) =>
          conv.recipients.some((c) => c.id === contact.id)
        )
      ) {
        newConversations.push({
          recipients: [{ id: contact.id, name: contact.name }],
          messages: [{ sender, message, timestamp: new Date().toISOString() }],
        });
      }

      return newConversations;
    });
  }

  // Format the conversation for displaying with contact names
  const formattedConversation = useMemo(() => {
    return conversations.map((conversation) => {
      const recipients = conversation.recipients.map((recipient) => {
        const contact = contacts.find((contact) => contact.id === recipient.id);
        const name = contact ? contact.name : recipient.id; // Fallback to ID if not found
        return { id: recipient.id, name };
      });

      return { ...conversation, recipients };
    });
  }, [conversations, contacts]);

  // Provide values to context consumers
  const value = {
    conversations: formattedConversation,
    createConversation,
    addMessageToConversation,
  };

  return (
    <conversationContext.Provider value={value}>
      {children}
    </conversationContext.Provider>
  );
}
