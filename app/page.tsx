export default function Home() {

  return (

    <main

      style={{

        maxWidth: "1000px",

        margin: "0 auto",

        padding: "40px",

        fontFamily: "Arial, sans-serif",

        backgroundColor: "#f7f2e8",

        minHeight: "100vh",

      }}

    >

      <h1

        style={{

          textAlign: "center",

          color: "#5b3a29",

          fontSize: "42px",

        }}

      >

        🖼️ Virtual Postcard Museum

      </h1>

      <p

        style={{

          textAlign: "center",

          fontSize: "22px",

          color: "#555",

        }}

      >

        Discover history one postcard at a time.

      </p>

      <hr />

      <div

        style={{

          background: "white",

          padding: "30px",

          borderRadius: "12px",

          marginTop: "30px",

          boxShadow: "0 4px 10px rgba(0,0,0,.15)",

        }}

      >

        <h2>Coming Soon</h2>

        <ul style={{ lineHeight: "2" }}>

          <li>📬 Thousands of vintage postcards</li>

          <li>🌎 Browse by country</li>

          <li>📅 Search by year</li>

          <li>❤️ Save favorites</li>

          <li>💬 Visitor comments</li>

          <li>🤖 AI postcard descriptions</li>

        </ul>

      </div>

    </main>

  );

}



