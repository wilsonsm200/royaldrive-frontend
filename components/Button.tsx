type Props = {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled }: Props) {
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ' + styles[variant]}>
      {children}
    </button>
  )
}