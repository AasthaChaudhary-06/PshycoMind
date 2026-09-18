import { useDispatch, useSelector } from 'react-redux'
import { Dashboard, Modal, Upload } from '../components'
import { selectUploadModalOpen } from '../features/ui/uiSelectors'
import { setUploadModalOpen } from '../features/ui/uiSlice'

export default function DashboardPage() {
  const dispatch = useDispatch()
  const isOpen = useSelector(selectUploadModalOpen)

  return (
    <>
      <Dashboard onUpload={() => dispatch(setUploadModalOpen(true))} />
      <Modal
        isOpen={isOpen}
        onClose={() => dispatch(setUploadModalOpen(false))}
        title="Upload PDF"
      >
        <Upload onSuccess={() => dispatch(setUploadModalOpen(false))} />
      </Modal>
    </>
  )
}
