import { useEffect, useMemo, useState } from "react";
import "./App.css";
import logo from "./assets/lit.jpeg";
import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const initialEvents = [];

// ── Real-time Firestore hook ─────────────────────────────
function useFirestoreData(docId, defaultValue) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "appData", docId);
    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        setData(snap.data().value);
      } else {
        await setDoc(ref, { value: defaultValue });
        setData(defaultValue);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [docId]);

  const save = async (newValue) => {
    try {
      setData(newValue);
      await setDoc(doc(db, "appData", docId), { value: newValue });
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return [data ?? defaultValue, save, loading];
}

function formatDate(dateString) {
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

function formatDateShort(dateString) {
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "long" });
}

// ── Pages ───────────────────────────────────────────────

function DailyVersePage() {
  const [data, save, loading] = useFirestoreData("daily-verse", { verse: "", reference: "" });
  if (loading) return <div className="page"><p className="empty-text">Loading...</p></div>;
  return (
    <div className="page">
      <div className="title">Daily Verse</div>
      <div className="card">
        <div className="section-title">📖 This Week's Verse</div>
        <input
          placeholder="Reference (e.g. John 3:16)"
          value={data.reference}
          onChange={(e) => save({ ...data, reference: e.target.value })}
          style={{ marginBottom: 10, width: "100%" }}
        />
        <textarea
          className="sidebar-textarea"
          placeholder="Enter the verse here..."
          value={data.verse}
          onChange={(e) => save({ ...data, verse: e.target.value })}
          style={{ minHeight: 120, width: "100%" }}
        />
        {data.reference && data.verse && (
          <div className="verse-display">
            <p className="verse-text">"{data.verse}"</p>
            <p className="verse-ref">— {data.reference}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementsPage() {
  const [items, save, loading] = useFirestoreData("announcements", []);
  const [newItem, setNewItem] = useState("");
  if (loading) return <div className="page"><p className="empty-text">Loading...</p></div>;
  const add = () => {
    if (!newItem.trim()) return;
    save([{ id: Date.now(), text: newItem }, ...items]);
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
            <button className="btn-delete" onClick={() => save(items.filter(i => i.id !== item.id))}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function KCOutingPage() {
  const [data, save, loading] = useFirestoreData("kc-outing", { date: "", location: "", details: "" });
  if (loading) return <div className="page"><p className="empty-text">Loading...</p></div>;
  return (
    <div className="page">
      <div className="title">KC Outing</div>
      <div className="card">
        <div className="section-title">🏕️ Next Outing</div>
        <div className="row" style={{ marginBottom: 10 }}>
          <input type="date" value={data.date} onChange={(e) => save({ ...data, date: e.target.value })} />
          <input placeholder="Location" value={data.location} onChange={(e) => save({ ...data, location: e.target.value })} />
        </div>
        <textarea
          className="sidebar-textarea"
          placeholder="Outing details, what to bring, etc..."
          value={data.details}
          onChange={(e) => save({ ...data, details: e.target.value })}
          style={{ minHeight: 120, width: "100%" }}
        />
        {(data.date || data.location) && (
          <div className="verse-display">
            {data.date && <p className="verse-ref">📅 {new Date(data.date + "T00:00:00").toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</p>}
            {data.location && <p className="verse-ref">📍 {data.location}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function NotesPage() {
  const [notes, save, loading] = useFirestoreData("notes", "");
  if (loading) return <div className="page"><p className="empty-text">Loading...</p></div>;
  return (
    <div className="page">
      <div className="title">Notes</div>
      <div className="card">
        <div className="section-title">📝 General Notes</div>
        <textarea
          className="sidebar-textarea"
          placeholder="Write your notes here..."
          value={notes}
          onChange={(e) => save(e.target.value)}
          style={{ minHeight: 300, width: "100%" }}
        />
      </div>
    </div>
  );
}

function FridayNightsPage() {
  const [events, saveEvents, loading] = useFirestoreData("events", initialEvents);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newFood, setNewFood] = useState("");
  const [newPerson, setNewPerson] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSharingPerson, setNewSharingPerson] = useState("");

  useEffect(() => {
    if (events && events.length > 0 && selectedEventId === null) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  const selectedEvent = useMemo(
    () => events?.find((e) => e.id === selectedEventId),
    [events, selectedEventId]
  );

  if (loading) return <div className="page"><p className="empty-text">Loading...</p></div>;

  const addFood = () => {
    if (!newFood || !newPerson) return;
    saveEvents(events.map((e) =>
      e.id === selectedEventId
        ? { ...e, food: [...e.food, { item: newFood, person: newPerson }] }
        : e
    ));
    setNewFood("");
    setNewPerson("");
  };

  const deleteFood = (indexToDelete) => {
    saveEvents(events.map((e) =>
      e.id === selectedEventId
        ? { ...e, food: e.food.filter((_, i) => i !== indexToDelete) }
        : e
    ));
  };

  const clearSharing = () => {
    saveEvents(events.map((e) =>
      e.id === selectedEventId ? { ...e, sharingPerson: "Not Selected Yet" } : e
    ));
  };

  const addEvent = () => {
    if (!newDate || !newSharingPerson) return;
    const newEvent = { id: Date.now(), date: newDate, food: [], sharingPerson: newSharingPerson };
    saveEvents([...events, newEvent]);
    setSelectedEventId(newEvent.id);
    setNewDate("");
    setNewSharingPerson("");
  };

  const deleteEvent = (eventId) => {
    const updated = events.filter((e) => e.id !== eventId);
    saveEvents(updated);
    if (selectedEventId === eventId) {
      setSelectedEventId(updated.length > 0 ? updated[0].id : null);
    }
  };

  return (
    <div className="page">
      <div className="title">KC Lit</div>

      <div className="card">
        <div className="section-title">Friday Nights</div>
        {events.length === 0 && <p className="empty-text">No nights planned yet.</p>}
        {events.map((e) => (
          <div
            key={e.id}
            className={`event-row ${e.id === selectedEventId ? "selected" : ""}`}
            onClick={() => setSelectedEventId(e.id)}
          >
            <span>{formatDate(e.date)} — Sharing: {e.sharingPerson || "Not Selected Yet"}</span>
            <button
              className="btn-delete"
              style={{ marginLeft: "auto", flexShrink: 0 }}
              onClick={(ev) => { ev.stopPropagation(); deleteEvent(e.id); }}
            >Delete</button>
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

// ── Nav config ──────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home",          label: "Home",         emoji: "🏠" },
  { id: "announcements", label: "Announcements", emoji: "📣" },
  { id: "daily-verse",   label: "Daily Verse",   emoji: "📖" },
  { id: "kc-outing",    label: "KC Outing",     emoji: "🏕️" },
  { id: "notes",         label: "Notes",         emoji: "📝" },
];

// ── Root App ────────────────────────────────────────────

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (id) => { setActivePage(id); setMenuOpen(false); };

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
      <div className="mobile-topbar">
        <div className="mobile-brand">
          <img src={logo} alt="KC Lit logo" className="sidebar-logo" />
          KC Lit
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="KC Lit logo" className="sidebar-logo" />
          KC Lit
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-emoji">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">{renderPage()}</main>
    </div>
  );
}