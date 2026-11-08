'use strict';

const $ = id => document.getElementById(id);
const cipher = $('cipher'), encodedText = $('encodedText'), patternCanvas = $('patternCanvas'), cropHighlighted = $('cropHighlighted'), cropEncoded = $('cropEncoded'), cropPattern = $('cropPattern'), reveal = $('reveal');
const cg = cipher.getContext('2d',{willReadFrequently:true}), eg = encodedText.getContext('2d'), pg = patternCanvas.getContext('2d'), chg = cropHighlighted.getContext('2d'), ceg = cropEncoded.getContext('2d'), cpg = cropPattern.getContext('2d'), rg = reveal.getContext('2d');
const PAGE_WIDTH=1224, PAGE_HEIGHT=1584, PAGE_PPI=144, PAGE_MARGIN=108, NONCE_BYTES=12, NONCE_BITS=96, TAG_BITS=128, RESERVED_BITS=NONCE_BITS+TAG_BITS;
const LEGACY_MASTER_KEY_BYTES=new Uint8Array([0x71,0x2c,0x9f,0x45,0xda,0x08,0xb3,0x6e,0x14,0xf7,0x83,0xc1,0x5a,0xee,0x29,0x90,0x4d,0x37,0xa8,0x62,0xfc,0x19,0x05,0xdb,0x8e,0x53,0xb6,0x2a,0xe4,0x7c,0x11,0x99]);
const KEYRING_STORAGE='camocode-v20-keyring', PREVIOUS_KEYRING_STORAGE='camocode-v19-keyring';
const cryptoKeyCache=new Map();
function bytesToHex(bytes){return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
function normalizeKeyHex(value){return String(value||'').replace(/[^0-9a-f]/gi,'').toLowerCase()}
function hexToBytes(hex){if(!/^[0-9a-f]{64}$/.test(hex))throw Error('A key must contain exactly 64 hexadecimal characters.');return new Uint8Array(hex.match(/../g).map(byte=>parseInt(byte,16)))}
function loadKeyring(){
  const legacy=bytesToHex(LEGACY_MASTER_KEY_BYTES);
  try{
    const raw=localStorage.getItem(KEYRING_STORAGE)||localStorage.getItem(PREVIOUS_KEYRING_STORAGE);
    if(!raw)return{active:legacy,keys:[legacy]};
    const saved=JSON.parse(raw),keys=[...new Set(Array.isArray(saved?.keys)?saved.keys.map(normalizeKeyHex).filter(key=>/^[0-9a-f]{64}$/.test(key)):[])];
    if(!keys.length)return{active:legacy,keys:[legacy]};
    const requested=normalizeKeyHex(saved?.active),active=keys.includes(requested)?requested:keys[0];
    return{active,keys};
  }catch{return{active:legacy,keys:[legacy]}}
}
let keyring=loadKeyring(),currentKeyBytes=hexToBytes(keyring.active),currentNonce=null,currentEncoded=null,currentPattern=null,importedCipher=null,renderId=0,timer=0;
let currentTab='cipher';

for(const id of ['message','font','weight','fontSize']) $(id).addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>render(false),260)});

