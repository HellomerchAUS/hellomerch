const AT_TOKEN = process.env.AT_TOKEN;
const AT_BASE  = process.env.AT_BASE;
const AT_TABLE = 'tblDEKwuMwxdSRt1q';
const BASE_URL = `https://api.airtable.com/v0/${AT_BASE}/${AT_TABLE}`;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const atHeaders = {
    'Authorization': `Bearer ${AT_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    if (event.httpMethod === 'GET') {
      let records = [], offset = null;
      do {
        const url = BASE_URL + '?pageSize=100' + (offset ? `&offset=${offset}` : '');
        const res  = await fetch(url, { headers: atHeaders });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        records = records.concat(data.records || []);
        offset  = data.offset || null;
      } while (offset);
      return { statusCode: 200, headers, body: JSON.stringify(records) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const res  = await fetch(BASE_URL, {
        method: 'POST',
        headers: atHeaders,
        body: JSON.stringify({ fields: body }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'DELETE') {
      const id  = event.queryStringParameters?.id;
      const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE', headers: atHeaders });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
