import { useState } from "react";


const starterSubs = [
  { id: 1, name: "Netflix",      amount: 649,  category: "Entertainment", renewal: "2026-05-18", friends: ["Rahul"] },
  { id: 2, name: "Spotify",      amount: 119,  category: "Entertainment", renewal: "2026-05-22", friends: [] },
  { id: 3, name: "Amazon Prime", amount: 299,  category: "Shopping",      renewal: "2026-06-01", friends: [] },
  { id: 4, name: "Notion Pro",   amount: 165,  category: "Productivity",  renewal: "2026-05-29", friends: ["Priya"] },
];


// SCREEN 1 — DASHBOARD

function Dashboard({ subs, onEdit, onDelete, onAdd }) {
  let monthly = 0;
  for (let i = 0; i < subs.length; i++) {
    monthly = monthly + subs[i].amount;
  }
  const yearly = monthly * 12;

  return (
    <div>

      {/* summary */}
      <div className="stats-row">
        <div className="stat-box">
          <p className="stat-label">Monthly</p>
          <p className="stat-number">₹{monthly}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Yearly</p>
          <p className="stat-number">₹{yearly}</p>
        </div>
        <div className="stat-box">
          <p className="stat-label">Total Subs</p>
          <p className="stat-number">{subs.length}</p>
        </div>
      </div>

      <button className="btn-primary" onClick={onAdd}>+ Add Subscription</button>

      {/* subscription list */}
      {subs.length === 0 && <p className="empty-msg">No subscriptions yet. Add one!</p>}

      {subs.map(function(sub) {
        return (
          <div key={sub.id} className="sub-card">
            <div>
              <p className="sub-name">{sub.name}</p>
              <p className="sub-meta">{sub.category} · renews {sub.renewal}</p>
              {sub.friends.length > 0 && (
                <p className="sub-meta">
                  Shared with: {sub.friends.join(", ")}
                  {" "}· each owes ₹{Math.ceil(sub.amount / (sub.friends.length + 1))}/mo
                </p>
              )}
            </div>
            <div className="sub-right">
              <p className="sub-amount">₹{sub.amount}/mo</p>
              <button className="btn-small" onClick={function() { onEdit(sub); }}>Edit</button>
              <button className="btn-small red" onClick={function() { onDelete(sub.id); }}>Delete</button>
            </div>
          </div>
        );
      })}

    </div>
  );
}


// SCREEN 2 — ADD / EDIT FORM

function AddForm({ initial, onSave, onCancel }) {

  const [name,        setName]        = useState(initial ? initial.name     : "");
  const [amount,      setAmount]      = useState(initial ? initial.amount   : "");
  const [category,    setCategory]    = useState(initial ? initial.category : "Entertainment");
  const [renewal,     setRenewal]     = useState(initial ? initial.renewal  : "");
  const [friends,     setFriends]     = useState(initial ? initial.friends  : []);
  const [friendInput, setFriendInput] = useState("");
  const [error,       setError]       = useState("");

  function addFriend() {
    if (friendInput.trim() === "") return;
    setFriends([...friends, friendInput.trim()]);
    setFriendInput("");
  }

  function removeFriend(index) {
    const updated = [];
    for (let i = 0; i < friends.length; i++) {
      if (i !== index) updated.push(friends[i]);
    }
    setFriends(updated);
  }

  function handleSave() {
    if (name.trim() === "")   { setError("Please enter a name.");   return; }
    if (amount === "" || +amount <= 0) { setError("Enter a valid amount."); return; }
    if (renewal === "")       { setError("Please pick a date.");    return; }

    setError("");
    onSave({
      id:       initial ? initial.id : Date.now(),
      name:     name.trim(),
      amount:   Number(amount),
      category: category,
      renewal:  renewal,
      friends:  friends,
    });
  }

  let perPerson = null;
  if (amount !== "" && friends.length > 0) {
    perPerson = Math.ceil(Number(amount) / (friends.length + 1));
  }

  return (
    <div className="form-box">

      <h2 className="form-heading">{initial ? "Edit Subscription" : "Add Subscription"}</h2>

      {error !== "" && <p className="form-error">{error}</p>}

      <label className="form-label">Name</label>
      <input
        className="form-input"
        value={name}
        onChange={function(e) { setName(e.target.value); }}
        placeholder="e.g. Netflix"
      />

      <label className="form-label">Category</label>
      <select
        className="form-input"
        value={category}
        onChange={function(e) { setCategory(e.target.value); }}
      >
        <option>Entertainment</option>
        <option>Shopping</option>
        <option>Productivity</option>
        <option>Education</option>
        <option>Other</option>
      </select>

      <label className="form-label">Monthly Amount (₹)</label>
      <input
        className="form-input"
        type="number"
        value={amount}
        onChange={function(e) { setAmount(e.target.value); }}
        placeholder="e.g. 649"
      />

      {amount > 0 && (
        <p className="yearly-note">Yearly: ₹{amount * 12}</p>
      )}

      <label className="form-label">Renewal Date</label>
      <input
        className="form-input"
        type="date"
        value={renewal}
        onChange={function(e) { setRenewal(e.target.value); }}
      />

      <label className="form-label">Shared with (optional)</label>
      <div className="friend-row">
        <input
          className="form-input"
          style={{ marginBottom: 0 }}
          value={friendInput}
          onChange={function(e) { setFriendInput(e.target.value); }}
          placeholder="Friend's name"
        />
        <button className="btn-small" onClick={addFriend}>Add</button>
      </div>

      {friends.map(function(f, i) {
        return (
          <div key={i} className="friend-chip">
            <span>{f}</span>
            {perPerson && <span className="friend-share"> · owes ₹{perPerson}/mo</span>}
            <button className="chip-remove" onClick={function() { removeFriend(i); }}>×</button>
          </div>
        );
      })}

      <div className="form-actions">
        <button className="btn-small" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? "Update" : "Save"}</button>
      </div>

    </div>
  );
}


