'use client'

import { useEffect, useState } from 'react'

interface Beneficiary {
  id: number
  name: string
  account: string
}

interface Transaction {
  id: number
  account: string
  amount: string
  date: string
}

export default function TransferPage() {
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [otp, setOtp] = useState('')
  const [serverOtp, setServerOtp] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [newName, setNewName] = useState('')
  const [newAccount, setNewAccount] = useState('')

  // Fetch beneficiaries
  useEffect(() => {
    fetch('https://my-bank-backend.onrender.com/api/beneficiaries')
      .then((res) => res.json())
      .then((data) => setBeneficiaries(data))
      .catch((err) => console.error('Failed to load beneficiaries:', err))
  }, [])

  // Fetch transactions when transfer completes
  useEffect(() => {
    fetch('https://my-bank-backend.onrender.com/api/transactions')
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error('Failed to load transactions:', err))
  }, [message])

  const sendOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://my-bank-backend.onrender.com/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      const receivedOtp = String(data.otp)
      setServerOtp(receivedOtp)
      console.log('🔐 OTP received from server:', receivedOtp)
      setMessage('OTP sent successfully!')
    } catch (err) {
      console.error('Failed to send OTP:', err)
      setMessage('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const transferFunds = async () => {
    if (!account || !amount || !otp) {
      setMessage('Please fill all fields')
      return
    }

    if (otp.trim() !== serverOtp.trim()) {
      console.warn('❌ Entered OTP does not match server OTP')
      setMessage('Invalid OTP')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('https://my-bank-backend.onrender.com/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, amount, otp }),
      })
      const data = await res.json()
      console.log('✅ Transfer response:', data)
      setMessage(data.message || 'Transfer completed')
      setAccount('')
      setAmount('')
      setOtp('')
    } catch (err) {
      console.error('Transfer failed:', err)
      setMessage('Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  const addBeneficiary = async () => {
    if (!newName || !newAccount) {
      setMessage('Please enter name and account number')
      return
    }

    try {
      const res = await fetch('https://my-bank-backend.onrender.com/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, account: newAccount }),
      })
      const data = await res.json()
      if (data.success) {
        setBeneficiaries((prev) => [...prev, data.beneficiary])
        setNewName('')
        setNewAccount('')
        setMessage('Beneficiary added successfully!')
      } else {
        setMessage(data.message || 'Failed to add beneficiary')
      }
    } catch (err) {
      console.error('Add beneficiary failed:', err)
      setMessage('Add beneficiary failed')
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Fund Transfer</h2>

      {/* Add Beneficiary Form */}
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Add Beneficiary</h3>
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Account Number"
          value={newAccount}
          onChange={(e) => setNewAccount(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={addBeneficiary}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Add Beneficiary
        </button>
      </div>

      {/* Beneficiary Dropdown */}
      <select
        onChange={(e) => setAccount(e.target.value)}
        className="w-full mb-3 p-2 border rounded bg-gray-50"
        value={account}
      >
        <option value="">Select Beneficiary</option>
        {beneficiaries.map((b) => (
          <option key={b.id} value={b.account}>
            {b.name} ({b.account})
          </option>
        ))}
      </select>

      {/* Amount Input */}
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Send OTP Button */}
      <button
        onClick={sendOtp}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>

      {/* OTP Input */}
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full mt-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Transfer Button */}
      <button
        onClick={transferFunds}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-3 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Transfer'}
      </button>

      {/* Message */}
      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}

      {/* Transaction History */}
      <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Transaction History</h3>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Account</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-t">
              <td className="p-2">{tx.id}</td>
              <td className="p-2">{tx.account}</td>
              <td className="p-2">₹{tx.amount}</td>
              <td className="p-2">{new Date(tx.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}