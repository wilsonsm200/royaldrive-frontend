type Props = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: string[]
  required?: boolean
}

export default function Select({ label, name, value, onChange, options, required }: Props) {
  return (
    <div className='flex flex-col gap-1'>
      <label className='text-xs font-medium text-gray-600'>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className='border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white'>
        <option value=''>Select...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}