// SCREEN 3 — AUDIT

function Audit({ subs }) {

  const [index,   setIndex]   = useState(0);
  const [answers, setAnswers] = useState({});
  const [done,    setDone]    = useState(false);

  function answer(id, stillUsing) {
    const updated = {};
    // copy old answers
    for (let key in answers) {
      updated[key] = answers[key];
    }
    updated[id] = stillUsing;
    setAnswers(updated);

    if (index < subs.length - 1) {
      setIndex(index + 1);
    } else {
      setDone(true);
    }
  }

  function reset() {
    setIndex(0);
    setAnswers({});
    setDone(false);
  }

  let wasted = 0;
  for (let i = 0; i < subs.length; i++) {
    if (answers[subs[i].id] === false) {
      wasted = wasted + subs[i].amount;
    }
  }

  if (subs.length === 0) {
    return <p className="empty-msg">Add subscriptions first.</p>;
  }

  if (done) {
    return (
      <div>
        <h2 className="form-heading">Audit Complete</h2>

        <div className="waste-box">
          <p className="waste-label">Wasted yearly</p>
          <p className="waste-number">₹{wasted * 12}</p>
          <p className="waste-sub">₹{wasted} every month</p>
        </div>

        {subs.map(function(s) {
          return (
            <div key={s.id} className="result-row">
              <span>{s.name}</span>
              <span className={answers[s.id] ? "tag-keep" : "tag-cancel"}>
                {answers[s.id] ? "Keeping" : "Cancel"}
              </span>
            </div>
          );
        })}

        <button className="btn-primary" style={{ marginTop: "16px" }} onClick={reset}>
          Redo Audit
        </button>
      </div>
    );
  }


  const current = subs[index];

  return (
    <div>
      <p className="audit-count">{index + 1} of {subs.length}</p>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: (index / subs.length * 100) + "%" }} />
      </div>

      <div className="audit-card">
        <p className="audit-name">{current.name}</p>
        <p className="audit-amount">₹{current.amount}/month</p>
        <p className="audit-yearly">₹{current.amount * 12} a year</p>
        <p className="audit-q">Do you actually use this?</p>
        <div className="audit-btns">
          <button className="btn-no"  onClick={function() { answer(current.id, false); }}>✕ Cancel It</button>
          <button className="btn-yes" onClick={function() { answer(current.id, true);  }}>✓ Still Using</button>
        </div>
      </div>
    </div>
  );
}


// MAIN COMPONENT 

export default function SubModel() {

  const [subs,    setSubs]    = useState(starterSubs);
  const [screen,  setScreen]  = useState("dashboard");
  const [editing, setEditing] = useState(null);

  function deleteSub(id) {
    const updated = [];
    for (let i = 0; i < subs.length; i++) {
      if (subs[i].id !== id) updated.push(subs[i]);
    }
    setSubs(updated);
  }

  function startEdit(sub) {
    setEditing(sub);
    setScreen("add");
  }

  function saveSub(newSub) {
    if (editing) {
      const updated = [];
      for (let i = 0; i < subs.length; i++) {
        if (subs[i].id === newSub.id) {
          updated.push(newSub);
        } else {
          updated.push(subs[i]);
        }
      }
      setSubs(updated);
    } else {
      setSubs([...subs, newSub]);
    }
    setEditing(null);
    setScreen("dashboard");
  }

  function goToAdd() {
    setEditing(null);
    setScreen("add");
  }

  return (
    <div className="app-wrapper">

      {/* navbar */}
      <nav className="navbar">
        <p className="nav-brand">SubTrack</p>
        <div className="nav-links">
          <button
            className={screen === "dashboard" ? "nav-btn active" : "nav-btn"}
            onClick={function() { setScreen("dashboard"); }}
          >
            Dashboard
          </button>
          <button
            className={screen === "add" ? "nav-btn active" : "nav-btn"}
            onClick={goToAdd}
          >
            Add New
          </button>
          <button
            className={screen === "audit" ? "nav-btn active" : "nav-btn"}
            onClick={function() { setScreen("audit"); }}
          >
            Audit
          </button>
        </div>
      </nav>

      <main className="page">
        {screen === "dashboard" && (
          <Dashboard
            subs={subs}
            onEdit={startEdit}
            onDelete={deleteSub}
            onAdd={goToAdd}
          />
        )}
        {screen === "add" && (
          <AddForm
            initial={editing}
            onSave={saveSub}
            onCancel={function() { setEditing(null); setScreen("dashboard"); }}
          />
        )}
        {screen === "audit" && (
          <Audit subs={subs} />
        )}
      </main>

    </div>
  );
}

