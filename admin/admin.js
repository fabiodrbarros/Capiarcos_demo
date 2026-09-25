const $=s=>document.querySelector(s);
let state,csrf='',selected='all',editing=null,busy=false,view='active';
const toast=$('#toast');let toastTimer;
function dismissToast(){clearTimeout(toastTimer);if(toast.matches(':popover-open'))toast.hidePopover();$('#toast-text').textContent='';}
function message(text,error=false){
 dismissToast();if(!text)return;
 (document.querySelector('dialog[open]')||document.body).append(toast);
 toast.classList.toggle('error',error);$('#toast-text').textContent=text;toast.showPopover();
 toastTimer=setTimeout(dismissToast,4000);
}
$('#toast-close').onclick=dismissToast;
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{if(dialog.contains(toast)){const visible=toast.matches(':popover-open');if(visible)toast.hidePopover();document.body.append(toast);if(visible)toast.showPopover();}}));
let validationPending=false;
document.addEventListener('invalid',event=>{
 event.preventDefault();if(validationPending)return;validationPending=true;
 const field=event.target;
 message(field.validity.valueMissing?'Preencha este campo.':field.validity.tooLong?'O texto ultrapassa o limite permitido.':'Verifique o valor deste campo.',true);
 field.focus();setTimeout(()=>{validationPending=false;},0);
},true);
const element=(tag,props={},text)=>{const e=document.createElement(tag);Object.assign(e,props);if(text!==undefined)e.textContent=text;return e;};
async function api(url,method='GET',data){
 const response=await fetch(url,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{'X-CSRF-Token':csrf}:{})},...(data?{body:JSON.stringify(data)}:{})});
 const result=await response.json();
 if(!response.ok){if(response.status===401){document.querySelectorAll('dialog[open]').forEach(d=>d.close());showLogin(true);}throw Error(result.error||'Não foi possível concluir.');}return result;
}
function showLogin(configured){document.body.classList.add('login-view');$('#login').hidden=false;$('#workspace').hidden=true;$('#logout').hidden=true;$('#login-form').hidden=!configured;$('#setup-note').hidden=configured;}
function open(dialog){dialog.showModal();dialog.querySelector('input,select,button')?.focus();}
function options(select,current){select.replaceChildren(...state.categories.slice().sort((a,b)=>a.order-b.order).map(c=>element('option',{value:c.id},c.name)));if(current)select.value=current;}
function apply(data){state=data;render();}
function render(){
 document.body.classList.remove('login-view');
 $('#workspace').hidden=false;$('#login').hidden=true;$('#logout').hidden=false;
 const active=state.items.filter(i=>!i.deleted);
 $('#summary').textContent=`${active.length} ${active.length===1?'item':'itens'}`;
 const nav=$('#categories');nav.replaceChildren();
 if(selected!=='all'&&!state.categories.some(c=>c.id===selected))selected='all';
 for(const c of [{id:'all',name:'Todas'},...state.categories.slice().sort((a,b)=>a.order-b.order)]){const b=element('button',{type:'button'},c.name);b.setAttribute('aria-pressed',String(selected===c.id));b.onclick=()=>{selected=c.id;view='active';render();};nav.append(b);}
 $('#show-retired').hidden=!state.items.some(i=>i.deleted);
 $('#show-retired').textContent=view==='trash'?'Voltar aos itens':'Itens retirados';
 const list=state.items.filter(i=>(selected==='all'||i.category===selected)&&(view==='trash'?i.deleted:!i.deleted&&(view==='active'||(view==='published'?i.published:!i.published)))).reverse();
 $('#empty').hidden=list.length>0;$('#items').replaceChildren();
 for(const i of list){const card=element('article',{className:'card'}),image=element('img',{src:i.url,alt:i.alt,loading:'lazy'}),content=element('div',{className:'card-body'});content.append(element('span',{className:'badge'+(i.published&&!i.deleted?' published':'')},i.deleted?'Retirada':i.published?'Publicada':'Rascunho'),element('h3',{},i.title),element('p',{className:'meta'},state.categories.find(c=>c.id===i.category)?.name||'Sem categoria'));const button=element('button',{type:'button'},i.deleted?'Recuperar item':'Editar item');button.onclick=()=>edit(i);content.append(button);const frame=element('div',{className:'catalogue-frame'}),mat=element('div',{className:'catalogue-mat'});mat.append(image);frame.append(mat);card.append(frame,content);$('#items').append(card);}
 $('#add-image').disabled=!state.categories.length;
 const category=state.categories.find(c=>c.id===selected);
 $('#add-image').textContent=category?'Adicionar a '+category.name:'Adicionar item ao catálogo';
}
async function run(form,action){
 if(busy)return;busy=true;
 const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);message('A guardar…');
 try{await action();}catch(e){message(e.message,true);}finally{busy=false;buttons.forEach(b=>b.disabled=false);}
}
$('#login-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;run(f,async()=>{const result=await api('/api/login','POST',{user:f.elements.user.value,password:f.elements.password.value});csrf=result.csrf;f.reset();apply(await api('/api/admin/catalogue'));message('');});};
$('#logout').onclick=async()=>{try{await api('/api/logout','POST',{});csrf='';state=null;showLogin(true);message('Sessão terminada.');}catch(e){message(e.message,true);}};
$('#show-retired').onclick=()=>{view=view==='trash'?'active':'trash';render();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{if(!busy)b.closest('dialog').close();});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('cancel',e=>{if(busy)e.preventDefault();}));
$('#add-image').onclick=()=>{const f=$('#upload-form');f.reset();$('#create-item').textContent='Criar e publicar';options(f.elements.category,selected==='all'?null:selected);$('#upload-title').textContent=$('#add-image').textContent;open($('#upload-dialog'));};
$('#upload-form').elements.published.onchange=event=>{$('#create-item').textContent=event.target.checked?'Criar e publicar':'Guardar rascunho';};
$('#upload-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;run(f,async()=>{const file=f.elements.file.files[0];if(!file||file.size>10*1024*1024)throw Error('Escolha uma imagem até 10 MB.');const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Não foi possível ler o ficheiro.'));reader.readAsDataURL(file);});apply(await api('/api/admin/upload','POST',{revision:state.revision,title:f.elements.title.value,alt:f.elements.alt.value,category:f.elements.category.value,published:f.elements.published.checked,image}));view='active';selected='all';render();$('#upload-dialog').close();message(f.elements.published.checked?'Item criado e publicado.':'Rascunho guardado.');});};
function edit(item){editing=item.id;const f=$('#edit-form');f.elements.title.value=item.title;f.elements.alt.value=item.alt;f.elements.replacement.value='';options(f.elements.category,item.category);f.elements.published.checked=item.published&&!item.deleted;if($('#edit-preview').src.startsWith('blob:'))URL.revokeObjectURL($('#edit-preview').src);$('#edit-preview').src=item.url;$('#edit-preview').alt=item.alt;$('#remove-item').hidden=item.deleted;$('#edit-title').textContent=item.deleted?'Recuperar item':'Editar item';open($('#edit-dialog'));}
$('#edit-form').elements.replacement.onchange=event=>{const file=event.target.files[0];if(!file)return;if(file.size>10*1024*1024){message('Escolha uma imagem até 10 MB.',true);event.target.value='';return;}const preview=$('#edit-preview');if(preview.src.startsWith('blob:'))URL.revokeObjectURL(preview.src);preview.src=URL.createObjectURL(file);};
function editData(deleted=false){const f=$('#edit-form');return {revision:state.revision,title:f.elements.title.value,alt:f.elements.alt.value,category:f.elements.category.value,published:deleted?false:f.elements.published.checked,deleted};}
$('#edit-form').onsubmit=e=>{e.preventDefault();run(e.currentTarget,async()=>{const changes=editData();const file=$('#edit-form').elements.replacement.files[0];if(file){if(file.size>10*1024*1024)throw Error('Escolha uma imagem até 10 MB.');changes.image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Não foi possível ler a imagem.'));reader.readAsDataURL(file);});}apply(await api('/api/admin/items/'+editing,'PATCH',changes));$('#edit-dialog').close();message('Alterações guardadas.');});};
$('#remove-item').onclick=()=>{if(!confirm('Retirar este item do catálogo? Pode recuperá-lo em «Itens retirados».'))return;run($('#edit-form'),async()=>{apply(await api('/api/admin/items/'+editing,'PATCH',editData(true)));$('#edit-dialog').close();message('Item retirado. Disponível em «Itens retirados».');});};
function categories(){
 $('#category-list').replaceChildren();
 for(const c of state.categories.slice().sort((a,b)=>a.order-b.order)){
  const f=element('form',{className:'category-row'}),fields=element('div',{className:'fields'}),name=element('input',{value:c.name,required:true,maxLength:60});
  for(const [label,input] of [['Nome',name]]){const l=element('label',{},label);l.append(input);fields.append(l);}
  const actions=element('div',{className:'actions'}),remove=element('button',{type:'button'},'Eliminar'),save=element('button',{className:'primary'},'Guardar');for(const [button,label,shape] of [[save,'Guardar categoria','M5 3h12l4 4v14H3V3h2 M7 3v6h10V3 M7 21v-8h10v8'],[remove,'Eliminar categoria','M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7']]){button.textContent='';button.classList.add('icon-button');button.setAttribute('aria-label',label+' '+c.name);button.title=label;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',shape);svg.append(path);button.append(svg);}actions.append(save,remove);f.append(fields,actions);$('#category-list').append(f);
  f.onsubmit=e=>{e.preventDefault();run(f,async()=>{apply(await api('/api/admin/categories/'+c.id,'PATCH',{revision:state.revision,name:name.value}));categories();message('Categoria guardada.');});};
  remove.onclick=()=>{if(!confirm(`Eliminar a categoria «${c.name}»?`))return;run(f,async()=>{apply(await api('/api/admin/categories/'+c.id,'DELETE',{revision:state.revision}));categories();message('Categoria eliminada.');});};
 }
}
$('#manage-categories').onclick=()=>{categories();open($('#category-dialog'));};
$('#category-add').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;run(f,async()=>{apply(await api('/api/admin/categories','POST',{revision:state.revision,name:f.elements.name.value}));f.reset();categories();message('Categoria criada.');});};
(async()=>{try{const result=await api('/api/session');if(result.authenticated){csrf=result.csrf;apply(await api('/api/admin/catalogue'));}else showLogin(result.configured);message('');}catch(e){showLogin(true);message('Não foi possível ligar ao servidor. '+e.message,true);}})();
