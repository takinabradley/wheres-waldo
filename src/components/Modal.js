import classNames from "classnames/bind"
import styles from "../styles/Modal.module.scss"
const cn = classNames.bind(styles)

export default function Modal({
  heading,
  description,
  okButtonText = "Ok",
  onOK
}) {
  function fireCallback() {
    if (typeof onOK === "function") onOK()
  }

  return (
    <div className={cn("modal")}>
      <div className={cn("modal-background")}>
        <div className={cn("modal-foreground")}>
          <h2 className={cn("modal__heading")}>{heading}</h2>
          <p className={cn("modal__description")}>{description}</p>
          <div className={cn("modal__button-container")}>
            <button className={cn("modal__button")} onClick={fireCallback}>
              {okButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
