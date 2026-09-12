import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="logo">VeltoGifts</div>
          <div className="subtitle">Telegram Gifts</div>
        </div>

        <div className="balance">
          ⭐ 0
        </div>
      </header>

      <main>
        <section className="welcome">
          <h1>VeltoGifts</h1>
          <p>Открывай кейсы и получай Telegram Gifts</p>
        </section>

        <section className="stats">
          <div className="stat">
            <span>Баланс</span>
            <strong>⭐ 0</strong>
          </div>

          <div className="stat">
            <span>Инвентарь</span>
            <strong>0</strong>
          </div>
        </section>

        <h2>🎁 Кейсы</h2>

        <section className="cases">
          <div className="case">
            <div className="case-icon">🎁</div>
            <h3>Starter Case</h3>
            <p>Случайный Telegram Gift</p>
            <button>Открыть · ⭐ 10</button>
          </div>

          <div className="case">
            <div className="case-icon">💎</div>
            <h3>Premium Case</h3>
            <p>Более редкие подарки</p>
            <button>Открыть · ⭐ 50</button>
          </div>
        </section>

        <h2>🎰 Рулетка</h2>

        <section className="roulette">
          <div className="roulette-icon">🎰</div>
          <h3>Free Roulette</h3>
          <p>Бесплатная попытка раз в 24 часа</p>
          <button>Крутить</button>
        </section>
      </main>

      <nav className="bottom-nav">
        <button>🏠<span>Главная</span></button>
        <button>🎁<span>Кейсы</span></button>
        <button>🎒<span>Инвентарь</span></button>
        <button>👤<span>Профиль</span></button>
      </nav>
    </div>
  )
}

export default App