async function privateKey(bytes=currentKeyBytes){const hex=bytesToHex(bytes);if(!cryptoKeyCache.has(hex))cryptoKeyCache.set(hex,await crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['encrypt','decrypt']));return cryptoKeyCache.get(hex)}
function randomNonce(){return crypto.getRandomValues(new Uint8Array(NONCE_BYTES))}
function saveKeyring(){try{localStorage.setItem(KEYRING_STORAGE,JSON.stringify(keyring));return true}catch{return false}}
async function fingerprint(bytes){const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));return bytesToHex(digest).slice(0,16).match(/.{1,4}/g).join('-').toUpperCase()}
async function renderKeyList(){
  const list=$('keyList');list.replaceChildren();
  for(const hex of keyring.keys){
    const active=hex===keyring.active,row=document.createElement('div'),top=document.createElement('div'),id=document.createElement('code'),actions=document.createElement('div'),activate=document.createElement('button'),remove=document.createElement('button');
    row.className='key-row';top.className='key-row-top';actions.className='key-row-actions';id.textContent=await fingerprint(hexToBytes(hex));top.append(id);
    if(active){const badge=document.createElement('span');badge.className='key-badge';badge.textContent='ACTIVE';top.append(badge)}
    activate.type=remove.type='button';activate.className='secondary';activate.textContent=active?'Active key':'Activate';activate.disabled=active;activate.onclick=async()=>{await activateKey(hex,'Activated saved key.');await render(true)};
    remove.className='key-remove';remove.textContent='Remove';remove.disabled=keyring.keys.length===1;remove.title=remove.disabled?'At least one key must remain.':'Remove this key from this browser keyring.';remove.onclick=()=>removeStoredKey(hex);
    actions.append(activate,remove);row.append(top,actions);list.append(row);
  }
}
async function refreshKeyUI(message=''){const hex=bytesToHex(currentKeyBytes);$('keyDisplay').value=hex;$('keyFingerprint').textContent=await fingerprint(currentKeyBytes);$('keyStatus').textContent=message||`${keyring.keys.length} key${keyring.keys.length===1?'':'s'} saved in this browser keyring.`;await renderKeyList()}
async function activateKey(hex,message){hex=normalizeKeyHex(hex);currentKeyBytes=hexToBytes(hex);keyring.keys=[hex,...keyring.keys.filter(key=>key!==hex)];keyring.active=hex;const saved=saveKeyring();await refreshKeyUI(`${message}${saved?'':' Warning: browser storage was unavailable; copy the displayed key now.'}`)}
async function removeStoredKey(hex){
  if(keyring.keys.length===1){await refreshKeyUI('The final key cannot be removed. Add another key first.');return}
  const id=await fingerprint(hexToBytes(hex));
  if(!confirm(`Remove key ${id} from this browser keyring? PNGs that require it cannot be decoded here unless you add the 64-character key again.`))return;
  const wasActive=hex===keyring.active;keyring.keys=keyring.keys.filter(key=>key!==hex);cryptoKeyCache.delete(hex);
  if(wasActive){keyring.active=keyring.keys[0];currentKeyBytes=hexToBytes(keyring.active)}
  const saved=saveKeyring();await refreshKeyUI(`Removed key ${id}.${wasActive?' Another saved key is now active.':''}${saved?'':' Warning: browser storage could not be updated.'}`);
  if(wasActive)await render(true);
}
async function decryptWithKeyring(image,width,height){const ordered=[keyring.active,...keyring.keys.filter(key=>key!==keyring.active)];for(const hex of ordered)try{return{decoded:await decryptPixels(image,width,height,hexToBytes(hex)),keyBytes:hexToBytes(hex),hex}}catch{}throw Error('No retained key authenticated this PNG.')}

