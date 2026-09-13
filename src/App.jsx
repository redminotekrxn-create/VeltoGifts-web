import { useEffect, useState } from 'react'

import commonGift from './assets/gifts/common.svg'
import rareGift from './assets/gifts/rare.svg'
import epicGift from './assets/gifts/epic.svg'
import legendaryGift from './assets/gifts/legendary.svg'

const API_URL = 'https://velto-gifts-api.vercel.app'

const PRIZE_VISUALS = {
  common: {
    image: commonGift,
    title: 'Common Gift',
    className: 'common'
  },
  rare: {
    image: rareGift,
    title: 'Rare Gift',
    className: 'rare'
  },
  epic: {
    image: epicGift,
    title: 'Epic Gift',
    className: 'epic'
  },
  legendary: {
    image: legendaryGift,
    title: 'Legendary Gift',
    className: 'legendary'
  }
}

const REEL_ITEMS = [
  { id: 'common', name: 'Common Gift' },
  { id: 'rare', name: 'Rare Gift' },
  { id: 'epic', name: 'Epic Gift' },
  { id: 'legendary', name: 'Legendary Gift' },
  { id: 'common', name: 'Common Gift' },
  { id: 'rare', name: 'Rare Gift' },
  { id: 'epic', name: 'Epic Gift' },
  { id: 'legendary', name: 'Legendary Gift' }
]

