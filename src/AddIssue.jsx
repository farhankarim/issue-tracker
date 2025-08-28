import { useState, useEffect } from "react";
import Issue from "./Issue";

// feel free to change en-US / USD to your locale
const intl = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function AddIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  async function fetchIssues() {
    const res = await fetch("/api/issues");
    const json = await res.json();
    setIssues(json);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newIssue = { title, description, priority };
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newIssue),
    });
    if (res.ok) {
      fetchIssues();
      setTitle("");
      setDescription("");
      setPriority("medium");
    }
  }

  return (
    <div className="order">
      <h2>Create Issue</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="issue-title">Title</label>
          <input
            id="issue-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="issue-desc">Description</label>
          <textarea
            id="issue-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="issue-priority">Priority</label>
          <select
            id="issue-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit">Create Issue</button>
      </form>
      {loading ? (
        <h3>LOADING …</h3>
      ) : (
        <div className="order-pizza">
          {issues.map((issue, idx) => (
            <Issue
              key={idx}
              title={issue.title}
              description={issue.description}
              image={issue.image}
              priority={issue.priority}
            />
          ))}
        </div>
      )}
    </div>
  );
}