function appendInline(parent,source){
  const token=/(\$[^$\n]+\$|\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/g;
  let cursor=0;
  for(const match of source.matchAll(token)){
    if(match.index>cursor)parent.append(document.createTextNode(source.slice(cursor,match.index)));
    const value=match[0];
    if(value.startsWith('$')){const span=document.createElement('span');katex.render(value.slice(1,-1),span,{throwOnError:false,strict:'ignore'});parent.append(span)}
    else if(value.startsWith('**')){const strong=document.createElement('strong');strong.textContent=value.slice(2,-2);parent.append(strong)}
    else if(value.startsWith('`')){const code=document.createElement('code');code.textContent=value.slice(1,-1);parent.append(code)}
    else{const em=document.createElement('em');em.textContent=value.slice(1,-1);parent.append(em)}
    cursor=match.index+value.length;
  }
  if(cursor<source.length)parent.append(document.createTextNode(source.slice(cursor)));
}

function isBlockStart(line){const s=line.trim();return !s||s.startsWith('$$')||/^#{1,3}\s+/.test(s)||/^[-*+]\s+/.test(s)||/^\d+\.\s+/.test(s)||/^>\s?/.test(s)||/^---+$/.test(s)}

function renderSource(source,target){
  target.replaceChildren();
  const lines=source.replace(/\r/g,'').split('\n');
  for(let i=0;i<lines.length;){
    const trimmed=lines[i].trim();
    if(!trimmed){i++;continue}
    if(trimmed.startsWith('$$')){
      let expression=trimmed.slice(2);
      if(expression.endsWith('$$')&&expression.length>=2){expression=expression.slice(0,-2);i++}
      else{const parts=[expression];i++;while(i<lines.length&&!lines[i].trim().endsWith('$$'))parts.push(lines[i++]);if(i<lines.length)parts.push(lines[i++].trim().slice(0,-2));expression=parts.join('\n')}
      const block=document.createElement('div');block.className='math-display';katex.render(expression.trim(),block,{displayMode:true,throwOnError:false,strict:'ignore'});target.append(block);continue;
    }
    const heading=/^(#{1,3})\s+(.*)$/.exec(trimmed);
    if(heading){const node=document.createElement(`h${heading[1].length}`);appendInline(node,heading[2]);target.append(node);i++;continue}
    if(/^[-*+]\s+/.test(trimmed)||/^\d+\.\s+/.test(trimmed)){
      const ordered=/^\d+\.\s+/.test(trimmed),list=document.createElement(ordered?'ol':'ul'),itemPattern=ordered?/^\d+\.\s+(.*)$/:/^[-*+]\s+(.*)$/;
      while(i<lines.length){const item=itemPattern.exec(lines[i].trim());if(!item)break;const li=document.createElement('li');appendInline(li,item[1]);list.append(li);i++}target.append(list);continue;
    }
    if(/^>\s?/.test(trimmed)){const quote=document.createElement('blockquote'),parts=[];while(i<lines.length&&/^>\s?/.test(lines[i].trim()))parts.push(lines[i++].trim().replace(/^>\s?/,''));appendInline(quote,parts.join(' '));target.append(quote);continue}
    if(/^---+$/.test(trimmed)){target.append(document.createElement('hr'));i++;continue}
    const parts=[trimmed];i++;while(i<lines.length&&!isBlockStart(lines[i]))parts.push(lines[i++].trim());const paragraph=document.createElement('p');appendInline(paragraph,parts.join(' '));target.append(paragraph);
  }
}

function fitPageContent(page){
  const available=PAGE_WIDTH-PAGE_MARGIN*2;
  for(const block of page.querySelectorAll('.math-display')){
    block.style.fontSize='';
    const math=block.querySelector('.katex-display>.katex')||block.querySelector('.katex');
    if(!math)continue;
    for(let pass=0;pass<3;pass++){
      const width=math.getBoundingClientRect().width;
      if(width<=available)break;
      const current=parseFloat(getComputedStyle(block).fontSize);
      block.style.fontSize=`${Math.max(10,current*(available/width)*.98)}px`;
    }
  }
}

async function makeMask(width,height){
  const page=$('pageComposer');
  page.style.width=`${width}px`;page.style.height=`${height}px`;page.style.margin='0';page.style.padding=`${PAGE_MARGIN}px`;page.style.boxSizing='border-box';page.style.textAlign='left';
  page.style.fontFamily=`"${$('font').value}", sans-serif`;page.style.fontWeight=$('weight').value;page.style.fontSize=`${+$('fontSize').value}px`;
  renderSource($('message').value||' ',page);
  await document.fonts.ready;
  fitPageContent(page);
  const overflowing=page.scrollHeight>page.clientHeight||page.scrollWidth>page.clientWidth;
  const rendered=await html2canvas(page,{backgroundColor:null,scale:1,width,height,logging:false,useCORS:true,onclone:doc=>{const clone=doc.getElementById('pageComposer');clone.style.position='absolute';clone.style.left='0';clone.style.top='0';clone.style.width=`${width}px`;clone.style.height=`${height}px`;clone.style.margin='0';clone.style.padding=`${PAGE_MARGIN}px`;clone.style.boxSizing='border-box'}});
  return{image:rendered.getContext('2d',{willReadFrequently:true}).getImageData(0,0,width,height),overflowing};
}

function packMask(mask,pixelCount){const bitCount=pixelCount-RESERVED_BITS;if(bitCount<8||bitCount%8)throw Error('Canvas pixel count is incompatible with the encrypted format.');const bytes=new Uint8Array(bitCount/8);for(let bitIndex=0;bitIndex<bitCount;bitIndex++){const pixel=NONCE_BITS+bitIndex;if(mask.data[pixel*4+3]>=96)bytes[bitIndex>>3]|=1<<(7-(bitIndex&7))}return bytes}
function bit(bytes,n){return(bytes[n>>3]>>(7-(n&7)))&1}
function composePngPixels(nonce,encrypted,width,height){const total=width*height,out=new ImageData(width,height);if(NONCE_BITS+encrypted.length*8!==total)throw Error('Encrypted payload does not fit the canvas.');for(let p=0;p<total;p++){const b=p<NONCE_BITS?bit(nonce,p):bit(encrypted,p-NONCE_BITS),i=p*4,value=b?0:255;out.data[i]=out.data[i+1]=out.data[i+2]=value;out.data[i+3]=255}return out}
async function encryptMask(mask,width,height,nonce){const plain=packMask(mask,width*height),encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,tagLength:128},await privateKey(),plain));return composePngPixels(nonce,encrypted,width,height)}
async function internalPattern(width,height,nonce,encoded,keyBytes=currentKeyBytes){const total=width*height,plainBytes=(total-RESERVED_BITS)/8,zeros=new Uint8Array(plainBytes),encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,tagLength:128},await privateKey(keyBytes),zeros)),out=composePngPixels(nonce,encrypted,width,height);if(encoded)for(let p=total-TAG_BITS;p<total;p++){const i=p*4;out.data[i]=encoded.data[i];out.data[i+1]=encoded.data[i+1];out.data[i+2]=encoded.data[i+2];out.data[i+3]=encoded.data[i+3]}return out}
function bytesFromPixels(image,startPixel,byteCount){const out=new Uint8Array(byteCount);for(let n=0;n<byteCount*8;n++)if(image.data[(startPixel+n)*4]<128)out[n>>3]|=1<<(7-(n&7));return out}
async function decryptPixels(image,width,height,keyBytes=currentKeyBytes){const total=width*height;if((total-RESERVED_BITS)%8)throw Error('PNG dimensions do not match the encrypted format.');const nonce=bytesFromPixels(image,0,NONCE_BYTES),encrypted=bytesFromPixels(image,NONCE_BITS,(total-NONCE_BITS)/8),plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:nonce,tagLength:128},await privateKey(keyBytes),encrypted)),out=new ImageData(width,height);out.data.fill(255);for(let n=0;n<plain.length*8;n++){const p=NONCE_BITS+n,i=p*4,value=bit(plain,n)?0:255;out.data[i]=out.data[i+1]=out.data[i+2]=value;out.data[i+3]=255}return out}

