import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://velto-gifts-api.vercel.app'

function App() {
  const [page, setPage] = useState('home')
  const [balance, setBalance] = useState(0)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const getTelegram = () => {
    return window.Telegram?.WebApp
  }

  const loadUser = async () => {
    try {
      const tg = getTelegram()

      tg?.ready()
      tg?.expand()

      if (!tg?.initData) {
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

  const loadUsers = async () => {
    try {
      setAdminLoading(true)

      const tg = getTelegram()

      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'x-telegram-init-data': tg?.initData || ''
        }
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        alert(data.error || 'Не удалось загрузить пользователей')
        return
      }

      setUsers(data.users || [])
    } catch (error) {
      console.error(error)
      alert('Ошибка соединения с API')
    } finally {
      setAdminLoading(false)
    }
  }

  const changeBalance = async (telegramId, amount) => {
    const value = Number(amount)

    if (!Number.isInteger(value) || value === 0) {
      alert('Введите корректное количество Stars')
      return
    }

    try {
      const tg = getTelegram()

      const response = await fetch(`${API_URL}/api/admin/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': tg?.initData || ''
        },
        body: JSON.stringify({
          telegramId,
          amount: value
        })
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        alert(data.error || 'Ошибка изменения баланса')
        return
      }

      await loadUsers()
      alert(`Баланс изменён: ${value > 0 ? '+' : ''}${value} ⭐`)
    } catch (error) {
      console.error(error)
      alert('Ошибка соединения с API')
    }
  }

  const askBalance = async (telegramId) => {
    const amount = prompt('Введите количество Stars. Например: 100 или -50')

    if (amount === null) {
      return
    }

    await changeBalance(telegramId, amount)
  }

  const toggleBlock = async (telegramId, blocked) => {
    try {
      const tg = getTelegram()

      const response = await fetch(`${API_URL}/api/admin/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': tg?.initData || ''
        },
        body: JSON.stringify({
          telegramId,
          blocked: !blocked
        })
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        alert(data.error || 'Ошибка блокировки')
        return
      }

      await loadUsers()
    } catch (error) {
      console.error(error)
      alert('Ошибка соединения с API')
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

                <p>
                  Открывай специальные кейсы.
                </p>

                <button onClick={() => setPage('cases')}>
                  Открыть
                </button>
              </div>

              <div className="card">
                <h3>🎒 Инвентарь</h3>

                <p>
                  Твои полученные подарки.
                </p>

                <button onClick={() => setPage('inventory')}>
                  Открыть
                </button>
              </div>
            </div>

            {isAdmin && (
              <button
                className="main-button"
                onClick={() => {
                  setPage('admin')
                  loadUsers()
                }}
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

                <p>
                  Стоимость: 10 ⭐
                </p>

                <button onClick={() => openCase(10)}>
                  Открыть за 10 ⭐
                </button>
              </div>

              <div className="card">
                <h3>💎 Premium Case</h3>

                <p>
                  Стоимость: 50 ⭐
                </p>

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

              <p>
                Инвентарь пока пуст.
              </p>
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

            <button
              className="main-button"
              onClick={loadUsers}
            >
              🔄 Обновить пользователей
            </button>

            {adminLoading ? (
              <div className="empty">
                <p>Загрузка пользователей...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty">
                <div>👥</div>

                <p>
                  Пользователей пока нет.
                </p>
              </div>
            ) : (
              <div className="cards">
                {users.map((item) => (
                  <div
                    className="card"
                    key={item.telegramId}
                  >
                    <h3>
                      👤 {item.firstName || 'Без имени'}
                    </h3>

                    <p>
                      ID: {item.telegramId}
                    </p>

                    <p>
                      Username:{' '}
                      {item.username
                        ? `@${item.username}`
                        : 'нет'}
                    </p>

                    <p>
                      ⭐ Баланс: {item.balance}
                    </p>

                    <p>
                      🎁 Подарков: {item.inventoryCount}
                    </p>

                    <p>
                      Статус:{' '}
                      {item.blocked
                        ? '🚫 Заблокирован'
                        : '🟢 Активен'}
                    </p>

                    <button
                      onClick={() =>
                        askBalance(item.telegramId)
                      }
                    >
                      ⭐ Изменить баланс
                    </button>

                    <button
                      onClick={() =>
                        toggleBlock(
                          item.telegramId,
                          item.blocked
                        )
                      }
                    >
                      {item.blocked
                        ? '🔓 Разблокировать'
                        : '🚫 Заблокировать'}
                    </button>
                  </div>
                ))}
              </div>
            )}
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
