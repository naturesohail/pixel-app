'use client';
import React, { useState, useEffect } from 'react';
import FrontEndLayout from '@/app/layouts/FrontendLayout';
import { Spinner } from '@/app/utills/Spinner';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/context/AuthContext';

// Define Transaction type
type Transaction = {
  _id: string;
  productId: {
    _id: string;
    title: string;
  };
  amount: number;
  pixelCount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionDate: string;
};

export default function TransactionsView() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch(`/api/transactions`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const { transactions } = await res.json();
        setTransactions(transactions);
        setFilteredTransactions(transactions);
      } catch (err) {
        console.error('Error loading transactions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) fetchTransactions();
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredTransactions(
      transactions.filter(
        (transaction) =>
          transaction.productId.title.toLowerCase().includes(value) ||
          transaction.status.toLowerCase().includes(value)
      )
    );
  };

  return (
    <FrontEndLayout>
      <Header />

      <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg" style={{ marginTop: "200px" }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by product or status"
            className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:ring"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-gray-500">No Transactions Found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">#</th>
                  <th className="px-4 py-2 border-b">Product</th>
                  <th className="px-4 py-2 border-b">Amount</th>
                  <th className="px-4 py-2 border-b">Pixels</th>
                  <th className="px-4 py-2 border-b">Date</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{index + 1}</td>
                    <td className="px-4 py-2 border-b">{transaction?.productId?.title}</td>
                    <td className="px-4 py-2 border-b">${transaction?.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 border-b">{transaction?.pixelCount.toLocaleString()}</td>
                    <td className="px-4 py-2 border-b">
                      {new Date(transaction?.transactionDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction?.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction?.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction?.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b capitalize">
                      {transaction?.paymentMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FrontEndLayout>
  );
}