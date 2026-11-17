/* Institutional personal stories require the player's current authority, not a fictional family tie. */
const PERSONAL_EXECUTIVE_STORIES=new Set(['PERSONAL_RELATIVE','PERSONAL_FAVOUR','PERSONAL_CLUB','PERSONAL_PROPERTY','PERSONAL_PROMISE','PERSONAL_HOBBY']);
function personalStoryRoleAllowed(kind,st=state,r=null){if(!PERSONAL_STORY_SPECS[kind])return true;if(r&&r.owner!==st.playerParty)return false;return !PERSONAL_EXECUTIVE_STORIES.has(kind)||agendaExecutive(st)&&(!r||r.governmentKey===crisisGovernmentKey(st));}
function archiveWrongRoleStories(st){for(const r of storyDB(st)?.records||[])if(storyLive(r)&&PERSONAL_STORY_SPECS[r.kind]&&!personalStoryRoleAllowed(r.kind,st,r)){Object.assign(r,{status:'DONE',cancelled:true,good:false,completedTurn:st.turnCount,nextTurn:null,aftermathTurn:st.turnCount+6,aftermathApplied:false,roleArchived:true});r.outcome='Rasti u mbyll pa penalitet: ky vendim nuk i takon rolit aktual të lojtarit.';r.timeline.push({turn:st.turnCount,text:r.outcome});}}
const roleSafeSources=storySources,roleSafeEligible=storyEligible,roleSafeRole=storyRole,roleSafeAftermath=storyAftermath,roleSafePrepare=prepareLoadedState,roleSafeWorldWeek=worldProcessWeek,roleSafeRows=worldAttentionRows;
storySources=function(kind,st=state){return personalStoryRoleAllowed(kind,st)?roleSafeSources(kind,st):[];};
storyEligible=function(kind,st=state){return personalStoryRoleAllowed(kind,st)&&roleSafeEligible(kind,st);};
storyRole=function(st,r){return personalStoryRoleAllowed(r.kind,st,r)&&roleSafeRole(st,r);};
storyAftermath=function(r){if(PERSONAL_STORY_SPECS[r.kind]&&r.cancelled){if(state.turnCount>=r.aftermathTurn)r.aftermathApplied=true;return;}return roleSafeAftermath(r);};
prepareLoadedState=function(...args){const st=roleSafePrepare(...args);archiveWrongRoleStories(st);validateLoadedState(st);return st;};
worldProcessWeek=function(turn){archiveWrongRoleStories(state);return roleSafeWorldWeek(turn);};
worldAttentionRows=function(st=state){return roleSafeRows(st).filter(row=>!PERSONAL_STORY_SPECS[row.record?.kind]||personalStoryRoleAllowed(row.record.kind,st,row.record));};
