/* Number the actual installed parliamentary compositions, not governments or election announcements. */
function legislatureCycles(st=state){const rows=st.deputyMandates?.legislatures||[],cycles=[];for(const l of rows){if(l.id.startsWith('scenario:')||cycles.includes(l.id))continue;cycles.push(l.id);}return cycles;}
function legislatureNumber(st=state){const cycles=legislatureCycles(st),id=deputyCycleId(st),index=cycles.indexOf(id);if(id.startsWith('scenario:'))return 11;return 11+Math.max(0,index);}
function legislatureRoman(number){let n=number,result='';for(const [value,label] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=value){result+=label;n-=value;}return result;}
function legislatureLabel(st=state){return 'Legjislatura '+legislatureRoman(legislatureNumber(st));}
function renderLegislatureSequence(){if(!state)return;document.querySelectorAll('[data-legislature-label]').forEach(node=>node.textContent=legislatureLabel(state));const role=document.getElementById('roleDisplay');if(role)role.textContent=getPlayerRoleLabel()+' • '+legislatureLabel(state);}
const legislatureRefreshBase=refreshAllUI,legislatureAssemblyBase=renderAssemblySection,legislatureActivateBase=activateConstitutedAssembly;
refreshAllUI=function(...args){const result=legislatureRefreshBase(...args);renderLegislatureSequence();return result;};
renderAssemblySection=function(...args){const result=legislatureAssemblyBase(...args);renderLegislatureSequence();return result;};
activateConstitutedAssembly=function(session){const result=legislatureActivateBase(session);renderLegislatureSequence();return result;};
