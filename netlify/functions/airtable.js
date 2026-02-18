export async function handler(event) {
  try {
    const AT_TOKEN = process.env.AT_TOKEN;
    const AT_BASE  = process.env.AT_BASE;
    const AT_TABLE = process.env.AT_TABLE;

    if (!AT_TOKEN || !AT_BASE || !AT_TABLE) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing Airtable environment variables" })
      };
    }

    const headers = {
      Authorization: `Bearer ${AT_TOKEN}`,
      "Content-Type": "application/json"
    };

    const { op } = event.queryStringParameters || {};

    const baseUrl = `https://api.airtable.com/v0/${AT_BASE}/${AT_TABLE}`;

    // LIST RECORDS
    if (op === "list") {
      const res = await fetch(baseUrl + "?pageSize=100", { headers });
      const data = await res.json();

      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    }

    // CREATE RECORD
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);

      const res = await fetch(baseUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ fields: body })
      });

      const data = await res.json();

      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    }

    // DELETE RECORD
    if (event.httpMethod === "DELETE") {
      const { id } = event.queryStringParameters;

      const res = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
        headers
      });

      const data = await res.json();

      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request" })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
