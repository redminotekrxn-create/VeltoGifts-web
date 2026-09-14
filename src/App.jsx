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

function App() {
  const [page, setPage] = useState('home')
  const [balance, setBalance] = useState(0)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false) 
  const [cases, setCases] = useState([])
  const [casesLoading, setCasesLoading] = useState(true)

  const [openingCase, setOpeningCase] = useState(false)
  const [lastReward, setLastReward] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const [reelItems, setReelItems] = useState(REEL_ITEMS)
  const [reelOffset, setReelOffset] = useState(0)
  const [reelTransition, setReelTransition] = useState('none')

  useEffect(() => {
    loadUser()
    loadCases()
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

  const loadUsers = async () => {const loadCases = async () => {
  try {
    setCasesLoading(true)

    const response = await fetch(`${API_URL}/api/cases`)
    const data = await response.json()

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Не удалось загрузить кейсы')
    }

    setCases(Object.values(data.cases || {}))
  } catch (error) {
    console.error('Cases API error:', error)
  } finally {
    setCasesLoading(false)
  }
}
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
const prepareReel = (reward, currentCase) => {
  const caseGifts = currentCase?.gifts || []

  const reelGifts = caseGifts.map((gift) => ({
    id: String(gift.giftId),
    name: '🎁',
    value: 0,
    image: `${API_URL}/api/telegram/gift-image/${encodeURIComponent(gift.giftId)}`
  }))

  if (!reelGifts.length) {
    setReelItems(REEL_ITEMS)
    return 0
  }

  const items = []

  for (let i = 0; i < 28; i++) {
    items.push({
      ...reelGifts[i % reelGifts.length],
      key: `${i}-${Math.random()}`
    })
  }

  const winnerIndex = 24

  items[winnerIndex] = {
    id: String(reward?.id || ''),
    name: reward?.name || '🎁',
    value: reward?.value || 0,
    image: reward?.image
      ? `${API_URL}${reward.image}`
      : `${API_URL}/api/telegram/gift-image/${encodeURIComponent(reward?.id || '')}`,
    key: `winner-${Math.random()}`
  }

  setReelItems(items)

  return winnerIndex
}
  const animateToReward = async (reward, currentCase) => {
  const winnerIndex = prepareReel(reward, currentCase)

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

      const currentCase = cases.find(
  (item) => item.id === caseId
)

await animateToReward(data.reward, currentCase)

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

      const currentCase = cases.find(
  (item) => item.id === caseId
)

await animateToReward(data.reward, currentCase)

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
    if (reward?.image) {
      return {
        ...PRIZE_VISUALS.common,
        image: `${API_URL}${reward.image}`
      }
    }

    return PRIZE_VISUALS[reward?.id] || PRIZE_VISUALS.common
  }

  const getCaseGift = (id) => {
    if (!id) return null

    return {
      image: `/api/telegram/gift-image/${encodeURIComponent(id)}`
    }
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
                              item.image
                                ? {
                                    ...PRIZE_VISUALS.common,
                                    image: item.image
                                  }
                                : PRIZE_VISUALS[item.id] || PRIZE_VISUALS.common

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

<div className="case-card poor-case">
  <div className="case-glow">
    {getCaseGift('5170145012310081615') && (
      <img
        src={`${API_URL}${getCaseGift('5170145012310081615').image}`}
        alt="🥔 Бомж"
      />
    )}
  </div>

  <div className="case-info">
    <span className="case-label">🥔 БОМЖ</span>
    <h3>Бомж</h3>
    <p>Подарки до 200 ⭐</p>
    <div className="case-price">⭐ 50</div>
    <button
      disabled={openingCase}
      onClick={() => openCase('poor')}
    >
      Открыть кейс
    </button>
  </div>
</div>

<div className="case-card newbie-case">
  <div className="case-glow">
    {getCaseGift('5170250947678437525') && (
      <img
        src={`${API_URL}${getCaseGift('5170250947678437525').image}`}
        alt="🆕 Новенький"
      />
    )}
  </div>

  <div className="case-info">
    <span className="case-label">🆕 НОВЕНЬКИЙ</span>
    <h3>Новенький</h3>
    <p>Подарки до 300 ⭐</p>
    <div className="case-price">⭐ 150</div>
    <button
      disabled={openingCase}
      onClick={() => openCase('newbie')}
    >
      Открыть кейс
    </button>
  </div>
</div>

<div className="case-card rich-case">
  <div className="case-glow">
    {getCaseGift('5170564780938756245') && (
      <img
        src={`${API_URL}${getCaseGift('5170564780938756245').image}`}
        alt="💰 Богач"
      />
    )}
  </div>

  <div className="case-info">
    <span className="case-label">💰 БОГАЧ</span>
    <h3>Богач</h3>
    <p>Подарки до 500 ⭐</p>
    <div className="case-price">⭐ 300</div>
    <button
      disabled={openingCase}
      onClick={() => openCase('rich')}
    >
      Открыть кейс
    </button>
  </div>
</div>

<div className="case-card billionaire-case">
  <div className="case-glow">
    {getCaseGift('5170521118301225164') && (
      <img
        src={`${API_URL}${getCaseGift('5170521118301225164').image}`}
        alt="👑 Миллиардер"
      />
    )}
  </div>

  <div className="case-info">
    <span className="case-label">👑 МИЛЛИАРДЕР</span>
    <h3>Миллиардер</h3>
    <p>Редкие Telegram-подарки</p>
    <div className="case-price">⭐ 699</div>
    <button
      disabled={openingCase}
      onClick={() => openCase('billionaire')}
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