function makeEncodedTextView(encoded,decoded,width,height){const out=new ImageData(width,height);for(let p=0;p<width*height;p++){const i=p*4,inside=decoded.data[i]<128,dark=encoded.data[i]<128;if(inside){out.data[i]=dark?190:255;out.data[i+1]=dark?30:170;out.data[i+2]=dark?45:185}else out.data[i]=out.data[i+1]=out.data[i+2]=dark?0:255;out.data[i+3]=255}return out}
function textBounds(decoded,width,height,padding=20){let minX=width,minY=height,maxX=-1,maxY=-1;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(decoded.data[(y*width+x)*4]<128){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}if(maxX<0)return{x:0,y:0,width:1,height:1};const x=Math.max(0,minX-padding),y=Math.max(0,minY-padding),right=Math.min(width,maxX+padding+1),bottom=Math.min(height,maxY+padding+1);return{x,y,width:right-x,height:bottom-y}}
function cropImage(source,sourceWidth,bounds){const out=new ImageData(bounds.width,bounds.height);for(let y=0;y<bounds.height;y++){const from=((bounds.y+y)*sourceWidth+bounds.x)*4,to=y*bounds.width*4;out.data.set(source.data.subarray(from,from+bounds.width*4),to)}return out}
function clipPatternToText(source,decoded,width,height){const out=new ImageData(width,height);out.data.fill(255);for(let p=0;p<width*height;p++)if(decoded.data[p*4]<128){const i=p*4;out.data[i]=source.data[i];out.data[i+1]=source.data[i+1];out.data[i+2]=source.data[i+2];out.data[i+3]=255}return out}
function updateCrops(encoded,pattern,decoded,width,height){const bounds=textBounds(decoded,width,height),highlighted=makeEncodedTextView(encoded,decoded,width,height),encodedTextOnly=clipPatternToText(encoded,decoded,width,height),patternTextOnly=clipPatternToText(pattern,decoded,width,height);cropHighlighted.width=cropEncoded.width=cropPattern.width=bounds.width;cropHighlighted.height=cropEncoded.height=cropPattern.height=bounds.height;chg.putImageData(cropImage(highlighted,width,bounds),0,0);ceg.putImageData(cropImage(encodedTextOnly,width,bounds),0,0);cpg.putImageData(cropImage(patternTextOnly,width,bounds),0,0);$('cropInfo').textContent=`Three synchronized crops: x ${bounds.x}, y ${bounds.y}, ${bounds.width} × ${bounds.height} pixels (20 px margin).`}

