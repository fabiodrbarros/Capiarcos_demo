const $=s=>document.querySelector(s);
let state,csrf='',selected='all',editing=null,busy=false,view='active';
const message=(text,error=false)=>{$('#message').textContent=text;$('#message').classList.toggle('error',error);};
const element=(tag,props={},text)=>{const e=document.createElement(tag);Object.assign(e,props);if(text!==undefined)e.textContent=text;return e;};
async function api(url,method='GET',data){
 const response=await fetch(url,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{'X-CSRF-Token':csrf}:{})},...(data?{body:JSON.stringify(data)}:{})});
 const result=await response.json();
 if(!response.ok){if(response.status===401){document.querySelectorAll('dialog[open]').forEach(d=>d.close());showLogin(true);}throw Error(result.error||'Não foi possível concluir.');}return result;
}
function showLogin(configured){document.body.classList.add('login-view');$('#login').hidden=false;$('#workspace').hidden=true;$('#logout').hidden=true;$('#login-form').hidden=!configured;$('#setup-note').hidden=configured;}
function open(dialog){dialog.querySelector('.dialog-status')&&(dialog.querySelector('.dialog-status').textContent='');dialog.showModal();dialog.querySelector('input,select,button')?.focus();}
function options(select,current){select.replaceChildren(...state.categories.slice().sort((a,b)=>a.order-b.order).map(c=>element('option',{value:c.id},c.name)));if(current)select.value=current;}
function apply(data){state=data;render();}
function render(){
 document.body.classList.remove('login-view');
 $('#workspace').hidden=false;$('#login').hidden=true;$('#logout').hidden=false;
 const active=state.items.filter(i=>!i.deleted);
 $('#summary').textContent=`${active.length} ${active.length===1?'fotografia':'fotografias'}`;
 const nav=$('#categories');nav.replaceChildren();
 if(selected!=='all'&&!state.categories.some(c=>c.id===selected))selected='all';
 for(const c of [{id:'all',name:'Todas'},...state.categories.slice().sort((a,b)=>a.order-b.order)]){const b=element('button',{type:'button'},c.name);b.setAttribute('aria-pressed',String(selected===c.id));b.onclick=()=>{selected=c.id;view='active';render();};nav.append(b);}
 $('#show-retired').hidden=!state.items.some(i=>i.deleted);
 $('#show-retired').textContent=view==='trash'?'Voltar às fotografias':'Retiradas';
 const list=state.items.filter(i=>(selected==='all'||i.category===selected)&&(view==='trash'?i.deleted:!i.deleted&&(view==='active'||(view==='published'?i.published:!i.published)))).sort((a,b)=>a.order-b.order);
 $('#empty').hidden=list.length>0;$('#items').replaceChildren();
 for(const i of list){const card=element('article',{className:'card'}),image=element('img',{src:i.url,alt:i.alt,loading:'lazy'}),content=element('div',{className:'card-body'});content.append(element('span',{className:'badge'+(i.published&&!i.deleted?' published':'')},i.deleted?'Retirada':i.published?'Publicada':'Rascunho'),element('h3',{},i.title),element('p',{className:'meta'},state.categories.find(c=>c.id===i.category)?.name||'Sem categoria'));const button=element('button',{type:'button'},i.deleted?'Recuperar':'Editar');button.onclick=()=>edit(i);content.append(button);const frame=element('div',{className:'catalogue-frame'}),mat=element('div',{className:'catalogue-mat'});mat.append(image);frame.append(mat);card.append(frame,content);$('#items').append(card);}
 $('#add-image').disabled=!state.categories.length;
}
async function run(form,action){
 if(busy)return;busy=true;const status=form.closest('dialog')?.querySelector('.dialog-status');
 const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);if(status){status.textContent='A guardar…';status.classList.remove('error');}
 try{await action();}catch(e){if(status){status.textContent=e.message;status.classList.add('error');}message(e.message,true);}finally{busy=false;buttons.forEach(b=>b.disabled=false);}
}
$('#login-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;run(f,async()=>{const result=await api('/api/login','POST',{user:f.elements.user.value,password:f.elements.password.value});csrf=result.csrf;f.reset();apply(await api('/api/admin/catalogue'));message('');});};
$('#logout').onclick=async()=>{try{await api('/api/logout','POST',{});csrf='';state=null;showLogin(true);message('Sessão terminada.');}catch(e){message(e.message,true);}};
$('#show-retired').onclick=()=>{view=view==='trash'?'active':'trash';render();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{if(!busy)b.closest('dialog').close();});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('cancel',e=>{if(busy)e.preventDefault();}));
$('#add-image').onclick=()=>{const f=$('#upload-form');f.reset();options(f.elements.category,selected==='all'?null:selected);open($('#upload-dialog'));};
$('#upload-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;run(f,async()=>{const file=f.elements.file.files[0];if(!file||file.size>10*1024*1024)throw Error('Escolha uma imagem até 10 MB.');const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Não foi possível ler o ficheiro.'));reader.readAsDataURL(file);});apply(await api('/api/admin/upload','POST',{revision:state.revision,title:f.elements.title.value,alt:f.elements.alt.value,category:f.elements.category.value,image}));view='active';selected='all';render();$('#upload-dialog').close();message('Rascunho guardado.');});};
function edit(item){editing=item.id;const f=$('#edit-form');f.elements.title.value=item.title;f.elements.alt.value=item.alt;f.elements.order.value=item.order;options(f.elements.category,item.category);f.elements.published.checked=item.published&&!item.deleted;$('#edit-preview').src=item.url;$('#edit-preview').alt=item.alt;$('#remove-item').hidden=item.deleted;$('#edit-title').textContent=item.deleted?'Recuperar fotografia':'Editar fotografia';open($('#edit-dialog'));}
function editData(deleted=false){const f=$('#edit-form');return {revision:state.revision,title:f.elements.title.value,alt:f.elements.alt.value,category:f.elements.category.value,order:Number(f.elements.order.value),published:deleted?false:f.elements.published.checked,deleted};}
$('#edit-form').onsubmit=e=>{e.preventDefault();run(e.currentTarget,async()=>{apply(await api('/api/admin/items/'+editing,'PATCH',editData()));$('#edit-dialog').close();message('Alterações guardadas.');});};
$('#remove-item').onclick=()=>{if(!confirm('Retirar esta fotografia do catálogo? Pode recuperá-la em «Retiradas».'))return;run($('#edit-form'),async()=>{apply(await api('/api/admin/items/'+editing,'PATCH',editData(true)));$('#edit-dialog').close();message('Fotografia retirada. Pode recuperá-la mais tarde.');});};
function categories(){
 $('#category-list').replaceChildren();
 for(const c of state.categories.slice().sort((a,b)=>a.order-b.order)){
  const f=element('form',{className:'category-row'}),fields=element('div',{className:'fields'}),name=element('input',{value:c.name,required:true,maxLength:60}),number=element('input',{type:'number',value:c.order,min:'0',max:'100000',required:true});
  for(const [label,input] of [['Nome',name],['Ordem',number]]){const l=element('label',{},label);l.append(input);fields.append(l);}
  const actions=element('div',{className:'actions'}),remove=element('button',{type:'button'},'Eliminar'),save=element('button',{className:'primary'},'Guardar');actions.append(remove,save);f.append(fields,actions);$('#category-list').append(f);
  f.onsubmit=e=>{e.preventDefault();run(f,async()=>{apply(await api('/api/admin/categories/'+c.id,'PATCH',{revision:state.revision,name:name.value,order:Number(number.value)}));categories();message('Categoria guardada.');$('#category-dialog .dialog-status').textContent='Categoria guardada.';});};
  remove.onclick=()=>{if(!confirm(`Eliminar a categoria «${c.name}»?`))return;run(f,async()=>{apply(await api('/api/admin/categories/'+c.id,'DELETE',{revision:state.revision}));categories();$('#category-dialog .dialog-status').textContent='Categoria eliminada.';});};
 }
}
$('#manage-categories').onclick=()=>{categories();open($('#category-dialog'));};
$('#category-add').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;run(f,async()=>{apply(await api('/api/admin/categories','POST',{revision:state.revision,name:f.elements.name.value}));f.reset();categories();$('#category-dialog .dialog-status').textContent='Categoria criada.';});};
(async()=>{try{const result=await api('/api/session');if(result.authenticated){csrf=result.csrf;apply(await api('/api/admin/catalogue'));}else showLogin(result.configured);message('');}catch(e){showLogin(true);message('Não foi possível ligar ao servidor. '+e.message,true);}})();
