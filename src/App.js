import { useEffect, useState } from "react"
import useSecondsTimer from "./hooks/useSecondsTimer"
import SearchImage from "./components/SearchImage"
import locNarImg from "./images/the-loc-nar.jpg"
import classNames from "classnames/bind"
import styles from "./styles/App.module.scss"
import Modal from "./components/Modal"
import amosImg from "./images/amos.png"
import waldoImg from "./images/waldo.png"
import wormImg from "./images/worm.png"
import WantedToggle from "./components/WantedToggle"
import { readCharacterList } from "./modules/firestore"
const cn = classNames.bind(styles)

export default function App() {
  // can be used to notify SearchImage when components around it load/unload so
  // it can update markers
  const [DOMMutationToken, notifyDOMMutation] = useState(null)

  // ability to add and remove a timer that counts up in seconds
  const [gameWon, setGameWon] = useState(false)

  // save list of characters to state after fetching from db
  const [characters, setCharacters] = useState([])

  // know ehen to show the intro modal
  const [showIntro, setShowIntro] = useState(true)

  // use this to remount searchimage at end of game easily.
  const [searchImageKey, setSearchImageKey] = useState(Date.now())

  useEffect(() => {
    readCharacterList().then((data) => setCharacters(data.characterList))
  }, [])

  const [secondsPassed, stopTimer, startTimer] = useSecondsTimer(
    Date.now(),
    true
  )

  function winGame(pos) {
    setGameWon(true)
    stopTimer()
  }

  function startGame() {
    setShowIntro(false)
    startTimer()
  }

  function restartGame() {
    setGameWon(false)
    setShowIntro(true)
    setSearchImageKey(Date.now())
  }

  const introModal = showIntro ? (
    <Modal
      heading="How To Play"
      description={
        "Search the image for characters, and click on them all to win the game!\n Click the question mark (?) icon to view characters."
      }
      okButtonText="Start Game"
      onOK={startGame}
    />
  ) : null

  const gameWinModal = gameWon ? (
    <Modal
      heading="You Win!"
      description={`It took you ${secondsPassed} seconds to find the characters!`}
      onOK={restartGame}
      okButtonText="Play Again"
    />
  ) : null

  return (
    <div className={cn("app")}>
      {introModal}
      {gameWinModal}
      <header
        className={cn("app__header")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1em"
        }}
      >
        <h1 className={cn("app__heading")}>Where's Waldo</h1>
        <span className={cn("app__timer")}>{secondsPassed}</span>
      </header>

      <WantedToggle
        imgSources={[amosImg, waldoImg, wormImg]}
        heading="WANTED"
      />
      <main className={cn("app__main")}>
        <div className="components">
          <SearchImage
            key={searchImageKey}
            img={locNarImg}
            characters={characters}
            onAllCharactersFound={winGame}
            style={{ width: "100%", height: "100%" }}
            DOMMutationNotification={DOMMutationToken}
          />
        </div>
      </main>
    </div>
  )
}
