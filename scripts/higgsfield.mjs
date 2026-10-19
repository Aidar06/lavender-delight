import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const jobDir = path.join(root, 'production/jobs');
await fs.mkdir(jobDir, {recursive:true});
const envPath = process.env.HF_ENV_PATH;
if (!envPath) throw new Error('Set HF_ENV_PATH to the local credential file.');
const env = await fs.readFile(envPath, 'utf8');
const key = env.match(/^\s*HIGGSFIELD_API_KEY\s*=\s*(.+?)\s*$/m)?.[1].replace(/^['"]|['"]$/g, '');
if (!key) throw new Error('HIGGSFIELD_API_KEY is missing.');
const base = 'https://api.higgsfield.ai';
async function api(url, body) {
  if (!url.startsWith(base+'/')) throw new Error('Unexpected API origin');
  const r = await fetch(url, {method:body?'POST':'GET',headers:{Authorization:`Key ${key}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(90000)});
  if(!r.ok) throw new Error(`Higgsfield HTTP ${r.status}: ${(await r.text()).replaceAll(key,'[redacted]').slice(0,600)}`);
  return r.json();
}
async function upload(file) {
  const contentType = file.endsWith('.png')?'image/png':'image/jpeg';
  const u = await api(base+'/files/generate-upload-url',{content_type:contentType});
  const r = await fetch(u.upload_url,{method:'PUT',headers:u.upload_headers,body:await fs.readFile(file),signal:AbortSignal.timeout(90000)});
  if(!r.ok) throw new Error(`Asset upload HTTP ${r.status}`);
  return u.public_url;
}
const [action,name,first,last,promptFile,durationInput='10'] = process.argv.slice(2);
const duration=Number(durationInput);
if(![5,10].includes(duration)) throw new Error('Duration must be 5 or 10 seconds');
if (!/^[a-z0-9-]+$/.test(name||'')) throw new Error('A safe job name is required');
const record = path.join(jobDir, name+'.json');
if(action==='submit') {
  try { await fs.access(record); throw new Error('Job already recorded. Poll it; never resubmit blindly.'); } catch(e) {if(e.code!=='ENOENT')throw e;}
  const existing = await fs.readdir(jobDir);
  let reserved = 0;
  for(const file of existing.filter(f=>f.endsWith('.json'))) reserved += JSON.parse(await fs.readFile(path.join(jobDir,file),'utf8')).reservedUsd||0;
  const reserve=Number((duration*0.168).toFixed(2)); // Published maximum list rate $0.168/s.
  if(reserved+reserve>10) throw new Error('User budget $10 would be exceeded');
  const job={name,reservedUsd:reserve,model:'kling-video/v3.0/pro/image-to-video',duration,status:'uploading',createdAt:new Date().toISOString()};
  await fs.writeFile(record,JSON.stringify(job,null,2));
  const image_url=await upload(path.resolve(first));
  const last_image_url=await upload(path.resolve(last));
  job.status='submitting';
  await fs.writeFile(record,JSON.stringify(job,null,2));
  const prompt=await fs.readFile(path.resolve(promptFile),'utf8');
  const out=await api(base+'/'+job.model,{image_url,last_image_url,prompt,sound:'off',duration,cfg_scale:0.6,multi_shots:false});
  Object.assign(job,{request_id:out.request_id,status:out.status||'queued',status_url:out.status_url});
  await fs.writeFile(record,JSON.stringify(job,null,2));
  console.log(JSON.stringify({name,request_id:job.request_id,status:job.status,totalReservedUsd:reserved+reserve}));
} else if(action==='poll') {
  const job=JSON.parse(await fs.readFile(record,'utf8'));
  if(!job.request_id)throw new Error('Submission outcome requires inspection; no request ID recorded.');
  const out=await api(job.status_url||`${base}/requests/${job.request_id}/status`);
  job.status=out.status;
  if(out.video?.url) {
    const r=await fetch(out.video.url,{signal:AbortSignal.timeout(120000)});
    if(!r.ok)throw new Error('Video download failed');
    await fs.writeFile(path.join(root,'production',name+'.mp4'),Buffer.from(await r.arrayBuffer()));
    job.downloaded=true;
  }
  await fs.writeFile(record,JSON.stringify(job,null,2));
  console.log(JSON.stringify({name,status:job.status,downloaded:job.downloaded||false,details:out.status==='failed'?out.error:undefined}));
} else throw new Error('Use submit or poll');
