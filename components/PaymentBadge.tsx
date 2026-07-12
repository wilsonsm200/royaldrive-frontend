type Props = {
  status: string
}

const colors: Record<string, string> = {
  // Capitalized
  Paid: 'bg-green-100 text-green-700',
  Partial: 'bg-yellow-100 text-yellow-700',
  Pending: 'bg-gray-100 text-gray-600',
  Overdue: 'bg-red-100 text-red-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Active: 'bg-green-100 text-green-700',
  Ended: 'bg-gray-100 text-gray-500',
  Available: 'bg-green-100 text-green-700',
  'On Trip': 'bg-blue-100 text-blue-700',
  'In Service': 'bg-yellow-100 text-yellow-700',
  Leased: 'bg-purple-100 text-purple-700',
  // Lowercase versions
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-600',
  overdue: 'bg-red-100 text-red-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  ended: 'bg-gray-100 text-gray-500',
  available: 'bg-green-100 text-green-700',
  'on trip': 'bg-blue-100 text-blue-700',
  'in service': 'bg-yellow-100 text-yellow-700',
  leased: 'bg-purple-100 text-purple-700',
  'in progress': 'bg-blue-100 text-blue-700',
  monthly: 'bg-purple-100 text-purple-700',
  weekly: 'bg-orange-100 text-orange-700',
}

export default function PaymentBadge({ status }: Props) {
  const style = colors[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={'inline-block px-2 py-0.5 rounded-full text-xs font-medium ' + style}>
      {status}
    </span>
  )
}