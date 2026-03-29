import { useMemo, useState } from "react";
import "./App.css";
import logo from "./assets/lit.jpeg";

const initialEvents = [
  {
    id: 1,
    date: "2026-04-03",
    food: [],
    sharingPerson: "Not Selected Yet",
  },
];

function formatDate(dateString) {
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatDateShort(dateString) {
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "long" });
}

// ── Pages ──────────────────────────────────────────────

function DailyVersePage() {
  const [verse, setVerse] = useState("");
  const [reference, setReference] = useState("");
  return (
    <div className="page">
      <div className="title">Daily Verse</div>
      <div className="card">
        <div className="section-title">📖 This Week's Verse</div>
        <input
          placeholder="Reference (e.g. John 3:16)"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          style={{ marginBottom: 10, width: "100%" }}
        />
        <textarea
          className="sidebar-textarea"
          placeholder="Enter the verse here..."
          value={verse}
          onChange={(e) => setVerse(e.target.value)}
          style={{ minHeight: 120, width: "100%" }}
        />
        {reference && verse && (
          <div className="verse-display">
            <p className="verse-text">"{verse}"</p>
            <p className="verse-ref">— {reference}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  const add = () => {
    if (!newItem.trim()) return;
    setItems([{ id: Date.now(), text: newItem }, ...items]);
    setNewItem("");
  };

  return (
    <div className="page">
      <div className="title">Announcements</div>
      <div className="card">
        <div className="section-title">📣 Announcements</div>
        <div className="row" style={{ marginBottom: 16 }}>
          <input
            placeholder="New announcement..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn-primary" onClick={add}>Add</button>
        </div>
        {items.length === 0 && <p className="empty-text">No announcements yet.</p>}
        {items.map((item) => (
          <div key={item.id} className="food-item">
            <div className="food-name">{item.text}</div>
            <button className="btn-delete" onClick={() => setItems(items.filter(i => i.id !== item.id))}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function KCOutingPage() {
  const [details, setDetails] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  return (
    <div className="page">
      <div className="title">KC Outing</div>
      <div className="card">
        <div className="section-title">🏕️ Next Outing</div>
        <div className="row" style={{ marginBottom: 10 }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <textarea
          className="sidebar-textarea"
          placeholder="Outing details, what to bring, etc..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          style={{ minHeight: 120, width: "100%" }}
        />
        {(date || location) && (
          <div className="verse-display">
            {date && <p className="verse-ref">📅 {new Date(date + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</p>}
            {location && <p className="verse-ref">📍 {location}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function NotesPage() {
  const [notes, setNotes] = useState("");
  return (
    <div className="page">
      <div className="title">Notes</div>
      <div className="card">
        <div className="section-title">📝 General Notes</div>
        <textarea
          className="sidebar-textarea"
          placeholder="Write your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ minHeight: 300, width: "100%" }}
        />
      </div>
    </div>
  );
}

function FridayNightsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [newFood, setNewFood] = useState("");
  const [newPerson, setNewPerson] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSharingPerson, setNewSharingPerson] = useState("");

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId]
  );

  const addFood = () => {
    if (!newFood || !newPerson) return;
    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEventId
          ? { ...e, food: [...e.food, { item: newFood, person: newPerson }] }
          : e
      )
    );
    setNewFood("");
    setNewPerson("");
  };

  const deleteFood = (indexToDelete) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEventId
          ? { ...e, food: e.food.filter((_, index) => index !== indexToDelete) }
          : e
      )
    );
  };

  const clearSharing = () => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEventId ? { ...e, sharingPerson: "Not Selected Yet" } : e
      )
    );
  };

  const addEvent = () => {
    if (!newDate || !newSharingPerson) return;
    const newEvent = {
      id: Date.now(),
      date: newDate,
      food: [],
      sharingPerson: newSharingPerson,
    };
    setEvents([...events, newEvent]);
    setSelectedEventId(newEvent.id);
    setNewDate("");
    setNewSharingPerson("");
  };

  return (
    <div className="page">
      <div className="title">KC Lit</div>

      <div className="card">
        <div className="section-title">Friday Nights</div>
        {events.map((e) => (
          <div
            key={e.id}
            className={`event-row ${e.id === selectedEventId ? "selected" : ""}`}
            onClick={() => setSelectedEventId(e.id)}
          >
            {formatDate(e.date)} — Sharing: {e.sharingPerson || "Not Selected Yet"}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">Plan New KC</div>
        <div className="row">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          <input placeholder="Who's sharing?" value={newSharingPerson} onChange={(e) => setNewSharingPerson(e.target.value)} />
          <button className="btn-primary" onClick={addEvent}>Add</button>
        </div>
      </div>

      {selectedEvent && (
        <div className="card">
          <div className="selected-heading">Selected: {formatDateShort(selectedEvent.date)}</div>
          <div className="sharing-row">
            <span>Sharing: <strong>{selectedEvent.sharingPerson || "Not Selected Yet"}</strong></span>
            <button className="btn-danger" onClick={clearSharing}>Delete Sharing</button>
          </div>
          <hr className="divider" />
          <div className="section-title">Food List</div>
          {selectedEvent.food.length === 0 ? (
            <p className="empty-text">No food added yet.</p>
          ) : (
            selectedEvent.food.map((f, i) => (
              <div key={i} className="food-item">
                <div>
                  <div className="food-name">{f.item}</div>
                  <div className="food-person">{f.person}</div>
                </div>
                <button className="btn-delete" onClick={() => deleteFood(i)}>Delete</button>
              </div>
            ))
          )}
          <div className="add-food-row">
            <input placeholder="Food" value={newFood} onChange={(e) => setNewFood(e.target.value)} />
            <input placeholder="Who's bringing?" value={newPerson} onChange={(e) => setNewPerson(e.target.value)} />
            <button className="btn-primary" onClick={addFood}>Add Food</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Nav config ─────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home",          label: "Home",          emoji: "🏠" },
  { id: "announcements", label: "Announcements",  emoji: "📣" },
  { id: "daily-verse",   label: "Daily Verse",    emoji: "📖" },
  { id: "kc-outing",    label: "KC Outing",      emoji: "🏕️" },
  { id: "notes",         label: "Notes",          emoji: "📝" },
];

// ── Root App ───────────────────────────────────────────

export default function App() {
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    switch (activePage) {
      case "home":          return <FridayNightsPage />;
      case "daily-verse":   return <DailyVersePage />;
      case "announcements": return <AnnouncementsPage />;
      case "kc-outing":    return <KCOutingPage />;
      case "notes":         return <NotesPage />;
      default:              return <FridayNightsPage />;
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand"><img src={logo} alt="KC Lit logo" className="sidebar-logo" />KC Lit</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-emoji">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}