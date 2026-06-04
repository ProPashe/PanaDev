(async () => {
  const base = 'http://localhost:3000';
  try {
    const res = await fetch(base + '/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mudzimwapanashe123@gmail.com', password: '@panashe2004' })
    });
    const j = await res.json();
    console.log('LOGIN->', j);
    if (!j.token) return console.error('No token');
    const token = j.token;
    // create a sponsorship to test
    const create = await fetch(base + '/api/sponsorships', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name:'TestDelete', email:'test@x.com', amount:10 }) });
    const c = await create.json();
    console.log('CREATED', c);
    const id = c.id || c.id || (c.id ? c.id : (c.sponsorship && c.sponsorship.id));
    // set status to Refused
    const put = await fetch(base + `/api/sponsorships/${c.id}`, { method: 'PUT', headers: {'Content-Type':'application/json', Authorization:'Bearer '+token}, body: JSON.stringify({ status: 'Refused' }) });
    console.log('PUT->', await put.json());
    // delete
    const del = await fetch(base + `/api/sponsorships/${c.id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    console.log('DELETE->', await del.json());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
