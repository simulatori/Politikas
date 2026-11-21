importScripts('./political-systems-update.js');
self.onmessage=function(e){try{const {id,json}=e.data;self.postMessage({id,packed:packLocalJSON(json)});}catch(error){self.postMessage({id:e.data.id,error:error.message});}};
