(async () => {
  const base = 'http://localhost:3000';
  try {
    const res = await fetch(base + '/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mudzimwapanashe123@gmail.com', password: '@panashe2004' })
    });

    const j = await res.json();
    console.log('LOGIN->', JSON.stringify(j));
    if (!j.token) {
      console.error('No token returned - aborting');
      process.exit(0);
    }

    const token = j.token;
    const sres = await fetch(base + '/api/sponsorships', { headers: { Authorization: 'Bearer ' + token } });
    const sdata = await sres.json();
    console.log('SPONS->', JSON.stringify(sdata));

    if (Array.isArray(sdata) && sdata.length > 0) {
      const id = sdata[0].id;
      const put = await fetch(base + `/api/sponsorships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ status: 'Accepted' })
      });
      const pj = await put.json();
      console.log('PUT->', JSON.stringify(pj));
    }
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  }
})();
