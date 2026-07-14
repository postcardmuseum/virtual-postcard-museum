export default function Home() {

  return (

    <main

      style={{

        maxWidth: "1000px",

        margin: "0 auto",

        padding: "40px",

        fontFamily: "Arial, sans-serif",

      }}

    >

      <header

        style={{

          borderBottom: "2px solid #ccc",

          paddingBottom: "20px",

          marginBottom: "30px",

          textAlign: "center",

        }}

      >

        <h1>🖼️ Virtual Postcard Museum</h1>

        <p>Discover history one postcard at a time.</p>

      </header>

      <nav

        style={{

          display: "flex",

          justifyContent: "center",

          gap: "30px",

          marginBottom: "40px",

          fontWeight: "bold",

        }}

      >

        <span>Home</span>

        <span>Collection</span>

        <span>About</span>

      </nav>
<section

  style={{

    backgroundColor: "#f8f8f8",

    padding: "30px",

    borderRadius: "10px",

  }}

>

  <h2>Featured Exhibit</h2>

  <p>

    Welcome to the Virtual Postcard Museum. This collection will preserve and

    share historic postcards from around the world.

  </p>

  <h3>Coming Soon</h3>

  <ul style={{ lineHeight: "2" }}>

    <li>🖼️ Thousands of vintage postcards</li>

    <li>🌍 Browse by country</li>

    <li>📅 Search by year</li>

    <li>❤️ Save favorites</li>

    <li>💬 Visitor comments</li>

    <li>🤖 AI-powered postcard descriptions</li>

  </ul>

</section>



    </main>

  );

}


