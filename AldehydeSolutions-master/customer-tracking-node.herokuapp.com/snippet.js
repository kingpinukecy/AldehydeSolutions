const debug = false;
function log(obj){
    if(debug){
        console.log(obj);
    }
}

const fileURLs = new Set();
function isFileLink(link) {
    const fileExtensions = ['.pdf', '.xlsx', '.csv', '.xls', '.doc', '.docx'];
    return fileExtensions.some(ext => link.endsWith(ext));
  }
function addListenersToFiles() {
    let links = document.querySelectorAll('a[href]');
    links.forEach(element => {        
        if (element && !fileURLs.has(element)) {
            let url = element.getAttribute('href');

            if(url && isFileLink(url)){
                fileURLs.add(element);
                element.addEventListener('click', function(event) {
                    addImage(undefined, undefined, undefined, undefined, undefined, url);
                });
            }
        }
    });
}


const dataTargetsWithListeners = new Set();
function addListenersToDataTargetElements() {
    let elementsWithDataTarget = document.querySelectorAll('[data-target]');
    
    elementsWithDataTarget.forEach(element => {        
        if (element && !dataTargetsWithListeners.has(element)) {
            dataTargetsWithListeners.add(element);
        
            element.addEventListener('click', function(event) {
                let dataTarget = element.getAttribute('data-target');
                let targetWithoutHash = dataTarget.replace('#', '');
                while(targetWithoutHash.includes('#')){
                    targetWithoutHash = targetWithoutHash.replace('#', '');
                }
                addImage(undefined, undefined, undefined, undefined, targetWithoutHash, undefined);
            });
        }
    });
}

const formsWithListeners = new Set();
function addListenersToNewForms() {

    let forms = document.getElementsByTagName('form');
    let filteredForms = [];

    for (let i = 0; i < forms.length; i++) {
        let form = forms[i];
        if (!formsWithListeners.has(form)) {
            log('found a form!');
            log(form);
            formsWithListeners.add(form);

            let inputs = form.getElementsByTagName('input');
            log(inputs);
            let hasEmailField = false;
            for (let j = 0; j < inputs.length; j++) {
                let input = inputs[j];
                if (input.name && input.name.toLowerCase().includes('email')) {
                    hasEmailField = true;
                    break;
                }
            }

            if (hasEmailField) {
                filteredForms.push(form);
                log('this from has email field and is pushed!');
            }
        }
    }

    filteredForms.forEach(form => {
        let buttons = form.querySelectorAll('button, input[type="submit"]');
        
        form.addEventListener('submit', function(event) {
            log('adding onsubmit even listener');
            let validatedEmails = new Set();
            let emailInputs = Array.from(form.querySelectorAll('input[name*="email" i]'));

            emailInputs.forEach(input => {
                log('validating email...');
                let emailValue = input.value.trim().toLowerCase();
                let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailPattern.test(emailValue)) {
                    validatedEmails.add(emailValue);
                    log('this email is valid -> ' + emailValue);
                }
            });

            if (validatedEmails) {
                validatedEmails.forEach(email => {
                    log('adding image...');
                    addImage(undefined, form, true, email, undefined, undefined);
                });
            }
        });
        
        buttons.forEach(button => {
            // button.addEventListener('click', function(event) {
            //     let validatedEmails = new Set();
            //     let emailInputs = Array.from(form.querySelectorAll('input[name*="email"]'));

            //     emailInputs.forEach(input => {
            //         let emailValue = input.value.trim().toLowerCase();
            //         let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            //         if (emailPattern.test(emailValue)) {
            //             validatedEmails.add(emailValue);
            //         }
            //     });

            //     if (validatedEmails) {
            //         validatedEmails.forEach(email => {
            //             addImage(undefined, form, true, email);
            //         });
            //     }
            // });
        });
    });
}

function getCookie(name) {
    let cookie = {};
    JSON.stringify(document.cookie).split(';').forEach(function(el) {
      el = el.replaceAll('"', '');
      el = el.replaceAll("'", '');
      let [key,value] = el.split('=');
      cookie[key.trim()] = value;
    })
    return decodeURI(cookie[name]);
}

