import { useState } from "react"
import styles from "../styles/WantedToggle.module.scss"
import classNames from "classnames/bind"
const cn = classNames.bind(styles)

export default function WantedToggle({ heading, imgSources = [] }) {
  const [showModal, setShowModal] = useState(false)

  const modal = (
    <div className={cn("Modal")}>
      <div className={cn("Modal__background")}>
        <div className={cn("Modal__foreground")}>
          <h2 className={cn("Modal__heading")}>{heading}</h2>

          <div className={cn("Modal__imgs")}>
            {imgSources.map((source) => (
              <img src={source} className={cn("Modal__img")} />
            ))}
          </div>

          <div className={cn("Modal__btnContainer")}>
            <button
              className={cn("Modal__btn")}
              onClick={() => setShowModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn("WantedToggle")}>
      <button
        className={cn("WantedToggle__toggleBtn")}
        onClick={() => setShowModal(true)}
      >
        ?
      </button>

      {showModal ? modal : null}
    </div>
  )
}
