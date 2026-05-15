import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/sellers').then((r) => setSellers(r.data)).finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    try {
      const { data } = await api.patch(`/admin/sellers/${id}/approve`);
      setSellers((prev) => prev.map((s) => s.id === id ? { ...s, is_approved: data.is_approved } : s));
      toast.success('Seller approved');
    } catch { toast.error('Failed'); }
  };

  const reject = async (id) => {
    try {
      const { data } = await api.patch(`/admin/sellers/${id}/reject`);
      setSellers((prev) => prev.map((s) => s.id === id ? { ...s, is_approved: data.is_approved } : s));
      toast.success('Seller rejected');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Sellers ({sellers.length})</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {sellers.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900">{s.store_name}</p>
                <p className="text-sm text-gray-500">{s.users?.name} · {s.users?.email}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {s.is_approved ? 'Approved' : 'Pending'}
              </span>
            </div>
            {s.bio && <p className="text-xs text-gray-500 mb-3">{s.bio}</p>}
            <p className="text-xs text-gray-400">Joined {new Date(s.created_at).toLocaleDateString()}</p>
            {!s.is_approved ? (
              <div className="flex gap-2 mt-4">
                <button onClick={() => approve(s.id)} className="flex items-center gap-1.5 flex-1 justify-center bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700">
                  <CheckCircleIcon className="h-4 w-4" /> Approve
                </button>
              </div>
            ) : (
              <button onClick={() => reject(s.id)} className="flex items-center gap-1.5 w-full justify-center mt-4 bg-red-50 text-red-600 text-sm py-2 rounded-lg hover:bg-red-100">
                <XCircleIcon className="h-4 w-4" /> Revoke Approval
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
