(function(root){
function parseAFD(text){
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim()); const header=lines[0]||'';
 if(!/^0000000001/.test(header))throw Error('Cabeçalho AFD REP-C não reconhecido.');
 const serial=header.slice(158,175); // locate by date pattern instead of assuming employer name width
 const m=header.match(/(\d{17})(\d{4}-\d{2}-\d{2})(\d{4}-\d{2}-\d{2})/);
 if(!m)throw Error('Número de série ou período não identificado.');
 const employees=[], punches=[], counts={}, warnings=[]; let trailer=false; const seen=new Set();
 for(const line of lines.slice(1)){
 if(line.startsWith('999999999')){trailer=true;break;}
 const a=line.match(/^(\d{9})([2-7])(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4})(.*)$/);
 if(!a){warnings.push('Registro não reconhecido: '+line.slice(0,9));continue;}
 const [,nsr,type,stamp,rest]=a; counts[type]=(counts[type]||0)+1;
 if(seen.has(nsr))throw Error('NSR repetido no arquivo: '+nsr);seen.add(nsr);
 if(type==='3'){const p=rest.match(/^(\d{12})([0-9a-fA-F]{4})$/);if(!p)throw Error('Marcação inválida no NSR '+nsr);punches.push({serial:m[1],nsr:Number(nsr),cpf:p[1].slice(1),stamp,day:stamp.slice(0,10),time:stamp.slice(11,16)});}
 if(type==='5'){const p=rest.match(/^([IAE])(\d{12})(.{52})/);if(!p)throw Error('Cadastro inválido no NSR '+nsr);employees.push({cpf:p[2].slice(1),name:p[3].trim(),active:p[1]!=='E',nsr:Number(nsr),serial:m[1],stamp});}
 }
 if(!trailer)throw Error('Arquivo sem registro de encerramento.');
 return {serial:m[1],start:m[2],end:m[3],employees,punches,counts,warnings};
}
root.parseAFD=parseAFD;if(typeof module!=='undefined')module.exports={parseAFD};
})(typeof window!=='undefined'?window:globalThis);
