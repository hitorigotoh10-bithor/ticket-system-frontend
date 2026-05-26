import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API = "https://ticket-system-lyart-nine.vercel.app/";

function Tickets() {
  const { getToken } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "open",
  });

  const [editId, setEditId] = useState(null);

  const fetchTickets = async () => {
    const token = await getToken();

    const res = await fetch(`${API}/api/tickets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setTickets(data);
  };

  const saveTicket = async () => {
    const token = await getToken();

    const url = editId
      ? `${API}/api/tickets/${editId}`
      : `${API}/api/tickets`;

    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setForm({
      title: "",
      description: "",
      status: "open",
    });

    setEditId(null);
    fetchTickets();
  };

  const editTicket = (ticket) => {
    setEditId(ticket.id);

    setForm({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
    });
  };

  const deleteTicket = async (id) => {
    const token = await getToken();

    await fetch(`${API}/api/tickets/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchTickets();
  };

  useEffect(() => {
    fetchTickets();

    const socket = io(API);

    socket.on("ticket_created", fetchTickets);
    socket.on("ticket_updated", fetchTickets);
    socket.on("ticket_deleted", fetchTickets);

    return () => socket.disconnect();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mini Ticket System</h1>
        <UserButton />
      </div>

      <div className="card p-4 mb-4">
        <h4>{editId ? "Edit Ticket" : "Create Ticket"}</h4>

        <input
          className="form-control mb-3"
          placeholder="Ticket title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <textarea
          className="form-control mb-3"
          placeholder="Ticket description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <select
          className="form-select mb-3"
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <button className="btn btn-primary" onClick={saveTicket}>
          {editId ? "Update Ticket" : "Add Ticket"}
        </button>
      </div>

      <h3>Tickets</h3>

      {tickets.length === 0 && <p>No tickets yet.</p>}

      {tickets.map((ticket) => (
        <div key={ticket.id} className="card p-3 mb-3">
          <div className="d-flex justify-content-between">
            <h5>{ticket.title}</h5>
            <span className="badge bg-secondary">{ticket.status}</span>
          </div>

          <p>{ticket.description}</p>

          <small className="text-muted">
            Created: {new Date(ticket.created_at).toLocaleString()}
          </small>

          <div className="mt-3">
            <button
              className="btn btn-warning btn-sm me-2"
              onClick={() => editTicket(ticket)}
            >
              Edit
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteTicket(ticket.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <div className="container py-5 text-center">
          <h1>Ticket System</h1>
          <p>Please sign in to manage your tickets.</p>
          <SignInButton>
            <button className="btn btn-primary">Sign In</button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <Tickets />
      </SignedIn>
    </>
  );
}