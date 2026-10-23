import {mkdir,copyFile,cp} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
export const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function build(source=project,destination=resolve(project,'dist')){
 await mkdir(destination,{recursive:true});
 await copyFile(resolve(source,'index.html'),resolve(destination,'index.html'));
 try{await cp(resolve(source,'assets'),resolve(destination,'assets'),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
 await copyFile(resolve(project,'.nojekyll'),resolve(destination,'.nojekyll'));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const arg=name=>{const index=process.argv.indexOf(name);return index<0?null:process.argv[index+1];};
 const source=resolve(arg('--source')||project),out=resolve(arg('--out')||resolve(project,'dist'));
 await build(source,out);if(process.argv.includes('--local'))await build(source,resolve(out,'teste'));
 console.log('Build concluído: '+out);
}
