import React, { createContext, useContext } from "react";
import useLocalStore from "../hooks/localstore";
import { useConversation } from "./conversationProvider";
//const { conversations, createConversation, addMessageToConversation } = useConversation();

const ContactsContext = createContext();

export function useContacts() {
  return useContext(ContactsContext);
}

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useLocalStore("contacts", []);


  function createContact(id, name) {
    setContacts((prevContacts) => [...prevContacts, { id, name }]);
  }

  return (
    <ContactsContext.Provider value={{ contacts, createContact }}>
      {children}
    </ContactsContext.Provider>
  );
}
