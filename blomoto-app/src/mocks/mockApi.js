import garages from './garages.json';
import services from './services.json';
import appointments from './appointments.json';
import invoices from './invoices.json';
import reviews from './reviews.json';
import users from './users.json';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export async function fetchGarages({ q = '', city = '' } = {}) {
  await delay(300);
  const query = q.toLowerCase();
  const c = city.toLowerCase();
  return garages.filter(g => {
    const name = (g.name || '').toLowerCase();
    const address = (g.address || '').toLowerCase();
    const cityField = (g.city || '').toLowerCase();
    const matchQ = !query || name.includes(query) || address.includes(query);
    const matchC = !c || cityField.includes(c);
    return matchQ && matchC;
  });
}

export async function fetchGarageById(id) {
  await delay(200);
  return garages.find(g => Number(g.id) === Number(id));
}

export async function fetchServicesByGarage(garageId) {
  await delay(200);
  return services.filter(s => Number(s.garage_id) === Number(garageId));
}

export async function fetchAppointmentsByGarage(garageId) {
  await delay(250);
  return appointments.filter(a => Number(a.garage_id) === Number(garageId));
}

export async function fetchInvoicesByGarage(garageId, { from, to, status } = {}) {
  await delay(350);
  let rows = invoices.filter(inv => Number(inv.garage_id) === Number(garageId));
  if (status) rows = rows.filter(r => r.status === status);
  if (from) rows = rows.filter(r => r.created_at >= from);
  if (to) rows = rows.filter(r => r.created_at <= to);
  return rows.map(r => ({
    ...r,
    items: (r.items || []).map(it => ({ ...it, total_price: it.quantity * it.unit_price }))
  }));
}

export async function fetchReviewsByGarage(garageId) {
  await delay(180);
  return reviews.filter(rv => Number(rv.garage_id) === Number(garageId));
}

export async function mockLogin(role = 'client') {
  await delay(150);
  const found = users.find(u => u.role === role) || users[0];
  const token = `mock-token-${role}`;
  return { user: found, token };
}

export async function mockStatsForGarage(garageId) {
  await delay(220);
  const rdv = await fetchAppointmentsByGarage(garageId);
  const inv = await fetchInvoicesByGarage(garageId);
  const totalRevenue = inv.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  return {
    appointmentsThisWeek: rdv.length,
    totalRevenue,
    avgTicket: inv.length ? Math.round(totalRevenue / inv.length) : 0
  };
}

export async function mockAdminOverview() {
  await delay(400);
  const perGarage = await Promise.all(garages.map(async g => {
    const stats = await mockStatsForGarage(g.id);
    return { ...g, ...stats };
  }));
  return {
    kpis: {
      garages: garages.length,
      avgRating: (garages.reduce((s, g) => s + (g.avg_rating || 0), 0) / (garages.length || 1)).toFixed(1),
      services: services.length
    },
    garages: perGarage
  };
}


