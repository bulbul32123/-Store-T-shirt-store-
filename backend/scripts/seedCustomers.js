/**
 * backend/scripts/seedCustomers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Run:  node backend/scripts/seedCustomers.js
 *
 * Inserts 50 mock customer accounts with realistic data.
 * Sets segment correctly based on seeded order counts / spend.
 *
 * ⚠️  Only deletes documents with role='user' — admins are untouched.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');
const path     = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

// ── Data pools ────────────────────────────────────────────────────────────────
const FIRST = [
  'Alice','Bob','Carol','David','Emma','Frank','Grace','Henry',
  'Iris','Jack','Kate','Liam','Mia','Noah','Olivia','Paul',
  'Quinn','Rachel','Sam','Tina','Uma','Victor','Wendy','Xena',
  'Yusuf','Zara','Aaron','Beth','Carlos','Diana'
];
const LAST = [
  'Ahmed','Baker','Chen','Davis','Evans','Foster','Garcia','Harris',
  'Ibrahim','Jones','Khan','Lee','Miller','Nelson','Owen','Patel',
  'Quinn','Rivera','Smith','Taylor','Uddin','Vance','Williams',
  'Xavier','Yang','Zhao','Anderson','Brown','Clark','Dixon'
];
const CITIES = [
  { city: 'Dhaka',     country: 'BD' },
  { city: 'New York',  country: 'US' },
  { city: 'London',    country: 'UK' },
  { city: 'Toronto',   country: 'CA' },
  { city: 'Sydney',    country: 'AU' },
  { city: 'Dubai',     country: 'AE' },
  { city: 'Singapore', country: 'SG' },
  { city: 'Paris',     country: 'FR' },
  { city: 'Berlin',    country: 'DE' },
  { city: 'Tokyo',     country: 'JP' }
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const pick    = arr => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = n => {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, n));
  return d;
};
const phone = () => `+1${randInt(2000000000, 9999999999)}`;

/**
 * Assign realistic segment based on intended order behaviour:
 *   0 orders / last order > 90 days → inactive
 *   ≥ 2 orders, spend ≥ $500       → high_spender
 *   ≥ 2 orders                      → repeat_buyer
 *   else                            → regular
 */
function deriveSegment(orderCount, totalSpend, lastOrderDaysAgo) {
  if (orderCount === 0 || lastOrderDaysAgo > 90) return 'inactive';
  if (orderCount >= 2 && totalSpend >= 500)       return 'high_spender';
  if (orderCount >= 2)                            return 'repeat_buyer';
  return 'regular';
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Remove only customer (role=user) documents
    const deleted = await User.deleteMany({ role: 'user' });
    console.log(`🗑  Removed ${deleted.deletedCount} existing customer records`);

    // Pre-hash a shared password (avoids triggering pre-save 50x)
    const hashedPw = await bcrypt.hash('Customer@123', 12);

    const customers = [];

    for (let i = 0; i < 50; i++) {
      const first      = pick(FIRST);
      const last       = pick(LAST);
      const location   = pick(CITIES);
      const joinedDays = randInt(1, 365);
      const joinedDate = daysAgo(joinedDays);

      // Simulate realistic order behaviour per customer
      const orderCount   = randInt(0, 8);
      const avgOrderVal  = randInt(30, 200);
      const totalSpend   = orderCount * avgOrderVal;
      const lastOrdDays  = orderCount > 0 ? randInt(1, Math.min(joinedDays, 120)) : 999;
      const segment      = deriveSegment(orderCount, totalSpend, lastOrdDays);
      const status       = segment === 'inactive' && Math.random() < 0.2
        ? 'inactive'
        : Math.random() < 0.04 ? 'suspended' : 'active';

      customers.push({
        name:          `${first} ${last}`,
        email:         `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
        password:      hashedPw,
        role:          'user',
        isVerified:    true,
        phone:         phone(),
        status,
        segment,
        location,
        createdAt:     joinedDate,
        lastOrderDate: orderCount > 0 ? daysAgo(lastOrdDays) : undefined,
        notes:         []
      });
    }

    await User.insertMany(customers, { ordered: false });
    console.log(`✅ Seeded ${customers.length} customers`);
    console.log('   Login any with password: Customer@123');

    // Summary
    const counts = customers.reduce((acc, c) => {
      acc[c.segment] = (acc[c.segment] || 0) + 1;
      return acc;
    }, {});
    console.log('\n   Segment breakdown:', counts);

    await mongoose.disconnect();
    console.log('\n✅ Done — MongoDB disconnected');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();