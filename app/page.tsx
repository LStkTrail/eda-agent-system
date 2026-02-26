import ChatWindow from "@/components/chat/ChatWindow";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* 顶部标题栏 */}
      <header
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          EDA Agent System
        </h1>
      </header>

      {/* 聊天主体 */}
      <main style={{ flex: 1, minHeight: 0, padding: "16px 24px 0" }}>
        <ChatWindow />
      </main>
    </div>
  );
}
