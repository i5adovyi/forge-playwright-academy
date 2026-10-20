let reservationTimer;
document.querySelector('#reserve').addEventListener('click',()=>{
  clearTimeout(reservationTimer);
  document.querySelector('#reservation').textContent='Reservation active';
  reservationTimer=setTimeout(()=>{document.querySelector('#reservation').textContent='Reservation expired';},30_000);
});
let uploadRevision=0;
document.querySelector('#note').addEventListener('change',async event=>{
  const revision=++uploadRevision;
  const file=event.target.files[0];
  const status=document.querySelector('#upload-status');
  const preview=document.querySelector('#file-preview');
  preview.textContent='';
  if(!file){status.textContent='No file selected';return;}
  if(!file.name.toLowerCase().endsWith('.txt')){status.textContent='Choose a .txt file';return;}
  const text=await file.text();
  if(revision!==uploadRevision)return;
  status.textContent=`Loaded ${file.name}`;
  preview.textContent=text;
});
document.querySelector('#delete-draft').addEventListener('click',()=>{
  if(window.confirm('Delete this draft?'))document.querySelector('#draft-status').textContent='Draft deleted';
});
