const KEY='avateixons-ficha-v1';
const sections=[
 {id:'identidade',name:'Identidade',description:'Quem é seu personagem',cards:[
  {title:'Personagem',fields:['Nome do personagem','Nome do jogador','Idade','Nação','Origem','Pontos de experiência (XP)','Pontos de heroísmo','Ancestralidade e herança','Biografia','Dobra','Tamanho','Traços','Tendência']},
  {title:'Retrato',portrait:true},
  {title:'Elemento e plano de fundo',backgroundPicker:true},
  {title:'Movimento e sentidos',fields:['Velocidade (metros)','Tipos de movimento e anotações','Sentidos']}
 ]},
 {id:'atributos',name:'Atributos',description:'Valores e modificadores',cards:[
  {title:'Atributos',fields:['Força','Destreza','Constituição','Inteligência','Sabedoria','Carisma'],attribute:true},
  {title:'Atributo chave',keyAttribute:true},
  {title:'Perícias',fields:['Acrobatismo','Atletismo','Dissimulação','Diplomacia','Furtividade','Intimidação','Ladroagem','Manufatura','Medicina','Natureza','Performance','Sociedade','Sobrevivência','Espiritualismo','Dobra de água','Dobra de ar','Dobra de fogo','Dobra de terra'],skill:true}
 ]},
 {id:'combate',name:'Combate',description:'Defesas, condições e dobra',cards:[
  {title:'Pontos de vida',vitals:true},
  {title:'Defesa e dobra',defenseGroup:true},
  {title:'Jogadas de salvamento e percepção',fields:['Fortitude','Reflexos','Vontade','Percepção'],composite:true},
  {title:'Velocidade',fields:['Velocidade (metros)']},
  {title:'Armadura e escudo',armorDetails:true},
  {title:'Condição atual',fields:['Ferido','Morrendo','Resistências e imunidades','Condições'],long:true}
 ]},
 {id:'tecnicas',name:'Dobras',description:'Movimentos e técnicas',cards:[
  {title:'Movimentos e técnicas',bendings:true},
  {title:'CD de dobra',bendingDC:true}
 ]},
 {id:'talentos',name:'Talentos',description:'Habilidades por origem e classe',cards:[
  {title:'Habilidades e talentos de ancestralidade',repeat:'ancestralidade',columns:['Nível','Nome','Descrição']},
  {title:'Talentos de perícia',repeat:'talentosPericia',columns:['Nível','Nome','Descrição']},
  {title:'Talentos gerais',repeat:'talentosGerais',columns:['Nível','Nome','Descrição']},
  {title:'Habilidades e talentos de classe',repeat:'classe',columns:['Nível','Nome','Descrição']},
  {title:'Talentos bônus',repeat:'bonus',columns:['Nível','Nome','Descrição']}
 ]},
 {id:'acoes',name:'Ações',description:'O que você pode fazer',cards:[
  {title:'Ações e atividades',repeat:'acoes',columns:['Nome','Ações','Traços','Página','Descrição']},
  {title:'Ações livres e reações',repeat:'reacoes',columns:['Nome','Tipo','Acionamento','Traços','Página','Descrição']}
 ]},
 {id:'anotacoes',name:'Anotações',description:'Espaço livre para o personagem',cards:[
  {title:'Anotações',notes:true}
 ]}
];
let data={fields:{},lists:{}};
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved==='object')data={fields:saved.fields||{},lists:saved.lists||{}}}catch{}
if(!data.fields['cd-de-dobra-rank']&&data.fields['proficiencia-em-dobra-rank'])data.fields['cd-de-dobra-rank']=data.fields['proficiencia-em-dobra-rank'];
let active='identidade';
const expandedBendings=new WeakSet();
const expandedTalents=new WeakSet();
const talentLists=new Set(['ancestralidade','talentosPericia','talentosGerais','classe','bonus']);
const combatCards=new Set(sections.find(section=>section.id==='combate').cards);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const modifier=value=>value===''||value==null?'—':(Math.floor((Number(value)-10)/2)>0?'+':'')+Math.floor((Number(value)-10)/2);
const skillAttributes={'Acrobatismo':'Destreza','Atletismo':'Força','Dissimulação':'Carisma','Diplomacia':'Carisma','Furtividade':'Destreza','Intimidação':'Carisma','Ladroagem':'Destreza','Manufatura':'Inteligência','Medicina':'Sabedoria','Natureza':'Sabedoria','Performance':'Carisma','Sociedade':'Inteligência','Sobrevivência':'Sabedoria','Espiritualismo':'Sabedoria','Dobra de água':'Sabedoria','Dobra de ar':'Sabedoria','Dobra de fogo':'Sabedoria','Dobra de terra':'Sabedoria'};
const defenseAttributes={'Percepção':'Sabedoria','Classe de Armadura':'Destreza','Proficiência em dobra':'chave','Fortitude':'Constituição','Reflexos':'Destreza','Vontade':'Sabedoria'};
const rankBonus={treinado:2,especialista:4,mestre:6,lendario:8};
const backgroundFiles={agua:'água plano.png',ar:'ar plano.png',fogo:'fogo plano.png',terra:'terra  plano.png',osel:'osel plano normal.png',rudeus:'rudeus plano.png',shien:'Shien plano.png',sion:'sion plano.png'};
const bannerLabels={agua:'água',ar:'ar',fogo:'fogo',terra:'terra'};
const bannerCounts={agua:5,ar:5,fogo:7,terra:5};
const bannerFiles={agua:'banner água 1.png',ar:'banner ar 1.png',fogo:'banner fogo 1.png',terra:'banner terra 1.png'};
function visualElement(){return data.fields.planoFundo==='osel'?'avatar':data.fields.elemento||'neutral'}
const sealMarks={
 agua:'<path d="M32 15c-4 6-8 9-8 14a8 8 0 0 0 16 0c0-5-4-8-8-14Z"/><path d="M15 40c5-6 11-6 17 0s12 6 17 0M15 47c5-6 11-6 17 0s12 6 17 0"/>',
 terra:'<path d="M14 44h36M17 44l11-21 7 12 5-9 8 18M22 50h20"/>',
 fogo:'<path d="M32 13c3 10 12 13 12 24 0 8-5 14-12 14S20 45 20 37c0-6 4-10 6-14 1 4 3 6 6 8-1-7 0-12 0-18Z"/><path d="M32 36c-3 3-4 5-4 8a4 4 0 0 0 8 0c0-3-1-5-4-8Z"/>',
 ar:'<path d="M17 35c3-7 10-11 17-9 5 1 7 6 5 10-2 4-8 4-10 1-2-3 1-6 4-5M16 43c8 6 20 6 29-1M20 25c2-4 5-6 9-8"/>',
 avatar:'<circle cx="32" cy="32" r="9"/><circle cx="32" cy="17" r="5" fill="#b47c3a" stroke="none"/><circle cx="47" cy="32" r="5" fill="#b45134" stroke="none"/><circle cx="32" cy="47" r="5" fill="#647b4d" stroke="none"/><circle cx="17" cy="32" r="5" fill="#31759c" stroke="none"/>',
 neutral:'<path d="M32 15 49 32 32 49 15 32Z"/><circle cx="32" cy="32" r="5"/>'
};
function elementSeal(element){return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="32" cy="32" r="29"/><circle cx="32" cy="32" r="25" opacity=".55"/>'+(sealMarks[element]||sealMarks.neutral)+'</svg>'}
function bendingElement(item){return data.fields.planoFundo==='osel'?item.Elemento:data.fields.elemento}
function bannerChoices(element){
 if(!bannerCounts[element])return [];
 const originals=Array.from({length:bannerCounts[element]},(_,n)=>[String(n+1),'Banner '+(n+1)]);
 const added=(data.fields.bannersPersonalizados?.[element]||[]).map(b=>['custom:'+b.id,b.name]);
 return originals.concat(added);
}
function bendingBanner(item){
 const element=bendingElement(item);
 if(!bannerCounts[element])return '';
 const choice=String(item.Banner||'1');
 if(choice.startsWith('custom:')){const image=(data.fields.bannersPersonalizados?.[element]||[]).find(b=>b.id===choice.slice(7))?.image||'';return /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image)?image:''}
 const number=Number(choice);
 return 'Nova%20pasta/'+encodeURIComponent('banner '+bannerLabels[element]+' '+(number>=1&&number<=bannerCounts[element]?number:1)+'.png');
}
function randomBanner(element){const options=bannerChoices(element);return options.length?options[Math.floor(Math.random()*options.length)][0]:''}
function ensureBendingBanners(){
 let changed=false;
 for(const item of data.lists.tecnicas||[]){
  if(data.fields.planoFundo==='osel'&&!bannerCounts[item.Elemento]&&bannerCounts[data.fields.elemento]){item.Elemento=data.fields.elemento;changed=true}
  const element=bendingElement(item);
  if(!bannerCounts[element])continue;
  if(item.BannerElement!==element||!bannerChoices(element).some(([key])=>key===String(item.Banner))){item.Banner=randomBanner(element);item.BannerElement=element;changed=true}
 }
 if(changed)save();
}
function bendingLevel(){return Math.ceil(Number(data.fields.nivel||1)/2)}
function elevationFor(item){const grade=Number.parseInt(item.Grau,10);if(!Number.isFinite(grade)||grade<1)return 'Escolha o grau';const difference=bendingLevel()-grade;return difference>0?'Elevada '+difference:difference===0?'Grau base':'Acima do nível de dobra'}
const diceOptions=['1d4','1d6','1d8','1d10','1d12'].map(die=>[die,die]);
function elevationCount(item){return Math.max(0,bendingLevel()-(Number.parseInt(item.Grau,10)||1))}
function damageFor(item){
 const counts=new Map(diceOptions.map(([die])=>[die,0]));
 for(const die of Array.isArray(item.Dados)?item.Dados:[])if(counts.has(die))counts.set(die,counts.get(die)+1);
 const elevatedDie=item.ElevadoDado||'1d4';
 if(item.Elevado==='sim'&&(item.ElevadoTipo||'dado')==='dado'&&counts.has(elevatedDie))counts.set(elevatedDie,counts.get(elevatedDie)+elevationCount(item));
 return [...counts].filter(([,count])=>count>0).map(([die,count])=>count+die.slice(1)).join(' + ')||'—';
}
function currentArtwork(){
 const selected=data.fields.planoFundo||'';
 if(selected==='none')return '';
 if(selected==='custom')return /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data.fields.imagemPersonalizada||'')?data.fields.imagemPersonalizada:'';
 const file=selected==='osel'&&data.fields.estadoAvatar?'osel plano.png':backgroundFiles[selected];
 return file?'Nova%20pasta/'+encodeURIComponent(file):'';
}
function applyBackground(){
 const element=data.fields.planoFundo==='osel'?'':data.fields.elemento||'';
 document.body.dataset.element=element;
 document.body.dataset.avatar=String(data.fields.planoFundo==='osel');
 document.querySelector('#headerSeal').innerHTML=elementSeal(visualElement());
 const artwork=currentArtwork();
 const url=artwork?'url("'+artwork+'")':'none';
 document.documentElement.style.setProperty('--scene-url',url);
 document.body.classList.toggle('has-scene',!!artwork);
 document.body.classList.toggle('avatar-active',data.fields.planoFundo==='osel'&&!!data.fields.estadoAvatar);
 const banner=document.querySelector('#elementBanner');
 const bannerFile=bannerFiles[element];
 banner.hidden=!bannerFile;
 if(bannerFile){banner.style.backgroundImage='linear-gradient(#170f0d08,#170f0d22),url("Nova%20pasta/'+encodeURIComponent(bannerFile)+'")';banner.setAttribute('aria-label','Banner da dobra de '+({agua:'água',ar:'ar',fogo:'fogo',terra:'terra'}[element]))}
}
const rankKeyFor=name=>name==='Classe de Armadura'?'classe-de-armadura-'+slug(data.fields.caCategoria||'Sem armadura')+'-rank':name==='Proficiência em dobra'?'cd-de-dobra-rank':slug(name)+'-rank';
function totalFor(name,attribute){
 const rank=data.fields[rankKeyFor(name)];
 if(!rank)return '—';
 const chosen=attribute==='chave'?data.fields.atributoChave:attribute;
 const score=data.fields[slug(chosen||'')+'-valor'];
 if(score===''||score==null)return '—';
 const level=Number(data.fields.nivel||1);
 const base=name==='Classe de Armadura'?10:0;
 let attributeMod=Math.floor((Number(score)-10)/2);
 if(name==='Classe de Armadura'){
  const cap=data.fields.caDexCap;
  if(cap!==''&&cap!=null)attributeMod=Math.min(attributeMod,Number(cap));
 }
 let total=base+level+rankBonus[rank]+attributeMod;
 if(name==='Classe de Armadura'){
  total+=Number(data.fields.caItem||0)+Number(data.fields.caOutros||0)-Number(data.fields.caPenalidade||0);
  if(data.fields.escudoErguido)total+=Number(data.fields.caEscudo||0);
 }
 return (base?'' : total>0?'+':'')+total;
}
function bendingBase(){
 const rank=data.fields[rankKeyFor('CD de dobra')];
 const attribute=data.fields.atributoChave;
 const score=data.fields[slug(attribute||'')+'-valor'];
 if(!rank||!attribute||score===''||score==null)return null;
 return Number(data.fields.nivel||1)+rankBonus[rank]+Math.floor((Number(score)-10)/2);
}
function signed(value){return value>0?'+'+value:String(value)}
function bendingDC(){const base=bendingBase();return base==null?'—':String(10+base)}
function turnBending(penalty){const total=totalFor('Proficiência em dobra','chave');return total==='—'?'—':signed(Number(total)-penalty)}
function proficiencyRow(name,attribute){
 const key=slug(name),rank=data.fields[rankKeyFor(name)]||'';
 return '<div class="prof-row"><div class="prof-heading"><strong>'+esc(name)+'</strong><span>'+esc(attribute==='chave'?(data.fields.atributoChave||'Atributo chave'):attribute)+'</span><output data-total="'+key+'">'+totalFor(name,attribute)+'</output></div><div class="rank-buttons" role="group" aria-label="Proficiência em '+esc(name)+'">'+Object.keys(rankBonus).map(r=>'<button type="button" data-rank="'+key+'" data-rank-value="'+r+'" aria-pressed="'+(rank===r)+'">'+r+'</button>').join('')+'</div></div>';
}
function bendingDCRow(){
 const name='CD de dobra',key=slug(name),rank=data.fields[rankKeyFor(name)]||'';
 return '<div class="prof-row dc-in-group"><div class="prof-heading"><strong>CD de dobra</strong><output data-bending-dc>'+bendingDC()+'</output></div><div class="rank-buttons" role="group" aria-label="Proficiência em CD de dobra">'+Object.keys(rankBonus).map(r=>'<button type="button" data-rank="'+key+'" data-rank-value="'+r+'" aria-pressed="'+(rank===r)+'">'+r+'</button>').join('')+'</div></div>';
}
function refreshTotals(){document.querySelectorAll('[data-total]').forEach(el=>{const name=[...Object.keys(skillAttributes),...Object.keys(defenseAttributes)].find(n=>slug(n)===el.dataset.total);if(name)el.textContent=totalFor(name,skillAttributes[name]||defenseAttributes[name])});document.querySelectorAll('[data-bending-dc],[data-bending-entry-dc]').forEach(el=>el.textContent=bendingDC());document.querySelectorAll('[data-turn-bending],[data-bending-attack]').forEach(el=>el.textContent=turnBending(Number(el.dataset.turnBending??el.dataset.bendingAttack)));document.querySelectorAll('[data-bending-level]').forEach(el=>el.textContent=bendingLevel());document.querySelectorAll('[data-elevation-index]').forEach(el=>el.textContent=elevationFor(data.lists.tecnicas?.[Number(el.dataset.elevationIndex)]||{}));document.querySelectorAll('[data-damage-index],[data-bending-summary-damage]').forEach(el=>{const index=Number(el.dataset.damageIndex??el.dataset.bendingSummaryDamage);const damage=damageFor(data.lists.tecnicas?.[index]||{});const isSummary=el.hasAttribute('data-bending-summary-damage');el.textContent=isSummary&&damage==='—'?'':damage;if(isSummary)el.hidden=damage==='—'})}
function field(label,key,type='text',wide=false,value=''){
 const val=esc(value??'');
 const control=type==='textarea'?'<textarea data-field="'+esc(key)+'">'+val+'</textarea>':'<input data-field="'+esc(key)+'" type="'+type+'" '+(type==='number'?'inputmode="numeric" ':'')+'value="'+val+'">';
 return '<label class="field '+(wide?'wide':'')+'"><span>'+esc(label)+'</span>'+control+'</label>';
}
function bendingSelect(label,index,column,options,value){
 return '<label class="field '+(column==='Banner'?'banner-choice':'')+'"><span>'+label+'</span><select data-field="list:tecnicas:'+index+':'+column+'">'+options.map(([key,text])=>'<option value="'+esc(key)+'" '+(String(value)===String(key)?'selected':'')+'>'+esc(text)+'</option>').join('')+'</select></label>';
}
function renderBending(item,index,forPrint=false){
 const element=bendingElement(item)||'';
 const type=item.Tipo||'Movimento';
 const test=item.Teste||'Acerto';
 const banner=bendingBanner(item);
 const gradeOptions=Array.from({length:20},(_,n)=>[String(n+1),String(n+1)]);
 const bannerOptions=bannerChoices(element);
 const elementControl=data.fields.planoFundo==='osel'?bendingSelect('Elemento',index,'Elemento',[['','Escolher'],['agua','Água'],['ar','Ar'],['fogo','Fogo'],['terra','Terra']],element):'';
 const bannerControl=bannerOptions.length?bendingSelect('Plano de fundo',index,'Banner',bannerOptions,item.Banner||'1'):'';
 const background=banner?' style="--bending-banner-image:url(&quot;'+banner+'&quot;)"':'';
 const result=test==='CD'?'<div class="bending-result"><span>CD de dobra</span><output data-bending-entry-dc>'+bendingDC()+'</output></div>':'<div class="bending-results">'+[[0,'1ª'],[5,'2ª'],[10,'3ª']].map(([penalty,label])=>'<div><span>'+label+'</span><output data-bending-attack="'+penalty+'">'+turnBending(penalty)+'</output></div>').join('')+'</div>';
 const diceRows=(Array.isArray(item.Dados)?item.Dados:[]).map((die,dieIndex)=>'<div class="die-row"><select data-die-owner="'+index+'" data-die-index="'+dieIndex+'" aria-label="Dado '+(dieIndex+1)+'">'+diceOptions.map(([value,label])=>'<option value="'+value+'" '+(die===value?'selected':'')+'>'+label+'</option>').join('')+'</select><button type="button" class="remove-btn" data-remove-die="'+index+'" data-die-index="'+dieIndex+'">Remover</button></div>').join('');
 const dicePanel='<div class="dice-panel"><div class="dice-panel-head"><strong>Dados</strong><button type="button" class="small-btn" data-add-die="'+index+'" aria-label="Adicionar dado">+</button></div>'+diceRows+'<div class="damage-summary"><span>Dano</span><output data-damage-index="'+index+'">'+damageFor(item)+'</output></div></div>';
 const elevated=item.Elevado||'nao';
 const elevationPanel='<div class="elevation-panel">'+bendingSelect('Efeito elevado?',index,'Elevado',[['nao','Não'],['sim','Sim']],elevated)+(elevated==='sim'?bendingSelect('Tipo de efeito',index,'ElevadoTipo',[['dado','Dado'],['texto','Texto']],item.ElevadoTipo||'dado')+(item.ElevadoTipo==='texto'?field('Efeito por elevação','list:tecnicas:'+index+':ElevadoTexto','textarea',true,item.ElevadoTexto||''):bendingSelect('Dado por elevação',index,'ElevadoDado',diceOptions,item.ElevadoDado||'1d4')):'')+'</div>';
 const details='<div class="bending-details">'+['Alvo','Alcance','Área','Duração'].map(name=>field(name,'list:tecnicas:'+index+':'+name,'text',false,item[name]||'')).join('')+'</div>';
 const damage=damageFor(item);
 const summary='<summary class="bending-summary"><span class="bending-summary-main"><strong data-bending-summary-name="'+index+'">'+esc(item.Nome?.trim()||'Dobra '+(index+1))+'</strong><span class="bending-summary-level">Nível '+esc(item.Grau||'1')+'</span></span><span class="bending-summary-damage" data-bending-summary-damage="'+index+'"'+(damage==='—'?' hidden':'')+'>'+esc(damage==='—'?'':damage)+'</span><span class="bending-chevron" aria-hidden="true"></span></summary>';
 return '<details class="bending-entry'+(banner?' has-banner':'')+'" data-bending-index="'+index+'"'+(forPrint||expandedBendings.has(item)?' open':'')+background+'>'+summary+'<div class="bending-entry-body"><div class="repeat-head"><span>Dobra '+(index+1)+'</span><button type="button" class="remove-btn" data-remove="tecnicas" data-index="'+index+'">Remover</button></div>'+field('Nome','list:tecnicas:'+index+':Nome','text',false,item.Nome||'')+'<div class="bending-controls">'+elementControl+bendingSelect('Grau',index,'Grau',gradeOptions,item.Grau||'1')+bendingSelect('Tipo',index,'Tipo',[['Movimento','Movimento'],['Técnica','Técnica']],type)+(type==='Técnica'?bendingSelect('Pontos de foco',index,'Foco',Array.from({length:5},(_,n)=>[String(n+1),String(n+1)]),item.Foco||'1'):'')+bendingSelect('Usa',index,'Teste',[['Acerto','Acerto'],['CD','CD']],test)+bannerControl+'</div><div class="bending-meta"><span>Nível de dobra <output data-bending-level>'+bendingLevel()+'</output></span><strong data-elevation-index="'+index+'">'+elevationFor(item)+'</strong></div>'+result+details+dicePanel+elevationPanel+field('Descrição','list:tecnicas:'+index+':Descrição','textarea',true,item.Descrição||'')+'</div></details>';
}
function renderTalent(item,index,list,columns,forPrint=false){
 const summary='<summary class="talent-summary"><span class="talent-summary-main"><strong data-talent-summary-name="'+list+':'+index+'">'+esc(item.Nome?.trim()||'Talento '+(index+1))+'</strong><span data-talent-summary-level="'+list+':'+index+'">Nível '+esc(item.Nível||'—')+'</span></span><span class="talent-chevron" aria-hidden="true"></span></summary>';
 const body='<div class="talent-body"><div class="repeat-head"><span>Talento '+(index+1)+'</span><button type="button" class="remove-btn" data-remove="'+list+'" data-index="'+index+'">Remover</button></div><div class="grid">'+columns.map(col=>field(col,'list:'+list+':'+index+':'+col,col==='Descrição'?'textarea':'text',col==='Descrição',item[col]||'')).join('')+'</div></div>';
 return '<details class="repeat-item talent-entry" data-talent-list="'+list+'" data-talent-index="'+index+'"'+(forPrint||expandedTalents.has(item)?' open':'')+'>'+summary+body+'</details>';
}
function renderCard(card,forPrint=false){
 let body='';
 if(card.notes){
  const items=Array.isArray(data.lists.anotacoes)?data.lists.anotacoes:[];
  body=items.length?'<div class="note-list">'+items.map((item,index)=>'<div class="note-entry"><div class="repeat-head"><strong>Nota '+(index+1)+'</strong><button type="button" class="remove-btn" data-remove="anotacoes" data-index="'+index+'" aria-label="Remover nota '+(index+1)+'">Remover</button></div>'+field('Título','list:anotacoes:'+index+':Titulo','text',false,item.Titulo||'')+field('Texto','list:anotacoes:'+index+':Texto','textarea',true,item.Texto||'')+'</div>').join('')+'</div>':'<p class="empty">Nenhuma anotação ainda.</p>';
  body+='<button type="button" class="small-btn" data-add="anotacoes">+ Adicionar anotação</button>';
 }else if(card.bendings){
  const items=data.lists.tecnicas||[];
  body=items.length?items.map((item,index)=>renderBending(item,index,forPrint)).join(''):'<p class="empty">Nenhuma dobra adicionada.</p>';
  body+='<button type="button" class="small-btn" data-add="tecnicas">+ Adicionar dobra</button>';
 }else if(card.repeat){
  const items=data.lists[card.repeat]||[];
  body=items.length?items.map((item,i)=>talentLists.has(card.repeat)?renderTalent(item,i,card.repeat,card.columns,forPrint):'<div class="repeat-item"><div class="repeat-head"><span>Registro '+(i+1)+'</span><button class="remove-btn" data-remove="'+card.repeat+'" data-index="'+i+'">Remover</button></div><div class="grid">'+card.columns.map(col=>field(col,'list:'+card.repeat+':'+i+':'+col,col==='Descrição'?'textarea':'text',col==='Descrição',item[col]||'')).join('')+'</div></div>').join(''):'<p class="empty">Nenhum registro ainda.</p>';
  body+='<button class="small-btn" data-add="'+card.repeat+'">+ Adicionar</button>';
 }else if(card.portrait){
  const selected=data.fields.planoFundo||'';
  const artwork=currentArtwork();
  const prompt=selected==='none'?'Sem imagem de personagem':data.fields.elemento?'Selecione seu plano de fundo':'Selecione seu plano de fundo e tipo de dobra';
  body=(artwork?'<figure class="portrait-frame"><img src="'+esc(artwork)+'" alt="Imagem do personagem"><figcaption>'+ (selected==='osel'&&data.fields.estadoAvatar?'Osel · Estado Avatar':'Retrato do personagem') +'</figcaption></figure>':'<div class="portrait-frame portrait-empty">'+prompt+'</div>')+(selected==='osel'?'<button type="button" class="small-btn portrait-toggle" data-avatar-toggle>'+(data.fields.estadoAvatar?'Desativar Estado Avatar':'Ativar Estado Avatar')+'</button>':'');
 }else if(card.vitals){
  body='<div class="combat-vitals">'+[['pvAtuais','PV atuais'],['pvMax','PV máximos'],['pvTemp','PV temporários']].map(([key,label])=>'<label><span>'+label+'</span><input data-key="'+key+'" type="number" inputmode="numeric" placeholder="0" value="'+esc(data.fields[key]??'')+'"></label>').join('')+'</div>';
 }else if(card.attribute){
  body='<div class="attribute-list">'+card.fields.map(name=>'<div class="attribute-row"><span class="attribute-name">'+esc(name)+'</span><label class="attribute-value"><span>Valor</span><input data-field="'+slug(name)+'-valor" type="number" inputmode="numeric" value="'+esc(data.fields[slug(name)+'-valor']||'')+'"></label><span class="attribute-arrow" aria-hidden="true">→</span><div class="attribute-mod"><span>Mod</span><output data-mod="'+slug(name)+'">'+modifier(data.fields[slug(name)+'-valor'])+'</output></div></div>').join('')+'</div><p class="attribute-help">Modificador = arredondar (valor − 10) ÷ 2 para baixo. Ex.: 6 → −2, 8 → −1, 10 → 0, 12 → +1.</p>';
 }else if(card.keyAttribute){
  body='<label class="field"><span>Selecione o atributo chave</span><select id="keyAttribute"><option value="">Escolher atributo</option>'+['Força','Destreza','Constituição','Inteligência','Sabedoria','Carisma'].map(n=>'<option value="'+n+'" '+(data.fields.atributoChave===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label>';
 }else if(card.backgroundPicker){
  const elementSelection=data.fields.planoFundo==='osel'?'<div class="avatar-all-elements">Osel pode escolher qualquer elemento em cada dobra.</div>':'<label class="field"><span>Elemento</span><select id="elementPicker"><option value="">Escolher elemento</option>'+[['agua','Água'],['ar','Ar'],['fogo','Fogo'],['terra','Terra']].map(([key,label])=>'<option value="'+key+'" '+(data.fields.elemento===key?'selected':'')+'>'+label+'</option>').join('')+'</select></label>';
  const bannerList=Object.entries(data.fields.bannersPersonalizados||{}).flatMap(([element,items])=>items.map(item=>'<div class="uploaded-banner"><span>'+esc(({agua:'Água',ar:'Ar',fogo:'Fogo',terra:'Terra'})[element]||element)+' · '+esc(item.name)+'</span><button type="button" class="remove-btn" data-delete-banner="'+esc(element+':'+item.id)+'">Remover</button></div>')).join('');
  body='<div class="grid">'+elementSelection+'<label class="field"><span>Plano de fundo e personagem</span><select id="backgroundPicker"><option value="">Sem plano selecionado</option><option value="none" '+(data.fields.planoFundo==='none'?'selected':'')+'>Pergaminho sem imagem</option>'+[['agua','Água'],['ar','Ar'],['fogo','Fogo'],['terra','Terra'],['osel','Osel'],['rudeus','Rudeus'],['shien','Shien'],['sion','Sion']].map(([key,label])=>'<option value="'+key+'" '+(data.fields.planoFundo===key?'selected':'')+'>'+label+'</option>').join('')+(data.fields.imagemPersonalizada?'<option value="custom" '+(data.fields.planoFundo==='custom'?'selected':'')+'>Imagem própria</option>':'')+'</select></label></div><div class="custom-art"><label for="customImageFile" class="small-btn">Adicionar imagem de fundo/personagem</label><input id="customImageFile" type="file" accept="image/*" hidden><button type="button" class="small-btn" id="addBannerButton">Adicionar banner</button>'+(data.fields.imagemPersonalizada?'<button type="button" class="small-btn" data-use-custom>Usar imagem adicionada</button><button type="button" class="remove-btn" data-remove-custom>Remover imagem</button>':'')+'</div>'+(bannerList?'<div class="uploaded-banners"><h3>Banners adicionados</h3>'+bannerList+'</div>':'');
 }else if(card.armorDetails){
  body='<div class="grid"><label class="field"><span>Categoria usada</span><select data-armor="category">'+['Sem armadura','Leve','Média','Pesada'].map(n=>'<option '+(data.fields.caCategoria===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
   field('Armadura', 'armadura','text',false,data.fields.armadura||'')+
   field('Teto de Destreza', 'caDexCap','number',false,data.fields.caDexCap??'')+
   field('Bônus de item da armadura', 'caItem','number',false,data.fields.caItem??'')+
   field('Outros bônus', 'caOutros','number',false,data.fields.caOutros??'')+
   field('Penalidades', 'caPenalidade','number',false,data.fields.caPenalidade??'')+
   field('Escudo', 'escudo','text',false,data.fields.escudo||'')+
   field('Bônus do escudo erguido', 'caEscudo','number',false,data.fields.caEscudo??'')+
   field('Dureza do escudo', 'dureza-do-escudo','number',false,data.fields['dureza-do-escudo']??'')+
   '</div><label class="shield-toggle"><input id="raisedShield" type="checkbox" '+(data.fields.escudoErguido?'checked':'')+'> Escudo erguido</label><p class="attribute-help">CA = 10 + Destreza (até o teto) + proficiência na categoria usada + bônus de item + outros bônus − penalidades. O bônus do escudo só entra quando estiver erguido.</p>';
 }else if(card.defenseGroup){
  body='<div class="defense-group">'+proficiencyRow('Classe de Armadura','Destreza')+bendingDCRow()+'<div class="bending-turns"><div class="prof-row"><div class="prof-heading"><strong>Proficiência em dobra</strong><span>'+esc(data.fields.atributoChave||'Atributo chave')+'</span><output data-total="proficiencia-em-dobra">'+totalFor('Proficiência em dobra','chave')+'</output></div></div><div class="turn-results"><div><span>2ª dobra</span><output data-turn-bending="5">'+turnBending(5)+'</output></div><div><span>3ª dobra</span><output data-turn-bending="10">'+turnBending(10)+'</output></div></div></div></div>';
 }else if(card.bendingDC){
  body='<div class="dc-display"><output data-bending-dc>'+bendingDC()+'</output></div>';
 }else if(card.skill||card.composite){
  body='<div class="prof-list">'+card.fields.map(name=>proficiencyRow(name,card.skill?skillAttributes[name]:defenseAttributes[name])).join('')+'</div>';
 }else{
  body='<div class="grid">'+card.fields.map(name=>field(name,slug(name),card.long?'textarea':name==='Velocidade (metros)'?'number':'text',card.long,data.fields[slug(name)]||'')).join('')+'</div>';
 }
 const classes=['card'];
 if(card.composite)classes.push('combat-saves');
 if(combatCards.has(card)){classes.push('combat-card');if(card.vitals)classes.push('combat-card-vitals');if(card.defenseGroup)classes.push('combat-card-defense')}
 return '<section class="'+classes.join(' ')+'"><h2>'+esc(card.title)+'</h2>'+body+'</section>';
}
const bendingBannerObserver=new ResizeObserver(entries=>{
 for(const {target} of entries){
  target.style.setProperty('--rotated-banner-width',target.offsetHeight+'px');
  target.style.setProperty('--rotated-banner-height',target.offsetWidth+'px');
 }
});
function migrateNotes(){
 const legacy=data.fields.anotacoes;
 if(typeof legacy!=='string'||!legacy.trim())return;
 if(!Array.isArray(data.lists.anotacoes))data.lists.anotacoes=[];
 data.lists.anotacoes.unshift({Titulo:'',Texto:legacy});
 delete data.fields.anotacoes;
 save();
}
function render(){
 migrateNotes();
 const section=sections.find(s=>s.id===active);
 if(active==='tecnicas')ensureBendingBanners();
 bendingBannerObserver.disconnect();
 document.querySelector('#tabs').innerHTML=sections.map(s=>'<button data-tab="'+s.id+'" class="'+(s.id===active?'active':'')+'" aria-current="'+(s.id===active?'page':'false')+'">'+s.name+'</button>').join('');
 const heading=active==='combate'?'<div class="section-title combat-section-title"><span class="combat-section-seal" aria-hidden="true">'+elementSeal(visualElement())+'</span><div class="combat-section-copy"><small>REGISTRO DE COMBATE</small><h1>'+section.name+'</h1><p>'+section.description+'</p></div></div>':'<div class="section-title"><h1>'+section.name+'</h1><p>'+section.description+'</p></div>';
 document.querySelector('#content').innerHTML=heading+section.cards.map(card=>renderCard(card)).join('');
 document.querySelectorAll('#content .bending-entry.has-banner').forEach(entry=>{
  entry.style.setProperty('--rotated-banner-width',entry.offsetHeight+'px');
  entry.style.setProperty('--rotated-banner-height',entry.offsetWidth+'px');
  bendingBannerObserver.observe(entry);
 });
 document.querySelector('#heroName').value=data.fields['nome-do-personagem']||'';
 document.querySelectorAll('[data-key]').forEach(el=>el.value=data.fields[el.dataset.key]||'');
 document.querySelector('#heroLevelInput').value=data.fields.nivel||'';
 applyBackground();
}
function selectTab(id){
 if(!sections.some(section=>section.id===id))return;
 active=id;
 render();
 const tabs=document.querySelector('#tabs');
 const selected=tabs.querySelector('[data-tab="'+id+'"]');
 if(selected)tabs.scrollTo({left:selected.offsetLeft-(tabs.clientWidth-selected.clientWidth)/2,behavior:'smooth'});
 window.scrollTo(0,0);
}
const swipeArea=document.querySelector('#content');
let swipeStart=null;
swipeArea.addEventListener('touchstart',event=>{
 if(!window.matchMedia('(max-width:700px)').matches||event.touches.length!==1||event.target.closest('input,textarea,select,button,[contenteditable="true"]')){swipeStart=null;return}
 const touch=event.touches[0];
 swipeStart={x:touch.clientX,y:touch.clientY};
},{passive:true});
swipeArea.addEventListener('touchend',event=>{
 if(!swipeStart||event.changedTouches.length!==1)return;
 const start=swipeStart;
 swipeStart=null;
 const touch=event.changedTouches[0];
 const dx=touch.clientX-start.x,dy=touch.clientY-start.y;
 if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.35)return;
 const next=sections.findIndex(section=>section.id===active)+(dx<0?1:-1);
 if(next>=0&&next<sections.length)selectTab(sections[next].id);
},{passive:true});
swipeArea.addEventListener('touchcancel',()=>{swipeStart=null},{passive:true});
function save(){localStorage.setItem(KEY,JSON.stringify(data));document.querySelector('#saveNote').textContent='Ficha salva neste aparelho.'}
document.addEventListener('input',e=>{
 const el=e.target;
 if(el.id==='heroName')data.fields['nome-do-personagem']=el.value;
 else if(el.id==='heroLevelInput')data.fields.nivel=el.value;
 else if(el.dataset.key)data.fields[el.dataset.key]=el.value;
 else if(el.dataset.field){
  if(el.dataset.field.startsWith('list:')){const [,list,index,column]=el.dataset.field.split(':');data.lists[list][Number(index)][column]=el.value}
  else data.fields[el.dataset.field]=el.value;
 }
 if(el.dataset.field==='nivel')document.querySelector('#heroLevelInput').value=el.value;
 if(el.dataset.field==='nome-do-personagem')document.querySelector('#heroName').value=el.value;
 if(el.dataset.field?.startsWith('list:tecnicas:')&&el.dataset.field.endsWith(':Nome')){const index=Number(el.dataset.field.split(':')[2]);const summary=document.querySelector('[data-bending-summary-name="'+index+'"]');if(summary)summary.textContent=el.value.trim()||'Dobra '+(index+1)}
 if(el.dataset.field?.startsWith('list:')){const [,list,index,column]=el.dataset.field.split(':');if(talentLists.has(list)&&(column==='Nome'||column==='Nível')){const summary=document.querySelector('[data-talent-summary-'+(column==='Nome'?'name':'level')+'="'+list+':'+index+'"]');if(summary)summary.textContent=column==='Nome'?(el.value.trim()||'Talento '+(Number(index)+1)):'Nível '+(el.value||'—')}}
 if(el.dataset.field?.endsWith('-valor')){const name=el.dataset.field.slice(0,-6);const out=document.querySelector('[data-mod="'+name+'"]');if(out)out.textContent=modifier(el.value);data.fields[name+'-mod']=el.value===''?'':Math.floor((Number(el.value)-10)/2)}
 if(el.id==='heroLevelInput'){const levelField=document.querySelector('[data-field="nivel"]');if(levelField)levelField.value=el.value}
 refreshTotals();
 save();
});
document.addEventListener('toggle',e=>{const entry=e.target;if(!entry.isConnected||entry.closest('#printSheet'))return;const bending=entry.matches?.('.bending-entry');const talent=entry.matches?.('.talent-entry');if(!bending&&!talent)return;const item=bending?data.lists.tecnicas?.[Number(entry.dataset.bendingIndex)]:data.lists[entry.dataset.talentList]?.[Number(entry.dataset.talentIndex)];const expanded=bending?expandedBendings:expandedTalents;if(item){if(entry.open)expanded.add(item);else expanded.delete(item)}},true);
document.addEventListener('change',e=>{if(e.target.id==='keyAttribute'){data.fields.atributoChave=e.target.value;save();render()}if(e.target.id==='elementPicker'){data.fields.elemento=e.target.value;for(const item of data.lists.tecnicas||[]){item.Banner=randomBanner(e.target.value);item.BannerElement=e.target.value}save();render()}if(e.target.id==='backgroundPicker'){data.fields.planoFundo=e.target.value;if(e.target.value!=='osel')data.fields.estadoAvatar=false;save();render()}if(e.target.id==='raisedShield'){data.fields.escudoErguido=e.target.checked;save();refreshTotals()}if(e.target.dataset.armor){data.fields.caCategoria=e.target.value;save();render()}if(e.target.dataset.dieOwner!=null){const item=data.lists.tecnicas[Number(e.target.dataset.dieOwner)];item.Dados[Number(e.target.dataset.dieIndex)]=e.target.value;save();render()}if(e.target.dataset.field?.startsWith('list:tecnicas:')){const [,list,index,column]=e.target.dataset.field.split(':');const item=data.lists[list][Number(index)];item[column]=e.target.value;if(column==='Elemento'){item.Banner=randomBanner(e.target.value);item.BannerElement=e.target.value}if(column==='Elevado'&&e.target.value==='sim'){item.ElevadoTipo??='dado';item.ElevadoDado??='1d4'}if(column==='ElevadoTipo'&&e.target.value==='dado')item.ElevadoDado??='1d4';save();render()}});
async function imageDataUrl(file,maxSize,quality){
 const source=URL.createObjectURL(file);
 try{
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=source});
  const canvas=document.createElement('canvas');
  const scale=Math.min(1,maxSize/Math.max(img.naturalWidth,img.naturalHeight));
  canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
  canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',quality);
 }finally{URL.revokeObjectURL(source)}
}
document.addEventListener('change',async e=>{
 if(e.target.id!=='customImageFile'||!e.target.files[0])return;
 try{
  const previous={image:data.fields.imagemPersonalizada,plan:data.fields.planoFundo,avatar:data.fields.estadoAvatar};
  data.fields.imagemPersonalizada=await imageDataUrl(e.target.files[0],1600,.78);
  data.fields.planoFundo='custom';
  data.fields.estadoAvatar=false;
  try{save();render()}catch{data.fields.imagemPersonalizada=previous.image;data.fields.planoFundo=previous.plan;data.fields.estadoAvatar=previous.avatar;alert('A imagem é grande demais para salvar neste aparelho. Tente uma imagem menor.')}
 }catch{alert('Não foi possível abrir esta imagem.')}
});
let pendingBannerElement='';
document.querySelector('#bannerUploadFile').addEventListener('change',async e=>{
 const file=e.target.files[0],element=pendingBannerElement;
 e.target.value='';
 if(!file||!bannerCounts[element])return;
 try{
  const image=await imageDataUrl(file,1400,.68);
  const entry={id:'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),name:file.name.replace(/\.[^.]+$/,'').slice(0,40)||'Banner próprio',image};
  const list=(data.fields.bannersPersonalizados??={})[element]??=[];
  list.push(entry);data.fields.bannersPersonalizados[element]=list;
  try{save();render()}catch{list.pop();alert('Não há espaço para salvar este banner neste aparelho. Tente uma imagem menor.')}
 }catch{alert('Não foi possível abrir o banner.')}
});
document.addEventListener('click',e=>{
 const avatarButton=e.target.closest('[data-avatar-toggle]');if(avatarButton&&data.fields.planoFundo==='osel'){data.fields.estadoAvatar=!data.fields.estadoAvatar;save();render()}
 if(e.target.closest('[data-use-custom]')){data.fields.planoFundo='custom';data.fields.estadoAvatar=false;save();render()}
 if(e.target.closest('[data-remove-custom]')){delete data.fields.imagemPersonalizada;if(data.fields.planoFundo==='custom')data.fields.planoFundo='';save();render()}
 const addDie=e.target.closest('[data-add-die]');if(addDie){const item=data.lists.tecnicas[Number(addDie.dataset.addDie)];if(!Array.isArray(item.Dados))item.Dados=[];item.Dados.push('1d4');save();render()}
 const removeDie=e.target.closest('[data-remove-die]');if(removeDie){const item=data.lists.tecnicas[Number(removeDie.dataset.removeDie)];item.Dados?.splice(Number(removeDie.dataset.dieIndex),1);save();render()}
 if(e.target.id==='addBannerButton')document.querySelector('#bannerDialog').showModal();
 if(e.target.id==='cancelBannerDialog')document.querySelector('#bannerDialog').close();
 const bannerElement=e.target.closest('[data-banner-upload-element]');if(bannerElement){pendingBannerElement=bannerElement.dataset.bannerUploadElement;document.querySelector('#bannerDialog').close();document.querySelector('#bannerUploadFile').click()}
 const deleteBanner=e.target.closest('[data-delete-banner]');if(deleteBanner){const [element,id]=deleteBanner.dataset.deleteBanner.split(':');const list=data.fields.bannersPersonalizados?.[element];if(list){const index=list.findIndex(item=>item.id===id);if(index>=0){list.splice(index,1);for(const item of data.lists.tecnicas||[])if(item.Banner==='custom:'+id){item.Banner=randomBanner(element);item.BannerElement=element}save();render()}}}
 const rank=e.target.closest('[data-rank]');if(rank){const key=rankKeyFor(['CD de dobra',...Object.keys(defenseAttributes),...Object.keys(skillAttributes)].find(n=>slug(n)===rank.dataset.rank));data.fields[key]=data.fields[key]===rank.dataset.rankValue?'':rank.dataset.rankValue;save();const row=rank.closest('.prof-row');row.querySelectorAll('[data-rank]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rankValue===data.fields[key])));refreshTotals()}
 const tab=e.target.closest('[data-tab]');if(tab)selectTab(tab.dataset.tab);
 const add=e.target.closest('[data-add]');if(add){const element=data.fields.planoFundo==='osel'?'':data.fields.elemento;const item=add.dataset.add==='tecnicas'?{Grau:'1',Tipo:'Movimento',Teste:'Acerto',Elemento:element,Banner:randomBanner(element),BannerElement:element}:{};(data.lists[add.dataset.add]??=[]).push(item);if(add.dataset.add==='tecnicas')expandedBendings.add(item);if(talentLists.has(add.dataset.add))expandedTalents.add(item);save();render();if(add.dataset.add==='anotacoes')document.querySelector('[data-field="list:anotacoes:'+(data.lists.anotacoes.length-1)+':Titulo"]')?.focus()}
 const remove=e.target.closest('[data-remove]');if(remove){data.lists[remove.dataset.remove].splice(Number(remove.dataset.index),1);save();render()}
});
const menu=document.querySelector('#menu'),menuBtn=document.querySelector('#menuBtn');
menuBtn.onclick=()=>{menu.hidden=!menu.hidden;menuBtn.setAttribute('aria-expanded',String(!menu.hidden))};
document.querySelector('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,...data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ficha-avateixons.json';a.click();URL.revokeObjectURL(url);menu.hidden=true};
document.querySelector('#importBtn').onclick=()=>document.querySelector('#importFile').click();
document.querySelector('#printBtn').onclick=()=>{
 const sheet=document.querySelector('#printSheet');
 sheet.innerHTML='<article class="print-page"><h1>Ficha Avateixons</h1>'+sections.map(s=>'<section class="print-section"><h2>'+esc(s.name)+'</h2>'+s.cards.map(card=>renderCard(card,true)).join('')+'</section>').join('')+'</article>';
 menu.hidden=true;
 window.print();
};
window.addEventListener('afterprint',()=>{document.querySelector('#printSheet').innerHTML=''});
document.querySelector('#importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const imported=JSON.parse(await file.text());if(!imported.fields||!imported.lists)throw Error();data={fields:imported.fields,lists:imported.lists};save();render();menu.hidden=true}catch{alert('Não foi possível importar esta ficha. Escolha um JSON exportado pelo aplicativo.')}e.target.value=''};
document.querySelector('#clearBtn').onclick=()=>{if(confirm('Apagar todos os dados desta ficha neste aparelho?')){data={fields:{},lists:{}};save();render()}menu.hidden=true};
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