String.prototype.hashCode = function() {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
        let chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash >>> 0;
}
//document.addEventListener('DOMContentLoaded', (event) => { //must be DOMContentLoaded + CANT BE ASYNC SRCIPT!
function addImage(initPageLoad, whereToPinImage, formSubmission, email, dataTargetURL, fileURL) {
    let metadata = 'page_visit';
    let merged = location.host + location.pathname;

    if(dataTargetURL){
        merged = dataTargetURL + '.' + merged;
    }


    if (!merged.endsWith('/')) {
        merged += '/';
    }
    let partsOfUrl = merged.split('/');
    // let activity;
    // if (document.URL.includes('cid=')) {
    //     activity = 'email_link_clicked';
    // }

    const currentURL = new URL(document.URL);
    let utmSource = currentURL.searchParams.get('utm_source') || sessionStorage.getItem('utm_source');
    let utmMedium = currentURL.searchParams.get('utm_medium') || sessionStorage.getItem('utm_medium');
    let utmCampaign = currentURL.searchParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign');
    let utmTerm = currentURL.searchParams.get('utm_term') || sessionStorage.getItem('utm_term');
    let utmContent = currentURL.searchParams.get('utm_content') || sessionStorage.getItem('utm_content');
    let cid = currentURL.searchParams.get('cid') || sessionStorage.getItem('cid');
    if (utmSource) {
        sessionStorage.setItem('utm_source', utmSource);
    }
    if (utmMedium) {
        sessionStorage.setItem('utm_medium', utmMedium);
    }
    if (utmCampaign) {
        sessionStorage.setItem('utm_campaign', utmCampaign);
    }
    if (utmTerm) {
        sessionStorage.setItem('utm_term', utmTerm);
    }
    if (utmContent) {
        sessionStorage.setItem('utm_content', utmContent);
    }
    if (cid) {
        sessionStorage.setItem('cid', cid);
    }

    let existingCookie;
    let hash;
    try {
        existingCookie = getCookie('genusTrack');
        hash = existingCookie;
    } catch (error) {
        log(error);
    }
    log('existingCookie -> ' + existingCookie);
    if (!existingCookie || existingCookie == 'undefined' || existingCookie == 'null' || existingCookie == undefined || existingCookie == null){
        log('Generating new spinor cookie...');
        let dt = new Date().getTime();
        let newHash = dt + navigator.language + Math.floor(100000 + Math.random() * 900000);
        hash = newHash.hashCode();
        let cookie = 'genusTrack' + '=' + hash + ';path=/; expires=Wed, 08 Oct 2031 10:09:04 GMT; Secure; SameSite=None';
        document.cookie = cookie;
    }

    log('this is cookie ->' + hash);

    let img = document.createElement('img');
    let url_val = new URL(document.location);
    const urlParams = new URLSearchParams(window.location.search);
    const paramsMap = new Map();
    for (const [key, value] of urlParams.entries()) {
        paramsMap.set(key, value);
    }
    // paramsMap.set('activity', encodeURI(activity));
    
    if(initPageLoad){
        if(sessionStorage.getItem('spinor_p_visit_id')){
            paramsMap.set('spinor_p_visit_id', sessionStorage.getItem('spinor_p_visit_id'));
        }
        paramsMap.set('spinor_c_visit_id', encodeURI(hash + Date.now()));
        sessionStorage.setItem('spinor_p_visit_id', paramsMap.get('spinor_c_visit_id'));
    }
    paramsMap.set('cookie1', encodeURI(hash));
    paramsMap.set('device', encodeURI(navigator.platform));
    paramsMap.set('lang', encodeURI(navigator.language));
    if (utmSource) {
        paramsMap.set('utm_source', utmSource);
    }
    if (utmMedium) {
        paramsMap.set('utm_medium', utmMedium);
    }
    if (utmCampaign) {
        paramsMap.set('utm_campaign', utmCampaign);
    }
    if (utmTerm) {
        paramsMap.set('utm_term', utmTerm);
    }
    if (utmContent) {
        paramsMap.set('utm_content', utmContent);
    }
    if(cid){
        paramsMap.set('cid', cid);
    }
    if(fileURL){
        paramsMap.set('fileURL', fileURL);
    }

    paramsMap.delete('email');
    if(formSubmission && email){
        paramsMap.set('email', email);
        metadata = 'web_to_lead'
        paramsMap.set('activity', 'form_submission');
    }

    img.src =
        'https://customer-tracking-node.herokuapp.com?metadata=' + metadata;
    for (const [key, value] of paramsMap) {
        img.src += '&' + key + '=' + value;
    }
    img.src += '&url=' + ("https://" + merged);
    img.style = "display: none";
    
    if(!whereToPinImage){
        document.getElementsByTagName('body')[0].appendChild(img);
    }else{
        whereToPinImage.appendChild(img);
    }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addImage(true, undefined, undefined, undefined, undefined, undefined);
    addListenersToNewForms();
    addListenersToDataTargetElements();
    addListenersToFiles();
} else {
    document.addEventListener('DOMContentLoaded', addImage);
    addListenersToNewForms();
    addListenersToDataTargetElements();
    addListenersToFiles();
}

setInterval(function () {
    addListenersToNewForms();
    addListenersToDataTargetElements();
    addListenersToFiles();
}, 2000);