function TelegramGifts({ gifts }) {
  if (!gifts?.length) {
    return null
  }

  return (
    <section className="telegram-gifts-section">
      <h2>🎁 Подарки Telegram</h2>

      <div className="telegram-gifts-grid">
        {gifts.map((gift) => (
          <div className="telegram-gift-card" key={gift.id}>
            <img
              src={`${API_URL}${gift.image}`}
              alt={gift.name}
            />

            <div>{gift.name}</div>
            <div>⭐ {gift.starCount}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
function App() {
  const [page, setPage] = useState('home')
  const [balance, setBalance] = useState(0)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false)

  const [openingCase, setOpeningCase] = useState(false)
  const [lastReward, setLastReward] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const [reelItems, setReelItems] = useState(REEL_ITEMS)
  const [reelOffset, setReelOffset] = useState(0)
  const [reelTransition, setReelTransition] = useState('none')

  useEffect(() => {
    loadUser()
  }, []) 
 
   useEffect(() => {
    const loadTelegramGifts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/telegram/gifts`)
        const data = await response.json()

        if (data.ok) {
          setTelegramGifts(data.gifts || [])
        }
      } catch (error) {
        console.error('Telegram gifts loading error:', error)
      }
    }

    loadTelegramGifts()
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

      const adminResponse = await fetch(
        `${API_URL}/api/admin/check`,
        {
          headers: {
            'x-telegram-init-data': tg.initData
          }
        }
      )

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

      const response = await fetch(
        `${API_URL}/api/admin/users`,
        {
          headers: {
            'x-telegram-init-data': tg?.initData || ''
          }
        }
      )

      const data = await response.json()

      if (!response.ok || !data.ok) {
        alert(
          data.error ||
          'Не удалось загрузить пользователей'
        )
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

    if (
      !Number.isInteger(value) ||
      value === 0
    ) {
      alert('Введите корректное количество Stars')
      return
    }

    try {
      const tg = getTelegram()

      const response = await fetch(
        `${API_URL}/api/admin/balance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-init-data':
              tg?.initData || ''
          },
          body: JSON.stringify({
            telegramId,
            amount: value
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.ok) {
        alert(
          data.error ||
          'Ошибка изменения баланса'
        )
        return
      }

      await loadUsers()

      alert(
        `Баланс изменён: ${
          value > 0 ? '+' : ''
        }${value} ⭐`
      )
    } catch (error) {
      console.error(error)
      alert('Ошибка соединения с API')
    }
  }

  const askBalance = async (telegramId) => {
    const amount = prompt(
      'Введите количество Stars.\nНапример: 100 или -50'
    )

    if (amount === null) {
      return
    }

    await changeBalance(
      telegramId,
      amount
    )
  }

  const toggleBlock = async (
    telegramId,
    blocked
  ) => {
    try {
      const tg = getTelegram()

      const response = await fetch(
        `${API_URL}/api/admin/block`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-init-data':
              tg?.initData || ''
          },
          body: JSON.stringify({
            telegramId,
            blocked: !blocked
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.ok) {
        alert(
          data.error ||
          'Ошибка блокировки'
        )
        return
      }

      await loadUsers()
    } catch (error) {
      console.error(error)
      alert('Ошибка соединения с API')
    }
  }

  const prepareReel = (reward) => {
    const visual =
      PRIZE_VISUALS[reward?.id] ||
      PRIZE_VISUALS.common

    const resultItem = {
      id: reward?.id || 'common',
      name: reward?.name || visual.title,
      value: reward?.value || 0
    }

    const items = []

    for (let i = 0; i < 28; i++) {
      items.push({
        ...REEL_ITEMS[i % REEL_ITEMS.length],
        key: `${i}-${Math.random()}`
      })
    }

    items.push({
      ...resultItem,
      key: `winner-${Date.now()}`
    })

    setReelItems(items)
    setReelOffset(0)
    setReelTransition('none')

    return items.length - 1
  }

  const animateToReward = async (reward) => {
    const winnerIndex = prepareReel(reward)

    await new Promise(resolve =>
      requestAnimationFrame(resolve)
    )

    const itemWidth = 118

    const targetOffset =
      -(winnerIndex * itemWidth) + 150

    setReelTransition(
      'transform 4.8s cubic-bezier(0.08, 0.65, 0.12, 1)'
    )

    setReelOffset(targetOffset)

    await new Promise(resolve =>
      setTimeout(resolve, 5000)
    )
  }

  const openCase = async (caseId) => {
    if (openingCase) {
      return
    }

    try {
      const tg = getTelegram()

      if (!tg?.initData) {
        alert(
          'Открой приложение через Telegram'
        )
        return
      }

      setOpeningCase(true)
      setLastReward(null)
      setShowResult(false)

      const response = await fetch(
        `${API_URL}/api/cases/open`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            initData: tg.initData,
            caseId
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.ok) {
        alert(
          data.error ||
          'Не удалось открыть кейс'
        )

        setOpeningCase(false)
        return
      }

      setBalance(data.balance)

      if (user) {
        setUser({
          ...user,
          balance: data.balance,
          inventory:
            data.inventory ||
            user.inventory
        })
      }

      await animateToReward(data.reward)

      setLastReward(data.reward)
      setShowResult(true)

    } catch (error) {
      console.error(error)

      alert(
        'Ошибка соединения с сервером'
      )
    } finally {
      setOpeningCase(false)
    }
  }

  const closeResult = () => {
    setShowResult(false)
  }

  const activatePromo = async () => {
  const tg = getTelegram()

  if (!tg?.initData) {
    alert('Открой приложение через Telegram')
    return
  }

  const code = window.prompt('Введите промокод')

  if (!code?.trim()) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/promo/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': tg.initData
      },
      body: JSON.stringify({
        code: code.trim()
      })
    })

    const data = await response.json()

    if (!response.ok || !data.ok) {
      alert(data.error || 'Не удалось активировать промокод')
      return
    }

    alert(`🎉 Промокод активирован!\n\n⭐ +${data.rewardStars} VeltoStars`)

    if (typeof data.balance === 'number') {
  setBalance(data.balance)
}
  } catch (error) {
    console.error('Promo activation error:', error)
    alert('Ошибка соединения с сервером')
  }
}

const spinRoulette = async () => {
    if (openingCase) {
      return
    }

    const tg = getTelegram()

    if (!tg?.initData) {
      alert('Открой приложение через Telegram')
      return
    }

    setOpeningCase(true)
    setShowResult(false)
    setLastReward(null)

    try {
      const response = await fetch(
        `${API_URL}/api/roulette/free`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            initData: tg.initData
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.ok) {
        if (data.remainingMs) {
          const totalMinutes = Math.ceil(
            data.remainingMs / 1000 / 60
          )

          const hours = Math.floor(
            totalMinutes / 60
          )

          const minutes = totalMinutes % 60

          alert(
            `Рулетка уже использована.\nСледующая попытка через ${hours} ч ${minutes} мин.`
          )

          return
        }

        alert(
          data.error ||
          'Не удалось запустить рулетку'
        )

        return
      }

      setBalance(data.balance)

      if (user) {
        setUser({
          ...user,
          balance: data.balance,
          inventory:
            data.inventory ||
            user.inventory
        })
      }

      await animateToReward(data.reward)

      setLastReward(data.reward)
      setShowResult(true)

    } catch (error) {
      console.error(error)

      alert(
        'Ошибка соединения с сервером'
      )
    } finally {
      setOpeningCase(false)
    }
  }

  const getPrizeVisual = (reward) => {
    return (
      PRIZE_VISUALS[reward?.id] ||
      PRIZE_VISUALS.common
    )
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
                ? `Привет, ${
                    user.firstName ||
                    'пользователь'
                  }`
                : 'Telegram Mini App'}
          </p>
        </div>

        <div className="balance">
          ⭐ {balance}
        </div>
      </header>

      <main className="content">
<TelegramGifts gifts={telegramGifts} />

        {page === 'home' && (
          <>
            <section className="hero">
              <div className="hero-badge">
                ✨ TELEGRAM GIFTS
              </div>

              <h2>
                VeltoGifts
              </h2>

              <p>
                Открывай кейсы, получай
                подарки и собирай свою
                коллекцию.
              </p>
            </section>

            <button
              className="main-button roulette-button"
              onClick={spinRoulette}
              disabled={openingCase}
            >
              <span>🎡</span>
              {openingCase
                ? 'Рулетка крутится...'
                : 'Бесплатная рулетка'}
            </button>

            <button
              className="main-button"
              onClick={activatePromo}
            >
              <span>🎟️</span>
              Активировать промокод
            </button>
            <div className="cards">

              <div className="card feature-card">
                <div className="feature-icon">
                  🎁
                </div>

                <h3>Кейсы</h3>

                <p>
                  Открывай доступные кейсы
                  и получай подарки.
                </p>

                <button
                  onClick={() =>
                    setPage('cases')
                  }
                >
                  Смотреть кейсы
                </button>
              </div>

              <div className="card feature-card">
                <div className="feature-icon">
                  🎒
                </div>

                <h3>Инвентарь</h3>

                <p>
                  Все твои полученные
                  подарки находятся здесь.
                </p>

                <button
                  onClick={() =>
                    setPage('inventory')
                  }
                >
                  Открыть инвентарь
                </button>
              </div>

            </div>

            {isAdmin && (
              <button
                className="main-button admin-button"
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
            <div className="page-heading">
              <h2>🎁 Кейсы</h2>

              <p>
                Выбери кейс и посмотри,
                что внутри.
              </p>
            </div>

            {openingCase && (
              <section className="reel-section">

                <div className="reel-title">
                  Открываем кейс...
                </div>

                <div className="reel-wrapper">

                  <div className="reel-pointer">
                    ▼
                  </div>

                  <div className="reel-window">

                    <div
                      className="reel-track"
                      style={{
                        transform:
                          `translateX(${reelOffset}px)`,

                        transition:
                          reelTransition
                      }}
                    >

                      {reelItems.map(
                        (item) => {

                          const visual =
                            PRIZE_VISUALS[
                              item.id
                            ] ||
                            PRIZE_VISUALS.common

                          return (
                            <div
                              className={`reel-item ${visual.className}`}
                              key={item.key}
                            >

                              <div className="reel-icon">
                                <img
                                  src={visual.image}
                                  alt={item.name}
                                />
                              </div>

                              <div className="reel-name">
                                {item.name}
                              </div>

                            </div>
                          )
                        }
                      )}

                    </div>

                  </div>

                  <div className="reel-pointer bottom">
                    ▲
                  </div>

                </div>

                <p className="reel-hint">
                  Результат определяется
                  сервером
                </p>

              </section>
            )}

            {!openingCase && (
              <div className="cards">

                <div className="case-card starter-case">

                  <div className="case-glow">
                    <img
                      src={commonGift}
                      alt="Common Gift"
                    />
                  </div>

                  <div className="case-info">

                    <span className="case-label">
                      STARTER
                    </span>

                    <h3>
                      Starter Case
                    </h3>

                    <p>
                      Базовый кейс
                      с подарком.
                    </p>

                    <div className="case-price">
                      ⭐ 10
                    </div>

                    <button
                      disabled={openingCase}
                      onClick={() =>
                        openCase('starter')
                      }
                    >
                      Открыть кейс
                    </button>

                  </div>

                </div>

                <div className="case-card premium-case">

                  <div className="case-glow">
                    <img
                      src={rareGift}
                      alt="Rare Gift"
                    />
                  </div>

                  <div className="case-info">

                    <span className="case-label">
                      PREMIUM
                    </span>

                    <h3>
                      Premium Case
                    </h3>

                    <p>
                      Премиальный кейс
                      с ценным подарком.
                    </p>

                    <div className="case-price">
                      ⭐ 50
                    </div>

                    <button
                      disabled={openingCase}
                      onClick={() =>
                        openCase('premium')
                      }
                    >
                      Открыть кейс
                    </button>

                  </div>

                </div>

              </div>
            )}

            {!openingCase &&
              lastReward && (
                <div className="last-reward">

                  <span>
                    Последняя награда
                  </span>

                  <strong>

                    <img
                      src={
                        getPrizeVisual(
                          lastReward
                        ).image
                      }
                      alt={lastReward.name}
                    />

                    {lastReward.name}

                  </strong>

                </div>
              )}

          </>
        )}

        {page === 'inventory' && (
          <>
            <div className="page-heading">

              <h2>
                🎒 Инвентарь
              </h2>

              <p>
                Твои полученные подарки.
              </p>

            </div>

            {user?.inventory?.length ? (

              <div className="inventory-grid">

                {user.inventory
                  .slice()
                  .reverse()
                  .map((item) => {

                    const visual =
                      getPrizeVisual(item)

                    return (
                      <div
                        className={`inventory-item ${visual.className}`}
                        key={item.id}
                      >

                        <div className="inventory-icon">

                          <img
                            src={visual.image}
                            alt={item.name}
                          />

                        </div>

                        <h3>
                          {item.name}
                        </h3>

                        <p>
                          💎 {item.value}
                        </p>

                        <small>
                          📦 {item.caseName}
                        </small>

                      </div>
                    )
                  })}

              </div>

            ) : (

              <div className="empty">

                <div className="empty-icon">
                  🎁
                </div>

                <p>
                  Инвентарь пока пуст.
                </p>

              </div>

            )}

          </>
        )}

        {page === 'profile' && (
          <>
            <div className="page-heading">

              <h2>
                👤 Профиль
              </h2>

              <p>
                Информация о твоём
                Telegram аккаунте.
              </p>

            </div>

            <div className="profile">

              <div className="profile-avatar">

                {user?.firstName
                  ?.charAt(0)
                  ?.toUpperCase() || 'U'}

              </div>

              <p>
                <b>Имя</b>

                <span>
                  {user?.firstName ||
                    'Не определено'}
                </span>
              </p>

              <p>
                <b>Username</b>

                <span>
                  {user?.username
                    ? `@${user.username}`
                    : 'Не указан'}
                </span>
              </p>

              <p>
                <b>Telegram ID</b>

                <span>
                  {user?.telegramId ||
                    'Не определён'}
                </span>
              </p>

              <p>
                <b>Баланс</b>

                <span>
                  ⭐ {balance}
                </span>
              </p>

            </div>
          </>
        )}

        {page === 'admin' &&
          isAdmin && (
            <>
              <div className="page-heading">

                <h2>
                  🛡️ Админ-панель
                </h2>

                <p>
                  Управление пользователями
                  VeltoGifts.
                </p>

              </div>

              <button
                className="main-button"
                onClick={loadUsers}
              >
                🔄 Обновить пользователей
              </button>

              {adminLoading ? (

                <div className="empty">
                  <p>
                    Загрузка пользователей...
                  </p>
                </div>

              ) : users.length === 0 ? (

                <div className="empty">

                  <div>
                    👥
                  </div>

                  <p>
                    Пользователей пока нет.
                  </p>

                </div>

              ) : (

                <div className="cards">

                  {users.map((item) => (

                    <div
                      className="card admin-user"
                      key={item.telegramId}
                    >

                      <h3>
                        👤{' '}
                        {item.firstName ||
                          'Без имени'}
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
                        ⭐ Баланс:{' '}
                        {item.balance}
                      </p>

                      <p>
                        🎁 Подарков:{' '}
                        {item.inventoryCount}
                      </p>

                      <p>
                        Статус:{' '}
                        {item.blocked
                          ? '🚫 Заблокирован'
                          : '🟢 Активен'}
                      </p>

                      <button
                        onClick={() =>
                          askBalance(
                            item.telegramId
                          )
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

        <button
          className={
            page === 'home'
              ? 'active'
              : ''
          }
          onClick={() =>
            setPage('home')
          }
        >
          🏠
          <span>
            Главная
          </span>
        </button>

        <button
          className={
            page === 'cases'
              ? 'active'
              : ''
          }
          onClick={() =>
            setPage('cases')
          }
        >
          🎁
          <span>
            Кейсы
          </span>
        </button>

        <button
          className={
            page === 'inventory'
              ? 'active'
              : ''
          }
          onClick={() =>
            setPage('inventory')
          }
        >
          🎒
          <span>
            Инвентарь
          </span>
        </button>

        <button
          className={
            page === 'profile'
              ? 'active'
              : ''
          }
          onClick={() =>
            setPage('profile')
          }
        >
          👤
          <span>
            Профиль
          </span>
        </button>

      </nav>

      {showResult && lastReward && (

        <div
          className="result-overlay"
          onClick={closeResult}
        >

          <div
            className="result-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="result-sparkles">
              ✨
            </div>

            <div className="result-icon">

              <img
                src={
                  getPrizeVisual(
                    lastReward
                  ).image
                }
                alt={lastReward.name}
              />

            </div>

            <div className="result-label">
              ПОЗДРАВЛЯЕМ
            </div>

            <h2>
              {lastReward.name}
            </h2>

            <p>
              🎁 Подарок добавлен
              в твой инвентарь
            </p>

            <div className="result-value">
              💎 {lastReward.value}
            </div>

            <button
              className="main-button"
              onClick={closeResult}
            >
              Забрать
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

export default App
