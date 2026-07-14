// CustomerDrawer.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Mail, Phone, MapPin, Calendar, ShoppingBag,
  DollarSign, TrendingUp, Plus, Clock, ExternalLink,
  AlertCircle, CheckCircle2, Ban, Loader2, StickyNote,
  PackageSearch
} from 'lucide-react';

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}
const AVATAR_COLORS = [
  'bg-indigo-500','bg-violet-500','bg-emerald-500','bg-rose-500',
  'bg-amber-500','bg-cyan-500','bg-pink-500','bg-teal-500'
];
function avatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}
function fmtDate(d, opts = {}) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric', ...opts
  });
}
function fmtMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);
}

const STATUS_CFG = {
  active:    { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  inactive:  { cls: 'bg-amber-100   text-amber-700   border-amber-200',   Icon: AlertCircle  },
  suspended: { cls: 'bg-red-100     text-red-700     border-red-200',     Icon: Ban          }
};

function StatusBadge({ status }) {
  const { cls, Icon } = STATUS_CFG[status] || STATUS_CFG.inactive;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                      border capitalize ${cls}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

const ORDER_STATUS_CLS = {
  pending:    'bg-yellow-50  text-yellow-700',
  processing: 'bg-blue-50    text-blue-700',
  shipped:    'bg-indigo-50  text-indigo-700',
  delivered:  'bg-emerald-50 text-emerald-700',
  cancelled:  'bg-red-50     text-red-700'
};
function OrderStatusPill({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize
                      ${ORDER_STATUS_CLS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function SectionHeading({ children }) {
  return (
    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </h4>
  );
}

function StatBox({ icon: Icon, label, value, colorCls }) {
  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl ${colorCls}`}>
      <Icon className="h-4 w-4 mb-1 opacity-60" />
      <p className="text-[10px] text-current opacity-60 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-lg font-extrabold leading-tight mt-0.5">{value}</p>
    </div>
  );
}

export default function CustomerDrawer({ customer, open, onClose, onUpdate, apiBase }) {
  const [orders,     setOrders]     = useState([]);
  const [stats,      setStats]      = useState({ totalOrders: 0, totalSpent: 0, aov: 0 });
  const [loadingDet, setLoadingDet] = useState(false);

  const [localNotes, setLocalNotes] = useState([]);

  const [noteText,   setNoteText]   = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [toggling,   setToggling]   = useState(false);

  const noteRef = useRef(null);

  useEffect(() => {
    if (!customer?._id || !open) return;

    setLocalNotes(customer.notes || []);
    setOrders([]);
    setStats({ totalOrders: 0, totalSpent: 0, aov: 0 });

    const fetchDetail = async () => {
      setLoadingDet(true);
      try {
        const res = await fetch(
          `${apiBase}/api/admin/customers/${customer._id}`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Detail fetch failed');
        const { data } = await res.json();
        console.log('[CustomerDrawer] fetched detail', data);
        setOrders(data.orders   || []);
        setStats(data.stats     || { totalOrders: 0, totalSpent: 0, aov: 0 });
        setLocalNotes(data.customer?.notes || []);
      } catch (err) {
        console.error('[CustomerDrawer]', err);
      } finally {
        setLoadingDet(false);
      }
    };

    fetchDetail();
  }, [customer?._id, open, apiBase]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim() || addingNote) return;
    setAddingNote(true);
    try {
      const updated = await onUpdate(customer._id, { note: noteText.trim() });
      setLocalNotes(updated.notes || []);
      setNoteText('');
      noteRef.current?.focus();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  }, [noteText, addingNote, customer?._id, onUpdate]);

  const handleToggleStatus = useCallback(async () => {
    if (toggling) return;
    const newStatus = customer.status === 'suspended' ? 'active' : 'suspended';
    setToggling(true);
    try {
      await onUpdate(customer._id, { status: newStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  }, [toggling, customer, onUpdate]);

  const visible = !!customer;

  return (
   <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
                    ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

    <aside
  role="dialog"
  aria-modal="true"
  aria-label="Customer profile"
  className={`fixed inset-0 z-50 flex items-center justify-center p-4
              transition-all duration-300
              ${
                open
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              }`}
>
  <div
    className={`bg-white w-full h-full max-w-[480px] md:max-w-[520px] lg:max-w-[600px]
                rounded-2xl shadow-2xl overflow-hidden
                flex flex-col transition-all duration-300
                ${
                  open
                    ? 'scale-100 translate-y-0'
                    : 'scale-95 translate-y-4'
                }`}
  >
    {!visible ? null : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 text-base">Customer Profile</h2>
                {loadingDet && (
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5 text-gray-800" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">

              <div className="p-5 border-b border-gray-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl ${avatarColor(customer.name)}
                                flex items-center justify-center text-black text-xl
                                font-extrabold flex-shrink-0 shadow-sm select-none`}
                  >
                    {initials(customer.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight truncate">
                        {customer.name}
                      </h3>
                      <StatusBadge status={customer.status} />
                    </div>

                    <ul className="mt-2 space-y-1">
                      <ContactItem icon={Mail}     text={customer.email} />
                      {customer.phone     && <ContactItem icon={Phone}    text={customer.phone} />}
                      {customer.location?.city && (
                        <ContactItem icon={MapPin}
                          text={`${customer.location.city}, ${customer.location.country}`}
                        />
                      )}
                      <ContactItem
                        icon={Calendar}
                        text={`Joined ${fmtDate(customer.createdAt)}`}
                      />
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className={`w-full py-2 text-sm font-semibold rounded-xl border
                              transition-colors disabled:opacity-50
                              ${customer.status === 'suspended'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50     text-red-700     border-red-200     hover:bg-red-100'}`}
                >
                  {toggling
                    ? <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                      </span>
                    : customer.status === 'suspended'
                    ? '✓  Reactivate Account'
                    : '⚠  Suspend Account'
                  }
                </button>
              </div>

              <div className="p-5 border-b border-gray-100">
                <SectionHeading>Financial Overview</SectionHeading>

                {loadingDet ? (
                  <div className="flex gap-3 animate-pulse">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex-1 h-20 bg-gray-100 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <StatBox
                      icon={ShoppingBag}
                      label="Orders"
                      value={(stats?.totalOrders || 0).toLocaleString()}
                      colorCls="bg-indigo-50 text-black"
                    />
                    <StatBox
                      icon={DollarSign}
                      label="LTV"
                      value={fmtMoney(stats?.totalSpent || 0)}
                      colorCls="bg-emerald-50 text-black"
                    />
                    <StatBox
                      icon={TrendingUp}
                      label="AOV"
                      value={fmtMoney(stats?.aov)}
                      colorCls="bg-violet-50 text-black"
                    />
                  </div>
                )}
              </div>

              <div className="p-5 border-b border-gray-100">
                <SectionHeading>Recent Orders</SectionHeading>

                {loadingDet ? (
                  <div className="space-y-2 animate-pulse">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
                    <PackageSearch className="h-8 w-8 text-gray-300" />
                    <p className="text-sm">No orders placed yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map(order => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between bg-gray-50 hover:bg-indigo-50/40
                                   border border-gray-100 rounded-xl px-3 py-2.5 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-mono font-semibold text-gray-600">
                            #{String(order._id).slice(-8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {fmtDate(order.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <OrderStatusPill status={order.status} />
                          <span className="text-sm font-bold text-gray-900">
                            {fmtMoney(order.totalPrice)}
                          </span>
                          <a
                            href={`/admin/orders/${order._id}`}
                            className="text-gray-300 hover:text-indigo-600 transition-colors"
                            title="Open order"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 pb-8">
                <SectionHeading>Admin Notes</SectionHeading>

                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <StickyNote
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300
                                 pointer-events-none"
                    />
                    <input
                      ref={noteRef}
                      type="text"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                      placeholder="Add a timeline note… (Enter to save)"
                      className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl
                                 bg-gray-50 placeholder-gray-400 text-gray-800
                                 focus:outline-none focus:ring-2 focus:ring-indigo-400
                                 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || addingNote}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-600
                               text-white hover:bg-indigo-700 disabled:opacity-40
                               disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    aria-label="Add note"
                  >
                    {addingNote
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Plus className="h-4 w-4" />
                    }
                  </button>
                </div>

                {localNotes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No notes yet — add the first one above
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {[...localNotes].reverse().map((note, i) => (
                      <div
                        key={i}
                        className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3"
                      >
                        <p className="text-sm text-gray-800 leading-relaxed">{note.text}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-[11px] text-gray-400">
                            <span className="font-medium text-gray-500">{note.addedBy}</span>
                            {' · '}
                            {fmtDate(note.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
  </div>
</aside>
    </>
  );
}

function ContactItem({ icon: Icon, text }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-500">
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
      <span className="truncate">{text}</span>
    </li>
  );
}
