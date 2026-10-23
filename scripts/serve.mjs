import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
export function serve(root,port=4173){
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
 const server=createServer(async(req,res)=>{try{
 let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!path.startsWith(resolve(root)+sep)&&path!==resolve(root)){res.writeHead(403).end();return;}
 if((await stat(path)).isDirectory())path=resolve(path,'index.html');
 res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(path));
 }catch(e){res.writeHead(404).end('Não encontrado');}});
 return new Promise(done=>server.listen(port,'127.0.0.1',()=>done(server)));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=fileURLToPath(new URL('../dist/',import.meta.url));const server=await serve(root,Number(process.env.PORT||4173));
 console.log('Produção local: http://127.0.0.1:'+server.address().port+'/');console.log('Teste local: http://127.0.0.1:'+server.address().port+'/teste/');
}