async function render(fresh){
  const id=++renderId,w=PAGE_WIDTH,h=PAGE_HEIGHT;$('status').textContent='Rendering and encrypting the page…';if(fresh||!currentNonce)currentNonce=randomNonce();
  try{
    const result=await makeMask(w,h);if(id!==renderId)return false;
    const encoded=await encryptMask(result.image,w,h,currentNonce),decoded=await decryptPixels(encoded,w,h),pattern=await internalPattern(w,h,currentNonce,encoded);if(id!==renderId)return false;
    currentEncoded=encoded;currentPattern=pattern;$('fontSizeValue').textContent=$('fontSize').value+' px';cg.putImageData(encoded,0,0);eg.putImageData(makeEncodedTextView(encoded,decoded,w,h),0,0);pg.putImageData(pattern,0,0);updateCrops(encoded,pattern,decoded,w,h);rg.putImageData(decoded,0,0);
    $('algorithm').textContent=`PAGE FORMAT\n8.5 × 11 inches at ${PAGE_PPI} pixels per inch\n${PAGE_WIDTH} × ${PAGE_HEIGHT} binary pixels\nMarkdown and LaTeX are rendered to one bitmap mask before encryption\n\nCIPHER FORMAT\n96 pixels: public random nonce\nremaining pixels: AES-256-GCM ciphertext + 128-bit authentication tag\npage-mask bits align with ciphertext pixels from pixel 96 through the start of the tag\n\nPRIVATE OPERATION\npattern = AES-256-GCM internal keystream(master key, nonce)\nencoded = binary page mask encrypted under that pattern\nrevealed = authenticated AES-256-GCM decryption\n\nPRIVATE DIAGNOSTICS\nEncoded (Text) highlights the aligned recovered glyph pixels in red.\nInternal copies the public authentication-tag pixels so switching views isolates only the message pixels.\nCropped preserves the encoded-noise background and highlights authenticated recovered text pixels in red.\n\nEvery export generates a new 96-bit nonce and therefore a new ciphertext pattern.\nThe font and LaTeX source are not needed to decode because the decrypted result is the original page bitmap.\nThe nonce is public and is not the key. The active 256-bit key is shown only in the private key-management panel.\n\nIMPLEMENTATION FUNCTIONS\n${packMask.toString()}\n\n${composePngPixels.toString()}\n\n${encryptMask.toString()}\n\n${decryptPixels.toString()}\n\n${clipPatternToText.toString()}\n\n${renderSource.toString()}\n\n${makeMask.toString()}`;
    $('status').innerHTML=result.overflowing?'<span class="warning">Page overflow: reduce the body size or shorten the source before exporting.</span>':'<span class="ok">Encrypted letter page ready. Content fits on one page.</span>';return !result.overflowing;
  }catch(e){$('status').textContent='Encryption error: '+e.message;return false}
}

