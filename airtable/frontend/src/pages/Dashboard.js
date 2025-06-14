"use client";

const Dashboard = () => {
  return (
    <div style={{ height: "100vh", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // centers the text horizontally
          borderBottom: "1px solid #ccc",
          fontWeight: "bold",
          fontSize: 24,
          color: "#1890ff",
        }}
      >
        AIRTABLE
      </header>

      <main
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#555",
          padding: 20,
        }}
      >
        <div style={{ fontSize: 50, marginBottom: 20 }}>🚧</div>
        <h1 style={{ margin: 0, fontWeight: "normal" }}>Under Maintenance</h1>
      </main>
    </div>
  );
};

export default Dashboard;
