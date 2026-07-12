type Props = {
  label: string
  name: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
}

export default function Input({ label, name, value, onChange, type = 'text', required, placeholder }: Props) {
  return (
    <div className='flex flex-col gap-1'>
      <label className='text-xs font-medium text-gray-600'>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        placeholder={placeholder}
        className='border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
      />
    </div>
  )
}