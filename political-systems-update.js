/* Shared appointment constraints and lossless local-save codec. */
function packLocalSlots(slots){
    const text=JSON.stringify(slots).replace(/[\u007f-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
    const dict=new Map();let next=256,word='',out=[];
    for(const ch of text){const joined=word+ch;if(word===''||dict.has(joined)){word=joined;continue;}
        out.push(String.fromCharCode((word.length===1?word.charCodeAt(0):dict.get(word))+1));
        if(next<65534)dict.set(joined,next++);word=ch;
    }
    if(word)out.push(String.fromCharCode((word.length===1?word.charCodeAt(0):dict.get(word))+1));
    return 'RKS-LZW1:'+out.join('');
}
function unpackLocalSlots(raw){
    if(!raw?.startsWith('RKS-LZW1:'))return JSON.parse(raw);
    const data=raw.slice(9),dict=[];let next=256,word='',parts=[];
    for(let i=0;i<data.length;i++){const code=data.charCodeAt(i)-1;let entry=code<256?String.fromCharCode(code):dict[code];
        if(entry===undefined&&code===next&&word)entry=word+word[0];
        if(entry===undefined)throw Error('Ruajtja e kompresuar është e dëmtuar.');
        parts.push(entry);if(word&&next<65534)dict[next++]=word+entry[0];word=entry;
    }
    return JSON.parse(parts.join(''));
}
function compactExistingLocalSlots(){
    const raw=localStorage.getItem(STORAGE_KEY_SLOTS);if(!raw||raw.startsWith('RKS-LZW1:'))return false;
    const packed=packLocalSlots(unpackLocalSlots(raw));if(packed.length>=raw.length)return false;
    localStorage.setItem(STORAGE_KEY_SLOTS,packed);return true;
}
function downloadLocalGameBackup(){
    try{const json=window.republikaCloudGame.exportJSON(),url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='republika-java-'+state.turnCount+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;}
    catch(e){reportSaveError(e);return false;}
}
async function importLocalGameBackup(input){
    const file=input.files?.[0];if(!file)return;
    try{window.republikaCloudGame.importJSON(await file.text());showToast('Kopja lokale u ngarkua.');}
    catch(e){reportSaveError(e);}finally{input.value='';}
}
function cabinetReservedName(st,name){
    const key=cabinetIdentity(name),pm=st.parties[st.mandatar||st.playerParty]?.leader;
    return key===cabinetIdentity(pm||'')||st.speakerElected&&key===cabinetIdentity(st.speakerOfAssembly);
}
function cabinetNomineeAvailable(st,name,proposal,index){
    return !!name&&!cabinetReservedName(st,name)&&!proposal.some((m,i)=>i!==index&&cabinetIdentity(m.ministerName)===cabinetIdentity(name));
}
function cabinetProposalProblem(st){
    const rows=st.cabinetProposal||[];
    if(rows.length!==st.ministries.length||new Set(rows.map(m=>m.ministryId)).size!==rows.length)return 'Kabineti duhet të përmbajë çdo ministri vetëm një herë.';
    if(rows.some(r=>!st.ministries.some(m=>m.id===r.ministryId)||!st.coalitionParties.includes(r.party)))return 'Ministri ose subjekt jashtë marrëveshjes së koalicionit.';
    for(const a of st.coalitionAgreements||[])if(st.coalitionParties.includes(a.partner)&&rows.filter(r=>r.party===a.partner).length!==a.ministriesCount)return 'Respektoni ministritë e rezervuara për partnerët e koalicionit.';
    for(let i=0;i<rows.length;i++)if(!cabinetNomineeAvailable(st,rows[i].ministerName,rows,i))return 'Kryeministri/Kryetari i Kuvendit nuk emërohet ministër dhe një person nuk mban dy ministri.';
    return '';
}
function oppositionConsultationParties(st){return Object.keys(st.parties).filter(id=>id!==st.playerParty&&!st.coalitionParties.includes(id)&&['PDK','LDK','AAK','LVV','NISMA'].includes(id));}
function consultationOptionText(option,st){return option.consultOpposition?'Fto liderët e '+(oppositionConsultationParties(st).map(id=>st.parties[id].short).join(', ')||'subjekteve të tjera parlamentare')+' në takim për platformë shtetërore':option.text;}
function priorityCandidateOrder(a,b,metadata,seed){
    if(metadata?.listPriorityPolicy==='TOP10_POOL30_V1'){
        const ap=a.ballotPosition||a.listNumber,bp=b.ballotPosition||b.listNumber;
        const core=Number(bp<=10)-Number(ap<=10);if(core)return core;
        return b.personalVotes-a.personalVotes||ap-bp||a.id.localeCompare(b.id);
    }
    return b.personalVotes-a.personalVotes||assemblyDraw(seed,a.id)-assemblyDraw(seed,b.id)||a.id.localeCompare(b.id);
}
