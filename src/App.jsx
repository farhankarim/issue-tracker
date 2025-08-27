import { createRoot } from "react-dom/client";
import Issue from "./Issue";

const fakeIssues = [
  {
    id: 1,
    title: "Login page not loading",
    description: "Users report a blank screen when accessing the login page.",
    status: "open",
  },
  {
    id: 2,
    title: "Profile image upload fails",
    description: "Uploading a profile image returns a 500 error.",
    status: "in progress",
  },
  {
    id: 3,
    title: "Notifications not updating",
    description: "Real-time notifications are delayed or missing.",
    status: "closed",
  },
];

const App = () => {
  return (
    <div>
      <h1 className="logo" style={{ color: "blue", fontSize: "24px", fontFamily: "Arial, sans-serif" }}>Issue Tracker</h1>
      {fakeIssues.map((issue) => (
        <Issue
          key={issue.id}
          title={issue.title}
          description={issue.description}
          status={issue.status}
        />
      ))}
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);