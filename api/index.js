import http from "http";

let issues = [
  {
    title: "Sample Issue",
    description: "This is a sample issue.",
    priority: "medium",
    image: "https://via.placeholder.com/150?text=Issue",
  },
  {
    title: "Login Bug",
    description: "Users cannot log in with Google OAuth.",
    priority: "high",
    image: "https://via.placeholder.com/150?text=Login",
  },
  {
    title: "UI Glitch",
    description: "Sidebar overlaps with main content on mobile.",
    priority: "medium",
    image: "https://via.placeholder.com/150?text=UI",
  },
  {
    title: "Performance Issue",
    description: "Dashboard loads slowly for large datasets.",
    priority: "high",
    image: "https://via.placeholder.com/150?text=Performance",
  },
  {
    title: "Typo in Footer",
    description: "Misspelled 'Copyright' in footer.",
    priority: "low",
    image: "https://via.placeholder.com/150?text=Typo",
  },
  {
    title: "Notification Error",
    description: "Email notifications not sent to users.",
    priority: "high",
    image: "https://via.placeholder.com/150?text=Notification",
  },
  {
    title: "Broken Link",
    description: "Help page link returns 404.",
    priority: "medium",
    image: "https://via.placeholder.com/150?text=Link",
  },
  {
    title: "Avatar Upload Fails",
    description: "Users cannot upload profile pictures.",
    priority: "medium",
    image: "https://via.placeholder.com/150?text=Avatar",
  },
  {
    title: "Settings Not Saved",
    description: "Changes in settings page are not persisted.",
    priority: "high",
    image: "https://via.placeholder.com/150?text=Settings",
  },
  {
    title: "Search Not Working",
    description: "Search returns no results even for existing issues.",
    priority: "high",
    image: "https://via.placeholder.com/150?text=Search",
  },
  {
    title: "Pagination Broken",
    description: "Next page button does not work on issues list.",
    priority: "medium",
    image: "https://via.placeholder.com/150?text=Pagination",
  },
];

const server = http.createServer(async (req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ message: "hello" }));
    res.end();
    return;
  }

  if (req.url.startsWith("/api/issues")) {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(issues));
      res.end();
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          const newIssue = {
            title: data.title,
            description: data.description,
            priority: data.priority,
            image: "https://via.placeholder.com/150?text=Issue",
          };
          issues.push(newIssue);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(newIssue));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid data" }));
        }
      });
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "nope" }));
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});