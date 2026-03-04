import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const GRID_SIZE = 15
const INITIAL_SPEED = 150

function App() {
  const [snake, setSnake] = useState([{ x: 7, y: 7 }])
  const [food, setFood] = useState({ x: 10, y: 10 })
  const [direction, setDirection] = useState('right')
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const gameLoopRef = useRef(null)
  const directionRef = useRef('right')

  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [snake])

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }])
    setFood({ x: 10, y: 10 })
    setDirection('right')
    directionRef.current = 'right'
    setGameStarted(false)
    setGameOver(false)
    setScore(0)
  }

  const startGame = () => {
    if (gameOver) {
      resetGame()
    }
    setGameStarted(true)
  }

  const changeDirection = useCallback((newDirection) => {
    const current = directionRef.current
    if (
      (newDirection === 'up' && current !== 'down') ||
      (newDirection === 'down' && current !== 'up') ||
      (newDirection === 'left' && current !== 'right') ||
      (newDirection === 'right' && current !== 'left')
    ) {
      directionRef.current = newDirection
      setDirection(newDirection)
    }
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0]
        const newHead = { ...head }

        switch (directionRef.current) {
          case 'up': newHead.y -= 1; break
          case 'down': newHead.y += 1; break
          case 'left': newHead.x -= 1; break
          case 'right': newHead.x += 1; break
        }

        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true)
          setGameStarted(false)
          return prevSnake
        }

        const newSnake = [newHead, ...prevSnake]

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1)
          setFood(generateFood())
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }

    gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED)
    return () => clearInterval(gameLoopRef.current)
  }, [gameStarted, gameOver, food, generateFood])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && !gameOver) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
          startGame()
        }
      }
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection('down')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection('right')
          break
      }
    }

    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const diffX = touchEndX - touchStartX
      const diffY = touchEndY - touchStartY

      if (!gameStarted && !gameOver) {
        startGame()
      }

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30) changeDirection('right')
        else if (diffX < -30) changeDirection('left')
      } else {
        if (diffY > 30) changeDirection('down')
        else if (diffY < -30) changeDirection('up')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameStarted, gameOver, changeDirection])

  return (
    <div className="game-container">
      <h1 className="title">贪吃蛇小游戏</h1>
      <div className="score">得分: {score}</div>
      
      <div className="game-board">
        {Array.from({ length: GRID_SIZE }).map((_, y) => (
          <div key={y} className="row">
            {Array.from({ length: GRID_SIZE }).map((_, x) => {
              const isSnake = snake.some(segment => segment.x === x && segment.y === y)
              const isHead = snake[0].x === x && snake[0].y === y
              const isFood = food.x === x && food.y === y
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`cell ${isSnake ? 'snake' : ''} ${isHead ? 'snake-head' : ''} ${isFood ? 'food' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {!gameStarted && !gameOver && (
        <button className="start-btn" onClick={startGame}>
          开始游戏
        </button>
      )}

      {gameOver && (
        <div className="game-over">
          <p>游戏结束!</p>
          <button className="start-btn" onClick={resetGame}>
            重新开始
          </button>
        </div>
      )}

      <div className="controls-hint">
        <p>电脑端：使用方向键 或 WASD 控制</p>
        <p>手机端：使用下方按钮或滑动手势控制</p>
      </div>

      <div className="mobile-controls">
        <button className="control-btn up" onClick={() => { if(!gameStarted) startGame(); changeDirection('up') }}>↑</button>
        <div className="control-row">
          <button className="control-btn left" onClick={() => { if(!gameStarted) startGame(); changeDirection('left') }}>←</button>
          <button className="control-btn down" onClick={() => { if(!gameStarted) startGame(); changeDirection('down') }}>↓</button>
          <button className="control-btn right" onClick={() => { if(!gameStarted) startGame(); changeDirection('right') }}>→</button>
        </div>
      </div>
    </div>
  )
}

export default App
