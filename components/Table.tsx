type Props = {
  headers: string[]
  children: React.ReactNode
  empty?: string
}

export default function Table({ headers, children, empty = 'No records found' }: Props) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-gray-100 bg-gray-50'>
            {headers.map(h => (
              <th key={h} className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3'>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  )
}