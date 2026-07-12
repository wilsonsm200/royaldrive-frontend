type Props = {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ title, onClose, children }: Props) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl w-full max-w-lg shadow-xl'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <h3 className='font-semibold text-gray-800'>{title}</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 text-xl leading-none'>&times;</button>
        </div>
        <div className='px-6 py-5'>
          {children}
        </div>
      </div>
    </div>
  )
}