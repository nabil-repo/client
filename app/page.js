"use client";
import { io } from "socket.io-client";

import Login from "@/app/pages/login";
import useLocalStore from "./hooks/localstore";
import Dashboard from "./pages/dashboard";
import contacts, { ContactsProvider } from "./contacts/contacts";
import { ConversationProvider } from "./contacts/conversationProvider";

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
