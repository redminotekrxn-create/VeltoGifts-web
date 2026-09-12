import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://velto-gifts-api.vercel.app'

function App() {
  const [page, setPage] = useState('home')
  const [balance, setBalance] = useState(0)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const tg = window.Telegram?.WebApp

      tg?.ready()
      tg?.expand()

      const telegramUser = tg?.initDataUnsafe?.user

      if (!telegramUser || !tg?.initData) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initData: tg.initData
        })
      })

      const data = await response.json()

      if (data.ok) {
        setUser(data.user)
        setBalance(data.user.balance || 0)
      }

      const adminResponse = await fetch(`${API_URL}/api/admin/check`, {
        headers: {
          'x-telegram-init-data': tg.initData
        }
      })

      const adminData = await adminResponse.json()

      if (adminData.ok) {
        setIsAdmin(adminData.isAdmin === true)
      }
    } catch (error) {
      console.error('API error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCase = (price) => {
    if (balance < price) {
      alert(`Недостаточно Stars. Нужно ⭐ ${price}`)
      return
    }

    alert('Кейс пока находится в разработке 🎁')
  }

  const spinRoulette = () => {
    alert('Бесплатная рулетка пока находится в разработке 🎡')
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>VeltoGifts</h1>
          <p>
            {loading
              ? 'Загрузка...'
              : user
                ? `Привет, ${user.firstName || 'пользователь'}`
                : 'Telegram Mini App'}
          </p>
        </div>

        <div className="balance">
          ⭐ {balance}
        </div>
      </header>

      <main className="content">
        {page === 'home' && (
          <>
            <section className="hero">
              <h2>VeltoGifts</h2>
              <p>
                Открывай кейсы, крути рулетку и собирай подарки.
              </p>
            </section>

            <button
              className="main-button"
              onClick={spinRoulette}
            >
              🎡 Бесплатная рулетка
            </button>

            <div className="cards">
              <div className="card">
                <h3>🎁 Кейсы</h3>
                <p>Открывай специальные кейсы.</p>
                <button onClick={() => setPage('cases')}>
                  Открыть
                </button>
              </div>

              <div className="card">
                <h3>🎒 Инвентарь</h3>
                <p>Твои полученные подарки.</p>
                <button onClick={() => setPage('inventory')}>
                  Открыть
                </button>
              </div>
            </div>

            {isAdmin && (
              <button
                className="main-button"
                onClick={() => setPage('admin')}
              >
                🛡️ Админ-панель
              </button>
            )}
          </>
        )}

        {page === 'cases' && (
          <>
            <h2>🎁 Кейсы</h2>

            <div className="cards">
              <div className="card">
                <h3>⭐ Starter Case</h3>
                <p>Стоимость: 10 ⭐</p>
                <button onClick={() => openCase(10)}>
                  Открыть за 10 ⭐
                </button>
              </div>

              <div className="card">
                <h3>💎 Premium Case</h3>
                <p>Стоимость: 50 ⭐</p>
                <button onClick={() => openCase(50)}>
                  Открыть за 50 ⭐
                </button>
              </div>
            </div>
          </>
        )}

        {page === 'inventory' && (
          <>
            <h2>🎒 Инвентарь</h2>

            <div className="empty">
              <div>🎁</div>
              <p>Инвентарь пока пуст.</p>
            </div>
          </>
        )}

        {page === 'profile' && (
          <>
            <h2>👤 Профиль</h2>

            <div className="profile">
              <p>
                <b>Имя:</b>{' '}
                {user?.firstName || 'Не определено'}
              </p>

              <p>
                <b>Username:</b>{' '}
                {user?.username
                  ? `@${user.username}`
                  : 'Не указан'}
              </p>

              <p>
                <b>Telegram ID:</b>{' '}
                {user?.telegramId || 'Не определён'}
              </p>

              <p>
                <b>Баланс:</b> ⭐ {balance}
              </p>
            </div>
          </>
        )}

        {page === 'admin' && isAdmin && (
          <>
            <h2>🛡️ Админ-панель</h2>

            <div className="cards">
              <div className="card">
                <h3>⭐ Баланс</h3>
                <p>Выдача и управление внутренним балансом.</p>
                <button onClick={() => alert('Раздел в разработке')}>
                  Управление
                </button>
              </div>

              <div className="card">
                <h3>👥 Пользователи</h3>
                <p>Просмотр пользователей VeltoGifts.</p>
                <button onClick={() => alert('Раздел в разработке')}>
                  Пользователи
                </button>
              </div>

              <div className="card">
                <h3>🚫 Блокировки</h3>
                <p>Блокировка и разблокировка пользователей.</p>
                <button onClick={() => alert('Раздел в разработке')}>
                  Управление
                </button>
              </div>

              <div className="card">
                <h3>🎁 Подарки</h3>
                <p>Управление виртуальными подарками.</p>
                <button onClick={() => alert('Раздел в разработке')}>
                  Управление
                </button>
              </div>
            </div>
          </>
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
