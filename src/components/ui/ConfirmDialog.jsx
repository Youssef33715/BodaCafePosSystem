import { FiAlertTriangle } from 'react-icons/fi'
import Modal from './Modal'
import Button from './Button'
import { useLang } from '../../context/LanguageContext'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = true }) {
  const { t } = useLang()
  return (
    <Modal open={open} onClose={onClose} size="sm" title="">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ${danger ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'}`}>
          <FiAlertTriangle />
        </div>
        <div>
          <h3 className="text-lg font-bold text-txt font-display">{title}</h3>
          <p className="text-sm text-txt-secondary mt-2">{message}</p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>{t.common.cancel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} fullWidth onClick={() => { onConfirm(); onClose() }}>
            {t.common.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
