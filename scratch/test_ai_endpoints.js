const http = require('http');

async function test(name, path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request('http://localhost:5000' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        console.log(`[${name}] Status: ${res.statusCode}`);
        try {
          console.log(`[${name}] Response:`, JSON.parse(resData));
        } catch (e) {
          console.log(`[${name}] Raw:`, resData);
        }
        resolve();
      });
    });
    req.on('error', err => {
      console.error(`[${name}] Error:`, err.message);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Testing live AI Service Endpoints:');
  await test('BIAS ANALYZE', '/api/bias/analyze', { text: 'Seeking a rockstar and dominant engineer to lead competition.' });
  await test('BIAS REWRITE', '/api/bias/rewrite', { text: 'Seeking an aggressive rockstar to outperform rivals.' });
  await test('MATCHING SCORE', '/api/matching/score', {
    jd_text: 'Looking for a Senior Python Developer with Django and PostgreSQL experience.',
    resume_text: 'Experienced Python developer skilled in Django, Flask, PostgreSQL, and REST APIs.',
    jd_skills: ['Python', 'Django', 'PostgreSQL'],
    resume_skills: ['Python', 'Django', 'PostgreSQL', 'Flask']
  });
  await test('ANONYMIZE', '/api/anonymize', {
    resume_text: 'John Smith is an experienced developer. He can be reached at john@example.com.',
    candidate_name: 'John Smith'
  });
}

run();
