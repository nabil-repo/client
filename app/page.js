"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Chat from "./pages/chat";
import Login from "@/app/pages/login";
import useLocalStore from "./hooks/localstore";
import Dashboard from "./pages/dashboard";
import contacts, { ContactsProvider } from "./contacts/contacts";
import { ConversationProvider } from "./contacts/conversationProvider";

const socket = io("http://localhost:5000");

export default function Home() {
  const [id, setId] = useLocalStore("id");

  const dashboard = (
    <ContactsProvider>
      <ConversationProvider>
        <Dashboard id={id} />
      </ConversationProvider>
    </ContactsProvider>
  );

  return id ? dashboard : <Login onIdSubmit={setId} />;
}
