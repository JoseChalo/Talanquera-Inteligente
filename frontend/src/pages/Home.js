import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="card-container">
        <div className="card">
          <h2>Visitas</h2>
          <div className="card-content">Contenido de visitas</div>
        </div>
        <div className="card">
          <h2>Cámara</h2>
          <div className="card-content">Visualización de cámara</div>
        </div>
      </div>
    </div>
  );
}

export default Home;