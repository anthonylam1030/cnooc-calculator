import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(__dirname,'public');
const port=process.env.PORT||3000;
async function yahoo(symbol){
  const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=10d`;
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw new Error(`Yahoo ${symbol}: ${response.status}`);
  const json=await response.json(),result=json?.chart?.result?.[0];
  if(!result)throw new Error(`Yahoo ${symbol}: no result`);
  const meta=result.meta||{},closes=(result.indicators?.quote?.[0]?.close||[]).filter(Number.isFinite);
  const latestClose=closes.at(-1)??null;
  const priorClose=closes.length>=2?closes.at(-2):null;
  const price=meta.regularMarketPrice??latestClose;
  // Use the latest two actual trading-session closes for previousClose. Yahoo's
  // chartPreviousClose/previousClose metadata can lag after weekends/holidays.
  const previousClose=priorClose??meta.previousClose??meta.chartPreviousClose??null;
  return{symbol,price,previousClose,currency:meta.currency||null,marketTime:meta.regularMarketTime?meta.regularMarketTime*1000:Date.now()};
}
function send(res,status,body,type='text/plain; charset=utf-8',extra={}){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store',...extra});res.end(body)}
function staticFile(req,res){
  const rawPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let reqPath=rawPath;
  if(reqPath==='/') reqPath='/a/index.html';
  else if(reqPath==='/a') return send(res,302,'','text/plain; charset=utf-8',{Location:'/a/'});
  else if(reqPath==='/b') return send(res,302,'','text/plain; charset=utf-8',{Location:'/b/'});
  else if(reqPath.endsWith('/')) reqPath+='index.html';
  const filePath=path.resolve(publicDir,'.'+reqPath);
  if(!filePath.startsWith(path.resolve(publicDir)+path.sep))return send(res,403,'Forbidden');
  fs.readFile(filePath,(err,data)=>{if(err)return send(res,404,'Not found');const ext=path.extname(filePath);const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};send(res,200,data,types[ext]||'application/octet-stream')});
}
const server=http.createServer(async(req,res)=>{
  if(req.url.startsWith('/api/quotes')){
    const symbols={stock:'0857.HK',brent:'BZ=F',fx:'CNYHKD=X'};
    const entries=await Promise.all(Object.entries(symbols).map(async([key,symbol])=>{try{return[key,{ok:true,...await yahoo(symbol)}]}catch(error){return[key,{ok:false,error:error.message}]}}));
    return send(res,200,JSON.stringify({updatedAt:Date.now(),...Object.fromEntries(entries)}),'application/json; charset=utf-8');
  }
  if(req.url.startsWith('/health'))return send(res,200,JSON.stringify({ok:true}),'application/json; charset=utf-8');
  staticFile(req,res);
});
server.listen(port,()=>console.log(`PetroChina Investment OS listening on ${port}`));
