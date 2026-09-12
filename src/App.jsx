import { useState } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  const [balance, setBalance] = useState(0)

  const openCase = (price) => {
    if (balance < price) {
      alert(`Недостаточно Stars. Нужно ⭐ ${price}`)
      return
    }

    setBalance(balance - price)
    alert('Кейс пока находится в разработке 🎁')
  }

  const spinRoulette = () => {
    alert('Бесплатная рулетка пока находится в разработке 🎰')
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="logo">VeltoGifts</div>
          <div className="subtitle">Telegram Gifts</div>
        </div>

        <button
          className="balance"
          onClick={() => setPage('balance')}
        >
          ⭐ {balance}
        </button>
      </header>

      <main>
        {page === 'home' && (
          <>
            <section className="welcome">
              <h1>VeltoGifts</h1>
              <p>Открывай кейсы и получай Telegram Gifts</p>
            </section>

            <section className="stats">
              <div className="stat">
                <span>Баланс</span>
                <strong>⭐ {balance}</strong>
              </div>

              <div
                className="stat"
                onClick={() => setPage('inventory')}
              >
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

                <button onClick={() => openCase(10)}>
                  Открыть · ⭐ 10
                </button>
              </div>

              <div className="case">
                <div className="case-icon">💎</div>
                <h3>Premium Case</h3>
                <p>Более редкие подарки</p>

                <button onClick={() => openCase(50)}>
                  Открыть · ⭐ 50
                </button>
              </div>
            </section>

            <h2>🎰 Рулетка</h2>

            <section className="roulette">
              <div className="roulette-icon">🎰</div>
              <h3>Free Roulette</h3>
              <p>Бесплатная попытка раз в 24 часа</p>

              <button onClick={spinRoulette}>
                Крутить
              </button>
            </section>
          </>
        )}

        {page === 'balance' && (
          <section className="roulette">
            <div className="roulette-icon">⭐</div>

            <h2>Баланс</h2>
            <p>Твой текущий баланс</p>

            <h1>⭐ {balance}</h1>

            <button
              onClick={() =>
                alert('Пополнение подключим следующим этапом')
              }
            >
              Пополнить баланс
            </button>
          </section>
        )}

        {page === 'inventory' && (
          <section className="roulette">
            <div className="roulette-icon">🎒</div>

            <h2>Инвентарь</h2>

            <p>Здесь будут твои Telegram Gifts</p>

            <h3>Инвентарь пуст</h3>
          </section>
        )}

        {page === 'cases' && (
          <>
            <h2>🎁 Все кейсы</h2>

            <section className="cases">
              <div className="case">
                <div className="case-icon">🎁</div>

                <h3>Starter Case</h3>

                <button onClick={() => openCase(10)}>
                  ⭐ 10
                </button>
              </div>

              <div className="case">
                <div className="case-icon">💎</div>

                <h3>Premium Case</h3>

                <button onClick={() => openCase(50)}>
                  ⭐ 50
                </button>
              </div>
            </section>
          </>
        )}

        {page === 'profile' && (
          <section className="roulette">
            <div className="roulette-icon">👤</div>

            <h2>Профиль</h2>

            <p>
              Telegram-профиль будет подключён следующим этапом.
            </p>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button onClick={() => setPage('home')}>
          🏠
          <span>Главная</span>
        </button>

        <button onClick={() => setPage('cases')}>
          🎁
          <span>Кейсы</span>
        </button>

        <button onClick={() => setPage('inventory')}>
          🎒
          <span>Инвентарь</span>
        </button>

        <button onClick={() => setPage('profile')}>
          👤
          <span>Профиль</span>
        </button>
      </nav>
    </div>
  )
}

export default App