function download(name,url){const a=document.createElement('a');a.download=name;a.href=url;a.click()}
$('exportCipher').onclick=async()=>{const button=$('exportCipher');button.disabled=true;const fits=await render(true);if(fits){download('camocode-v20-letter-page.png',cipher.toDataURL('image/png'));$('status').innerHTML='<span class="ok">Exported one encrypted 8.5 × 11 page with a fresh nonce.</span>'}button.disabled=false};
const pageCanvases=[cipher,encodedText,patternCanvas,reveal];
function applyPageZoom(value){const zoom=Math.max(25,Math.min(1000,Math.round(+value/25)*25));$('pageZoom').value=zoom;$('pageZoomValue').textContent=zoom+'%';for(const canvas of pageCanvases)canvas.style.width=`${canvas.width*zoom/100}px`;return zoom}
function fitPage(){const stage=$(currentTab+'Stage'),canvas=currentTab==='encodedText'?encodedText:currentTab==='pattern'?patternCanvas:currentTab==='reveal'?reveal:cipher,available=Math.max(1,stage.clientWidth-30);applyPageZoom(Math.floor(available/canvas.width*100/25)*25)}
$('pageZoom').oninput=event=>applyPageZoom(event.target.value);
$('zoomActual').onclick=()=>applyPageZoom(100);
$('zoomFit').onclick=fitPage;
function tab(name){currentTab=name;for(const n of ['cipher','encodedText','pattern','crop','reveal','algorithm']){$(n+'Stage').classList.toggle('hidden',n!==name);$('show'+n[0].toUpperCase()+n.slice(1)).classList.toggle('active',n===name)}}
$('showCipher').onclick=()=>tab('cipher');$('showEncodedText').onclick=()=>tab('encodedText');$('showPattern').onclick=()=>tab('pattern');$('showCrop').onclick=()=>tab('crop');$('showReveal').onclick=()=>tab('reveal');$('showAlgorithm').onclick=()=>tab('algorithm');
$('cipherFile').onchange=()=>{const file=$('cipherFile').files[0];if(!file)return;const image=new Image();image.onload=()=>{importedCipher=image;URL.revokeObjectURL(image.src);$('status').textContent=`Loaded ${file.name}: ${image.naturalWidth} × ${image.naturalHeight}.`};image.src=URL.createObjectURL(file)};
function imageData(image){const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);return context.getImageData(0,0,canvas.width,canvas.height)}
$('decrypt').onclick=async()=>{if(!importedCipher){alert('Choose an encoded PNG first.');return}const w=importedCipher.naturalWidth,h=importedCipher.naturalHeight;try{const encoded=imageData(importedCipher),match=await decryptWithKeyring(encoded,w,h),nonce=bytesFromPixels(encoded,0,NONCE_BYTES),pattern=await internalPattern(w,h,nonce,encoded,match.keyBytes),decoded=match.decoded;encodedText.width=patternCanvas.width=reveal.width=w;encodedText.height=patternCanvas.height=reveal.height=h;eg.putImageData(makeEncodedTextView(encoded,decoded,w,h),0,0);pg.putImageData(pattern,0,0);updateCrops(encoded,pattern,decoded,w,h);rg.putImageData(decoded,0,0);applyPageZoom($('pageZoom').value);$('status').innerHTML=`<span class="ok">Authenticated and decoded ${(w*h).toLocaleString()} pixels using key ${(await fingerprint(match.keyBytes))}.</span>`;tab('reveal')}catch(e){$('status').innerHTML='<span class="warning">Decode failed: no retained key authenticated this PNG, or the PNG was altered.</span>'}};

$('toggleKey').onclick=()=>{const showing=$('keyDisplay').type==='text';$('keyDisplay').type=showing?'password':'text';$('toggleKey').textContent=showing?'Show key':'Hide key'};
$('copyKey').onclick=async()=>{try{await navigator.clipboard.writeText(bytesToHex(currentKeyBytes));await refreshKeyUI('Current key copied to the clipboard. Keep it secret.')}catch{$('keyDisplay').type='text';$('keyDisplay').select();$('keyStatus').textContent='Clipboard access failed. The key is selected for manual copying.'}};
$('generateKey').onclick=async()=>{if(!confirm('Generate a new active key? The previous key will remain in this browser keyring so old PNGs can still be decoded. Copy the new key somewhere safe.'))return;const bytes=crypto.getRandomValues(new Uint8Array(32));await activateKey(bytesToHex(bytes),'Generated and activated a new random 256-bit key. Previous keys were retained.');await render(true)};
$('activateKey').onclick=async()=>{try{const hex=normalizeKeyHex($('restoreKey').value);await activateKey(hex,'Added and activated the entered key. Previous keys were retained.');$('restoreKey').value='';await render(true)}catch(e){$('keyStatus').textContent=e.message}};

applyPageZoom(50);
saveKeyring();
refreshKeyUI();
render(true);
