
document.documentElement.classList.add("js");
var KEY="gbi-draft";
var APP_TOKEN_KEY="gbi-application-token";
var STEPS=["About you","Experience & Skills","Motivation & Goals","Review","Payment"];
var S={step:0,d:{},err:{},fileObj:null,profile:null,hasSavedCv:false,direction:"forward"};
var draftKey=null;
function loadDraft(userId){draftKey=KEY+"-"+userId;S.d={};S.step=0;S.fileObj=null;S.hasSavedCv=false;S.err={};S.direction="forward";try{var r=localStorage.getItem(draftKey);if(r){var p=JSON.parse(r);if(p&&p.d){S.d=p.d;S.step=Math.min(p.step||0,2)}}}catch(e){}delete S.d.city;delete S.d.field;delete S.d.m4;if(!roleEligible(S.d.employment))delete S.d.role}
function save(){if(!draftKey)return;try{var d=Object.assign({},S.d);localStorage.setItem(draftKey,JSON.stringify({d:d,step:S.step}))}catch(e){}}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var app=document.getElementById("app");
var configPromise;
function getConfig(){if(!configPromise)configPromise=fetch("/api/config").then(async function(r){var d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load configuration.");return d});return configPromise}
function rememberSession(data){var expires=data.expires_at||Math.floor(Date.now()/1000)+(data.expires_in||3600);localStorage.setItem("gbi-auth-session",JSON.stringify({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:expires}))}
async function getSession(){
var raw=localStorage.getItem("gbi-auth-session");if(!raw)return null;var s;
try{s=JSON.parse(raw)}catch(e){localStorage.removeItem("gbi-auth-session");return null}
if(s.access_token&&s.expires_at>Date.now()/1000+60)return s;
if(!s.refresh_token){localStorage.removeItem("gbi-auth-session");return null}
var c=await getConfig(),r=await fetch(c.url+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"Content-Type":"application/json",apikey:c.anonKey},body:JSON.stringify({refresh_token:s.refresh_token})}),d=await r.json();
if(!r.ok||!d.access_token){localStorage.removeItem("gbi-auth-session");return null}rememberSession(d);return JSON.parse(localStorage.getItem("gbi-auth-session"))
}
async function apiRequest(path,options){
var s=await getSession();if(!s)throw new Error("Please sign in to continue.");
var headers=Object.assign({},options&&options.headers||{},{Authorization:"Bearer "+s.access_token});
var r=await fetch(path,Object.assign({},options||{},{headers:headers})),d=await r.json();
if(!r.ok)throw new Error(d.error||"The request could not be completed.");return d
}
async function applicationRequest(path,options){
var token=localStorage.getItem(APP_TOKEN_KEY);if(!token)throw new Error("Application access is unavailable.");
var headers=Object.assign({},options&&options.headers||{},{Authorization:"Application "+token});
var r=await fetch(path,Object.assign({},options||{},{headers:headers})),d=await r.json();
if(!r.ok)throw new Error(d.error||"The request could not be completed.");return d
}

function bridge(){var a="";for(var i=0;i<6;i++){var x=i*140+10;a+='<path d="M'+x+' 120 Q'+(x+60)+' 20 '+(x+120)+' 120" fill="none" stroke="#F6F8F8" stroke-opacity=".35" stroke-width="3"/>';a+='<circle class="lamp" cx="'+(x+60)+'" cy="'+(52+(i%2?6:0))+'" r="4" fill="#F2B134"/>'}
return '<svg class="bridge" viewBox="0 0 850 130" aria-hidden="true">'+a+'<rect x="0" y="118" width="850" height="12" fill="#F6F8F8" fill-opacity=".12"/></svg>'}

var HERO="/assets/images/amsterdam-hero.jpg";
function home(){app.innerHTML=`<section class="hero" style="--img:url(${HERO})"><div class="in hg"><div class="eye">Cohort 1 · 2027</div><h1>Connecting Emerging Talent with Global Opportunity.</h1><p>The Great Bridges Initiative connects continuing students and recent graduates with executives, founders and experts in AI, business, engineering and digital media. Cohort 1 is our first intake. Selected participants travel, stay and eat at no cost.</p><p class="when">Starts 3 April 2027 · 7 days · Amsterdam, Netherlands</p><div class="cd" id="cd" aria-label="Countdown to the event"></div><a class="btn" href="/apply">Apply now</a><a class="btn ghost" href="/faq">Read the FAQ</a></div></section>
<dl class="facts2"><div><dt>Funding</dt><dd>Fully funded for selected applicants</dd></div><div><dt>Dates</dt><dd>From 3 April 2027, 7 days</dd></div><div><dt>Location</dt><dd>Amsterdam, Netherlands</dd></div><div><dt>Eligibility</dt><dd>Students and graduates aged 18 to 40</dd></div><div><dt>Registration fee</dt><dd>$20 USD, non-refundable</dd></div></dl>
<div class="wrap wide">
<section class="sec two rv"><div><p class="eyebrow">01 · About</p><h2>A bridge between education and professional life</h2></div><div><p>The Great Bridges Initiative (GBI) is a professional training and networking programme. It brings continuing students and recent graduates together with experienced professionals, industry experts, business owners and company executives.</p><p>Participants gain practical insight into their fields and build relationships that can lead to internships, employment, mentorship and collaboration.</p><p class="mu"><b>Fields represented:</b> AI and technology · Business and entrepreneurship · Engineering · Content creation and digital media</p></div></section>
<section class="sec rv"><p class="eyebrow">02 · What is provided</p><h2>Support provided to selected participants</h2><div class="rows"><div><h3>Travel</h3><p>Return travel to Amsterdam, airport transfers and local transport.</p></div><div><h3>Accommodation</h3><p>High-standard lodging for the whole programme.</p></div><div><h3>Meals</h3><p>Daily meals, refreshments and networking dinners.</p></div><div><h3>Programme</h3><p>Training sessions, workshops, mentorship and a certificate of participation.</p></div><div><h3>Guided tour of Amsterdam</h3><p>A guided tour of the city for every successful candidate.</p></div><div><h3>Visa support</h3><p>Full visa support, including an official visa support letter.</p></div><div><h3>Global speakers</h3><p>The chance to meet and learn from speakers and experts from many countries.</p></div></div></section>
<section class="sec rv"><p class="eyebrow">03 · Eligibility</p><h2>Who can apply</h2><div class="rows"><div><h3>Status</h3><p>Continuing students and recent graduates.</p></div><div><h3>Education pathway</h3><p>Applicants from all fields of study and education pathways are welcome.</p></div><div><h3>Age</h3><p>Applicants must be aged 18 to 40 on the first day of the conference, 3 April 2027.</p></div></div></section>
<section class="sec rv"><p class="eyebrow">04 · How to apply</p><h2>Four steps</h2><ol class="steps5"><li><b>1</b><h3>Sign in</h3><p>Create or access your account with Google.</p></li><li><b>2</b><h3>Apply</h3><p>Complete your about, professional and statement sections from your dashboard.</p></li><li><b>3</b><h3>Review</h3><p>Check your details before submitting.</p></li><li><b>4</b><h3>Pay</h3><p>Pay the one-time $20 registration fee through Paystack to submit your application.</p></li></ol></section>
<section class="sec rv"><p class="eyebrow">05 · Registration fee</p><h2>One-time fee, merit-based selection</h2><p class="lead2">The registration fee of $20 USD is a one-time, non-refundable contribution to the administrative and logistical costs of organising the programme. It also helps ensure that applications come from candidates who are genuinely committed to taking part.</p><p class="lead2">Payment does not guarantee selection. All applications are assessed on merit. The fee is separate from the sponsorship, which covers the costs of selected participants.</p></section>
</div>
<section class="band"><h2>Applications for Cohort 1</h2><p>Continue with Google, complete your application from the dashboard, then pay the registration fee.</p><a class="btn" href="/apply">Continue with Google</a></section>`}
function legal(t,u,body){app.innerHTML='<div class="wrap legal"><p class="eyebrow">Legal</p><h2>'+t+'</h2><p class="mu">Last updated '+u+'. Draft pending review by legal counsel.</p>'+body+'</div>'}
function privacy(){legal("Privacy policy","18 November 2026",`<h2>1. Who we are</h2><p>The Great Bridges Initiative (“GBI”, “we”) organises a professional training and networking programme in Amsterdam, Netherlands. You can contact us at <a href="mailto:info@gbi.com">info@gbi.com</a>.</p><h2>2. Information we collect</h2><p>When you apply we collect your name, email address, phone number, date of birth, country of residence, academic and professional details, your CV and any other documents you upload, and your motivation statement. We also keep a record of your payment reference and application status. Card details are entered on our payment provider’s page and are never stored by GBI.</p><h2>3. How we use it</h2><p>We use your information to verify your eligibility, assess applications on merit, communicate with you about your application, and, for selected participants, organise travel, accommodation, visa support letters and event attendance, and issue certificates.</p><h2>4. Who sees it</h2><p>Your application is visible to authorised GBI staff and reviewers. We use service providers for hosting and database services, payment processing and email delivery. We do not share your personal information with participating companies without a legal basis and, where required, your consent.</p><h2>5. Retention</h2><p>We keep application data only as long as needed for the purposes above. Specific retention periods will be confirmed before applications open.</p><h2>6. Your rights</h2><p>Under the EU General Data Protection Regulation you may request access to your data, correction, deletion, restriction of processing, portability, and you may object to processing or withdraw consent. You may also complain to your data protection authority. To exercise these rights, email <a href="mailto:info@gbi.com">info@gbi.com</a>.</p>`)}
function terms(){legal("Terms and conditions","18 November 2026",`<h2>1. Eligibility</h2><p>The programme is open to continuing students and recent graduates aged 18 to 40 on 3 April 2027, the first day of the conference. We may ask for evidence of your age and status.</p><h2>2. Application and registration fee</h2><p>Every applicant pays a one-time registration fee of $20 USD, processed by Paystack. The fee is non-refundable, whether or not you are selected. Only applications with confirmed payment enter the selection process. Payment does not guarantee selection.</p><h2>3. Accuracy of information</h2><p>You confirm that the information you provide is accurate. Applications cannot be edited after submission. Inaccurate or misleading information may lead to disqualification.</p><h2>4. Selection</h2><p>Selection is based on merit, assessed by GBI reviewers. Only shortlisted applicants will be contacted.</p><h2>5. Sponsorship</h2><p>Selected participants receive the approved sponsorship package: return travel, accommodation, meals, local transport, programme access, a guided tour of Amsterdam, and visa support including an official visa support letter. Visa approval remains the decision of the relevant authorities. Sponsorship is available only to officially accepted applicants who follow the travel and participation instructions provided by the organisers.</p><h2>6. Conduct and certificates</h2><p>Participants are expected to attend the programme and behave respectfully towards speakers, staff and other participants. Certificates are issued to participants who meet the attendance requirements.</p><h2>7. Changes</h2><p>We may update programme details. If the programme is cancelled or postponed, we will notify applicants by email.</p><h2>8. Contact</h2><p>Questions about these terms: <a href="mailto:info@gbi.com">info@gbi.com</a>.</p>`)}

function bridge(){var a="";for(var i=0;i<6;i++){var x=i*140+10;a+='<path d="M'+x+' 120 Q'+(x+60)+' 20 '+(x+120)+' 120" fill="none" stroke="#F6F8F8" stroke-opacity=".35" stroke-width="3"/>';a+='<circle class="lamp" cx="'+(x+60)+'" cy="'+(52+(i%2?6:0))+'" r="4" fill="#F2B134"/>'}
return '<svg class="bridge" viewBox="0 0 850 130" aria-hidden="true">'+a+'<rect x="0" y="118" width="850" height="12" fill="#F6F8F8" fill-opacity=".12"/></svg>'}

var HERO="/assets/images/amsterdam-hero.jpg";
function home(){app.innerHTML=`
<section class="hero" style="--img:url(${HERO})">
  <div class="in hg">
    <div class="ht">
      <span class="badge">Cohort 1</span>
      <span class="badge">Fully funded for selected applicants</span>
      <h1>Connecting Emerging Talent with Global Opportunity.</h1>
      <p>The Great Bridges Initiative connects continuing students and recent graduates with executives, founders and experts in AI, business, engineering and digital media. Cohort 1 is our first intake. Selected participants travel, stay and eat at no cost.</p>
      <p class="when">Starts 3 April 2027 · 7 days · Amsterdam, Netherlands</p>
      <div class="cd" id="cd" aria-label="Countdown to the event"></div>
      <a class="btn" href="/apply">Apply now</a>
      <a class="btn ghost" href="/faq">Read the FAQ</a>
    </div>
  </div>
</section>
<div class="wrap landing-wrap">
  <div class="landing-fields" aria-label="Fields represented">
    <p class="landing-kicker">Fields represented</p>
    <div class="chips">
      <span>AI and technology</span>
      <span>Business and entrepreneurship</span>
      <span>Engineering</span>
      <span>Content creation and digital media</span>
      <span>Health and life sciences</span>
      <span>Education and research</span>
      <span>Finance and economics</span>
      <span>Public policy and social impact</span>
      <span>Environment and sustainability</span>
      <span>Design and creative industries</span>
      <span>Law and governance</span>
      <span>Agriculture and food systems</span>
    </div>
  </div>
  <section class="landing-section landing-benefits" aria-labelledby="landing-benefits-title">
    <header class="landing-section-heading">
      <p class="landing-kicker">The programme</p>
      <h2 id="landing-benefits-title">What selected participants receive</h2>
    </header>
    <div class="grid landing-grid landing-benefit-grid">
      <div><span class="landing-card-number" aria-hidden="true">01</span><h3>Travel</h3><p>Return travel to Amsterdam, airport transfers and local transport.</p></div>
      <div><span class="landing-card-number" aria-hidden="true">02</span><h3>Accommodation</h3><p>High-standard lodging for the whole programme.</p></div>
      <div><span class="landing-card-number" aria-hidden="true">03</span><h3>Meals</h3><p>Daily meals, refreshments and networking dinners.</p></div>
      <div><span class="landing-card-number" aria-hidden="true">04</span><h3>Programme</h3><p>Training sessions, workshops, mentorship and a certificate of participation.</p></div>
      <div><span class="landing-card-number" aria-hidden="true">05</span><h3>Guided tour of Amsterdam</h3><p>A guided tour of the city for every successful candidate.</p></div>
      <div><span class="landing-card-number" aria-hidden="true">06</span><h3>Full visa support</h3><p>Complete visa support, including an official visa support letter.</p></div>
      <div><span class="landing-card-number" aria-hidden="true">07</span><h3>Global speakers</h3><p>Meet and learn from speakers and experts from many countries.</p></div>
    </div>
  </section>
  <section class="landing-section landing-eligibility" aria-labelledby="landing-eligibility-title">
    <header class="landing-section-heading">
      <p class="landing-kicker">Eligibility</p>
      <h2 id="landing-eligibility-title">Who can apply</h2>
    </header>
    <div class="grid landing-grid landing-eligibility-grid">
      <div><span class="landing-card-number" aria-hidden="true">01</span><h3>Students and graduates</h3><p>Continuing students and recent graduates.</p></div>
      <div><span class="landing-card-number" aria-hidden="true">02</span><h3>All education pathways</h3><p>Students and recent graduates from every field of study and education pathway are welcome.</p></div>
      <div><span class="landing-card-number" aria-hidden="true">03</span><h3>Aged 18 to 40</h3><p>You must be within this age range on the first day of the conference, 3 April 2027.</p></div>
    </div>
  </section>
  <section class="landing-section landing-process" aria-labelledby="landing-process-title">
    <header class="landing-section-heading">
      <p class="landing-kicker">Application process</p>
      <h2 id="landing-process-title">How applying works</h2>
    </header>
    <div class="grid landing-grid landing-process-grid">
      <div><span class="num">1</span><h3>Sign in</h3><p>Create or access your account using Google.</p></div>
      <div><span class="num">2</span><h3>Complete</h3><p>Complete About you, Experience &amp; Skills, and Motivation &amp; Goals.</p></div>
      <div><span class="num">3</span><h3>Review</h3><p>Review your application before submitting.</p></div>
      <div><span class="num">4</span><h3>Pay</h3><p>Pay the $20 registration fee to submit your application for review.</p></div>
    </div>
  </section>
  <aside class="landing-fee">
    <div>
      <p class="landing-kicker">Application fee</p>
      <h2>The $20 application fee</h2>
      <p>The $20 fee is non-refundable, supports administration and logistics, and does not guarantee selection. It is separate from the sponsorship, which covers your travel and stay if you are accepted.</p>
    </div>
    <a class="btn landing-fee-action" href="/apply">Start your application</a>
  </aside>
</div>`}

function bridge(){var a="",w="";for(var i=0;i<6;i++){var x=i*140+10;a+='<path d="M'+x+' 120 Q'+(x+60)+' 16 '+(x+120)+' 120" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>';for(var k=1;k<6;k++){var t=k/6,px=x+120*t,py=120-2*104*t*(1-t)*1;a+='<circle class="lamp" cx="'+px.toFixed(1)+'" cy="'+(py-0).toFixed(1)+'" r="2.6" fill="#F2B134"/>'}w+='<path d="M'+x+' 124 Q'+(x+60)+' 228 '+(x+120)+' 124" fill="none" stroke="#F2B134" stroke-opacity=".18" stroke-width="3"/>'}
return '<svg class="bridge" viewBox="0 0 850 190" aria-hidden="true" style="margin-top:44px">'+a+'<rect x="0" y="118" width="850" height="6" fill="#fff" fill-opacity=".35"/>'+w+'<rect x="0" y="124" width="850" height="66" fill="#0B2F3D" fill-opacity=".55"/></svg>'}
function startCd(){var el=document.getElementById("cd");if(!el)return;var t=new Date("2027-04-03T00:00:00").getTime();function u(){var d=Math.max(0,t-Date.now()),days=Math.floor(d/864e5),h=Math.floor(d%864e5/36e5),m=Math.floor(d%36e5/6e4),sc=Math.floor(d%6e4/1e3);el.innerHTML="<div><b>"+days+"</b>days</div><div><b>"+h+"</b>hours</div><div><b>"+m+"</b>minutes</div><div><b>"+sc+"</b>seconds</div>"}u();clearInterval(window._cd);window._cd=setInterval(u,1000)}
function faq(){app.innerHTML='<div class="wrap"><h2>Frequently asked questions</h2>'+[
["Who can apply?","Continuing students and recent graduates from any field of study or education pathway, aged 18 to 40 on 3 April 2027."],["Is this the first edition?","Yes. This is Cohort 1, the first intake of the Great Bridges Initiative."],["Do you help with visas?","Yes. Successful candidates receive full visa support, including an official visa support letter."],["What else is included?","A guided tour of Amsterdam, and the chance to meet and learn from global speakers and experts from many countries."],
["Why is there a fee?","The $20 fee covers application processing and logistics, and discourages spam and duplicate applications. It is non-refundable whether or not you are selected."],
["Does paying guarantee a place?","No. Every paid application is assessed on merit."],
["When will applicants be contacted?","Only shortlisted applicants will be contacted about the outcome of their application."],
["Can I edit my application after submitting?","No. Review everything on the review step first. You can read your submission any time from your dashboard."],
["What does fully funded cover?","Travel, accommodation, meals, local transport and programme costs, per the approved sponsorship package you receive if accepted."],
["How is my data used?","Your information is used only for selection and event logistics, handled under GDPR, and not shared with companies without your consent."]
].map(function(q){return"<div class='fq'><button class='fqb' aria-expanded='false'>"+q[0]+"<i class='chev'></i></button><div class='fqp'><div><p>"+q[1]+"</p></div></div></div>"}).join("")+'<p style="margin-top:28px">Still have a question? Email <a href="mailto:info@gbi.com"><b>info@gbi.com</b></a>.</p></div>';[].forEach.call(document.querySelectorAll(".fqb"),function(b){b.onclick=function(){var o=b.parentNode.classList.toggle("open");b.setAttribute("aria-expanded",o)}})}

// ISO 3166-1 alpha-2 regions, plus XK for Kosovo.
var COUNTRY_CODES="AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW".split(" ");
var COUNTRY_NAMES=new Intl.DisplayNames(["en"],{type:"region"});
var COUNTRIES=COUNTRY_CODES.map(function(code){return code==="XK"?"Kosovo":COUNTRY_NAMES.of(code)}).sort(function(a,b){return a.localeCompare(b,"en")});
var COUNTRY_CODE_BY_NAME=Object.create(null);
COUNTRY_CODES.forEach(function(code){COUNTRY_CODE_BY_NAME[code==="XK"?"Kosovo":COUNTRY_NAMES.of(code)]=code});
var COUNTRY_DIAL_CODES={
AD:"376",AE:"971",AF:"93",AG:"1",AI:"1",AL:"355",AM:"374",AO:"244",AQ:"672",AR:"54",AS:"1",AT:"43",AU:"61",AW:"297",AX:"358",AZ:"994",
BA:"387",BB:"1",BD:"880",BE:"32",BF:"226",BG:"359",BH:"973",BI:"257",BJ:"229",BL:"590",BM:"1",BN:"673",BO:"591",BQ:"599",BR:"55",BS:"1",BT:"975",BV:"47",BW:"267",BY:"375",BZ:"501",
CA:"1",CC:"61",CD:"243",CF:"236",CG:"242",CH:"41",CI:"225",CK:"682",CL:"56",CM:"237",CN:"86",CO:"57",CR:"506",CU:"53",CV:"238",CW:"599",CX:"61",CY:"357",CZ:"420",
DE:"49",DJ:"253",DK:"45",DM:"1",DO:"1",DZ:"213",EC:"593",EE:"372",EG:"20",EH:"212",ER:"291",ES:"34",ET:"251",
FI:"358",FJ:"679",FK:"500",FM:"691",FO:"298",FR:"33",GA:"241",GB:"44",GD:"1",GE:"995",GF:"594",GG:"44",GH:"233",GI:"350",GL:"299",GM:"220",GN:"224",GP:"590",GQ:"240",GR:"30",GS:"500",GT:"502",GU:"1",GW:"245",GY:"592",
HK:"852",HM:"672",HN:"504",HR:"385",HT:"509",HU:"36",ID:"62",IE:"353",IL:"972",IM:"44",IN:"91",IO:"246",IQ:"964",IR:"98",IS:"354",IT:"39",JE:"44",JM:"1",JO:"962",JP:"81",
KE:"254",KG:"996",KH:"855",KI:"686",KM:"269",KN:"1",KP:"850",KR:"82",KW:"965",KY:"1",KZ:"7",LA:"856",LB:"961",LC:"1",LI:"423",LK:"94",LR:"231",LS:"266",LT:"370",LU:"352",LV:"371",LY:"218",
MA:"212",MC:"377",MD:"373",ME:"382",MF:"590",MG:"261",MH:"692",MK:"389",ML:"223",MM:"95",MN:"976",MO:"853",MP:"1",MQ:"596",MR:"222",MS:"1",MT:"356",MU:"230",MV:"960",MW:"265",MX:"52",MY:"60",MZ:"258",
NA:"264",NC:"687",NE:"227",NF:"672",NG:"234",NI:"505",NL:"31",NO:"47",NP:"977",NR:"674",NU:"683",NZ:"64",OM:"968",
PA:"507",PE:"51",PF:"689",PG:"675",PH:"63",PK:"92",PL:"48",PM:"508",PN:"64",PR:"1",PS:"970",PT:"351",PW:"680",PY:"595",QA:"974",RE:"262",RO:"40",RS:"381",RU:"7",RW:"250",
SA:"966",SB:"677",SC:"248",SD:"249",SE:"46",SG:"65",SH:"290",SI:"386",SJ:"47",SK:"421",SL:"232",SM:"378",SN:"221",SO:"252",SR:"597",SS:"211",ST:"239",SV:"503",SX:"1",SY:"963",SZ:"268",
TC:"1",TD:"235",TF:"262",TG:"228",TH:"66",TJ:"992",TK:"690",TL:"670",TM:"993",TN:"216",TO:"676",TR:"90",TT:"1",TV:"688",TW:"886",TZ:"255",
UA:"380",UG:"256",UM:"1",US:"1",UY:"598",UZ:"998",VA:"39",VC:"1",VE:"58",VG:"1",VI:"1",VN:"84",VU:"678",WF:"681",WS:"685",XK:"383",YE:"967",YT:"262",ZA:"27",ZM:"260",ZW:"263"
};
function phoneDialCode(country){var code=COUNTRY_CODE_BY_NAME[country];return code?COUNTRY_DIAL_CODES[code]||"":""}
function localPhoneNumber(value,country){var number=String(value||"").trim(),dial=phoneDialCode(country),prefix=dial?"+"+dial:"";return prefix&&number.indexOf(prefix)===0?number.slice(prefix.length).trim():number}
function internationalPhoneNumber(value,country){var number=String(value||"").trim(),dial=phoneDialCode(country);if(!number||number.charAt(0)==="+")return number;return dial?"+"+dial+" "+number:number}
function roleEligible(employment){return employment=="Employed"||employment=="Self-employed"}

var F={
0:[["first_name","First name","text"],["last_name","Last name","text"],["country","Country or territory of residence","country"],["phone","Phone number","tel"],["dob","Date of birth","date"],["institution","Current or last institution","text"],["status","Academic status","select:Continuing student|Recent graduate"],["education","Education, training or qualification","select:Secondary school certificate or equivalent|Certificate|Advanced certificate|Diploma|Advanced diploma|Associate degree|Bachelor's degree|Postgraduate certificate|Postgraduate diploma|Master's degree|Doctoral degree (PhD)|Professional qualification|Trade or vocational qualification|Currently pursuing a qualification|No formal qualification yet|Other / not listed"],["course","Course or field of study","text"],["gradyear","Graduation year (expected or actual)","number"]],
1:[["employment","Current employment status","select:Student|Unemployed|Employed|Self-employed"],["role","Current role","text:opt"],["experience","Previous work experience","textarea:opt"],["skills","Professional skills (list one per line)","textarea"],["linkedin","LinkedIn profile URL","url:opt"],["portfolio","Portfolio or website URL","url:opt"],["cv","CV or résumé (PDF, max 5 MB)","file"]],
2:[["m1","Why do you want to attend GBI?","textarea"],["m2","What do you expect to gain?","textarea"],["m3","Your professional interests and career goals","textarea"],["m5","How could GBI influence your professional development?","textarea"]]};

function field(f){var id=f[0],t=f[2],opt=/:opt$/.test(t),base=t.replace(/:opt$/,""),v=S.d[id]||"",lab="<label for='"+id+"'>"+f[1]+(opt?" <small>(optional)</small>":"<span class='rq' aria-hidden='true'>*</span>")+"</label>",h;
if(base=="country"){var options=COUNTRIES.map(function(o){return"<option value='"+esc(o)+"'"+(o==v?" selected":"")+">"+esc(o)+"</option>"}).join("");if(v&&COUNTRIES.indexOf(v)<0)options="<option value='"+esc(v)+"' selected>"+esc(v)+"</option>"+options;h="<select id='"+id+"'><option value=''>Choose a country or territory…</option>"+options+"</select>"}
else if(id=="phone"){var dial=phoneDialCode(S.d.country),phoneCountryCode=COUNTRY_CODE_BY_NAME[S.d.country]||"",phonePrefix=dial?"+"+dial:"Choose country";h="<div class='phone-control'><span class='phone-prefix' id='phone-prefix' aria-label='"+esc(S.d.country&&dial?S.d.country+" calling code +"+dial:"Choose a country to see the calling code")+"'><span class='phone-flag fi fi-"+phoneCountryCode.toLowerCase()+"' aria-hidden='true'></span><span class='phone-dial-code'>"+esc(phonePrefix)+"</span></span><input id='phone' type='tel' inputmode='tel' autocomplete='tel-national' value='"+esc(localPhoneNumber(v,S.d.country))+"' placeholder='"+(dial?"Enter phone number":"Select a country first")+"'"+(dial?"":" disabled")+"></div>"}
else if(base.indexOf("select:")==0){var choices=base.slice(7).split("|");if(v&&choices.indexOf(v)<0)choices.unshift(v);h="<select id='"+id+"'><option value=''>Choose…</option>"+choices.map(function(o){return"<option value='"+esc(o)+"'"+(o==v?" selected":"")+">"+esc(o)+"</option>"}).join("")+"</select>"}
else if(base=="textarea"){h="<textarea id='"+id+"'>"+esc(v)+"</textarea>"}
else if(base=="file"){h="<div class='upload-zone' id='drop-"+id+"'><input class='upload-file-input' id='"+id+"' type='file' accept='application/pdf,.pdf' aria-label='Choose a PDF résumé'><span class='upload-icon' aria-hidden='true'>↑</span><strong>Drag and drop your résumé here</strong><span>or <span class='upload-browse'>Browse files</span></span><small>PDF only · Maximum 5 MB</small><span class='upload-file-name' id='"+id+"-file-name' aria-live='polite'>"+(S.fileObj?"Selected: "+esc(S.fileObj.name):S.hasSavedCv?"Previously uploaded: "+esc(v):v?"Choose this file again: "+esc(v):"No file selected")+"</span></div>"}
else{h="<input id='"+id+"' type='"+base+"' value='"+(base=="password"?"":esc(v))+"' autocomplete='"+(id=="password"?"new-password":id=="first_name"?"given-name":id=="last_name"?"family-name":"on")+"'>"}
return"<div"+(id=="role"?" id='current-role-field'":"")+" class='fl"+(/textarea|file|url/.test(base)||id=="experience"?" full":"")+"'"+(id=="role"&&!roleEligible(S.d.employment)?" hidden":"")+">"+lab+h+(S.err[id]?"<div id='err-"+id+"' class='err' role='alert'>"+S.err[id]+"</div>":"")+"</div>"}

function collect(){(F[S.step]||[]).forEach(function(f){var el=document.getElementById(f[0]);if(!el)return;if(f[2]=="file"){var fl=el.files&&el.files[0];if(fl){S.fileObj={file:fl,name:fl.name,type:fl.type,size:fl.size};S.d[f[0]]=fl.name}}else if(f[0]!="password"||el.value)S.d[f[0]]=el.value.trim()})}
function validate(){S.err={};(F[S.step]||[]).forEach(function(f){var v=S.d[f[0]]||"",opt=/:opt$/.test(f[2]);
if(!opt&&!v){S.err[f[0]]="This field is required."}
else if(f[0]=="dob"){var q=v.split("-"),b=new Date(+q[0],+q[1]-1,+q[2]),e=new Date(2027,3,3),ag=e.getFullYear()-b.getFullYear();if(isNaN(b))S.err.dob="Enter a valid date.";else{if(e<new Date(e.getFullYear(),b.getMonth(),b.getDate()))ag--;if(ag<18||ag>40)S.err.dob="Applicants must be aged 18 to 40 on 3 April 2027."}}
else if(f[2].indexOf("url")==0&&v&&!/^https?:\/\//.test(v))S.err[f[0]]="Start the address with https://"
else if(f[0]=="cv"&&!S.fileObj&&!S.hasSavedCv)S.err.cv="Choose your PDF résumé to upload.";
else if(f[0]=="cv"&&S.fileObj){if(S.fileObj.type!="application/pdf"&&!/\.pdf$/i.test(S.fileObj.name))S.err.cv="Upload a PDF file.";else if(S.fileObj.size>5242880)S.err.cv="File is larger than 5 MB. Compress it and try again."}
else if(f[0]=="m1"&&v.length<40)S.err[f[0]]="Write at least a couple of sentences."});
return !Object.keys(S.err).length}

function head(){return'<p class="stp">Step '+(S.step+1)+' of 5</p><h2>'+STEPS[S.step]+'</h2>'}
function buttonLoading(button,label){button.disabled=true;button.setAttribute("aria-busy","true");button.setAttribute("aria-live","polite");button.innerHTML="<span class='application-spinner' aria-hidden='true'></span><span>"+label+"</span>"}
function loadingPause(){return new Promise(function(resolve){setTimeout(resolve,180)})}

function renderGoogleAuth(message){
app.innerHTML='<div class="wrap signup-wrap"><div class="card"><h2>Continue with Google</h2><p>Create your applicant account or sign in securely with Google. Your Google email and name will be used for your account.</p>'+(message?'<div class="notice">'+esc(message)+'</div>':'')+'<button class="google-auth-btn" id="google-auth"><span class="google-mark" aria-hidden="true">G</span>Continue with Google</button><p class="mu google-note">You can complete your phone number and application details after signing in.</p></div></div>';
document.getElementById("google-auth").onclick=async function(){var button=this;button.disabled=true;button.textContent="Connecting to Google…";try{await beginGoogleSignIn("/dashboard")}catch(error){sessionStorage.removeItem("gbi-oauth-code-verifier");sessionStorage.removeItem("gbi-oauth-return-to");renderGoogleAuth(error.message)}};
}
async function beginGoogleSignIn(returnTo){
var c=await getConfig(),url=new URL(c.url+"/auth/v1/authorize"),random=new Uint8Array(32);
crypto.getRandomValues(random);
var verifier=Array.prototype.map.call(random,function(byte){return byte.toString(16).padStart(2,"0")}).join("");
var digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier));
var challenge=btoa(Array.prototype.map.call(new Uint8Array(digest),function(byte){return String.fromCharCode(byte)}).join("")).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
sessionStorage.setItem("gbi-oauth-code-verifier",verifier);
sessionStorage.setItem("gbi-oauth-return-to",returnTo==="/admin"?"/admin":"/dashboard");
url.searchParams.set("provider","google");
url.searchParams.set("redirect_to",location.origin+"/auth/callback");
url.searchParams.set("code_challenge",challenge);
url.searchParams.set("code_challenge_method","S256");
location.assign(url.toString())
}
function renderSignup(message){renderGoogleAuth(message)}
async function saveApplication(){
var form=new FormData(),details=Object.assign({},S.d),profile=S.profile||{};
delete details.city;
delete details.field;
delete details.m4;
if(!roleEligible(details.employment))delete details.role;
details.first_name=details.first_name||profile.first_name||"";details.last_name=details.last_name||profile.last_name||"";
details.name=[details.first_name,details.last_name].filter(Boolean).join(" ");
details.email=profile.email||"";details.phone=internationalPhoneNumber(S.d.phone||profile.phone,S.d.country);
form.append("details",JSON.stringify(details));
if(S.fileObj&&S.fileObj.file)form.append("cv",S.fileObj.file);
var result=await apiRequest("/api/applications",{method:"POST",body:form});
S.hasSavedCv=true;
return result
}
function bindUpload(){
var zone=document.getElementById("drop-cv"),input=document.getElementById("cv"),name=document.getElementById("cv-file-name");
if(!zone||!input||!name)return;
function chooseFile(file){
if(!file)return;
var error=document.getElementById("err-cv");
if(file.type!=="application/pdf"&&!/\.pdf$/i.test(file.name)){S.fileObj=null;delete S.d.cv;zone.classList.remove("has-file");S.err.cv="Upload a PDF file.";name.textContent=S.err.cv;if(error)error.textContent=S.err.cv;return}
if(file.size>5242880){S.fileObj=null;delete S.d.cv;zone.classList.remove("has-file");S.err.cv="File is larger than 5 MB. Compress it and try again.";name.textContent=S.err.cv;if(error)error.textContent=S.err.cv;return}
S.err.cv="";S.fileObj={file:file,name:file.name,type:file.type,size:file.size};S.d.cv=file.name;
name.textContent=file.name;zone.classList.add("has-file");if(error)error.textContent=""
}
input.addEventListener("change",function(){chooseFile(input.files&&input.files[0])});
zone.addEventListener("dragover",function(event){event.preventDefault();zone.classList.add("drag-over")});
zone.addEventListener("dragleave",function(event){if(!zone.contains(event.relatedTarget))zone.classList.remove("drag-over")});
zone.addEventListener("drop",function(event){
event.preventDefault();zone.classList.remove("drag-over");
var file=event.dataTransfer&&event.dataTransfer.files[0];if(!file)return;
var transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files;chooseFile(file)
})
}
function bindPhoneCountry(){
var country=document.getElementById("country"),phone=document.getElementById("phone"),prefix=document.getElementById("phone-prefix");
if(!country||!phone||!prefix)return;
function update(){var name=country.value,code=COUNTRY_CODE_BY_NAME[name]||"",dial=phoneDialCode(name);prefix.innerHTML="<span class='phone-flag fi fi-"+code.toLowerCase()+"' aria-hidden='true'></span><span class='phone-dial-code'>"+(dial?"+"+dial:"Choose country")+"</span>";prefix.setAttribute("aria-label",name&&dial?name+" calling code +"+dial:"Choose a country to see the calling code");phone.disabled=!dial;phone.placeholder=dial?"Enter local phone number":"Select a country first"}
country.addEventListener("change",update);update()
}
function bindCurrentRole(){
var employment=document.getElementById("employment"),field=document.getElementById("current-role-field"),role=document.getElementById("role");
if(!employment||!field||!role)return;
function update(){var visible=roleEligible(employment.value);field.hidden=!visible;if(!visible){role.value="";delete S.d.role}}
employment.addEventListener("change",update);update()
}
function reviewCard(title,rows){
return"<section class='review-card'><h3>"+esc(title)+"</h3><div class='review-items'>"+rows.map(function(row){var value=String(row[1]||"").trim();return"<div class='review-item"+(row[2]?" full":"")+"'><span class='review-item-label'>"+esc(row[0])+"</span><p class='review-item-value"+(value?"":" empty")+"'>"+(value?esc(value).replace(/\r?\n/g,"<br>"):"Not provided")+"</p></div>"}).join("")+"</div></section>"
}
function renderApplicationForm(){
var profile=S.profile||{},directionClass=S.direction==="back"?"application-step-back":"application-step-forward",h='<div class="wrap wide"><div class="apply"><aside class="side"><h3>Your application</h3><ol>'+STEPS.map(function(s,i){return"<li class='"+(i<S.step?"done":i==S.step?"cur":"")+"'><span>"+(i<S.step?"✓":i+1)+"</span>"+s+"</li>"}).join("")+'</ol><p class="sd">One-time $20 registration fee. Non-refundable.</p></aside><div class="card '+directionClass+'">'+head();
if(S.step<3){h+="<div class='fields'>"+F[S.step].map(field).join("")+"</div>"}
else if(S.step==3){
var contact=[["First name",S.d.first_name||profile.first_name],["Last name",S.d.last_name||profile.last_name],["Email address",profile.email],["Phone number",internationalPhoneNumber(S.d.phone||profile.phone,S.d.country)]],groups=[
["About you",F[0].filter(function(f){return f[0]!="phone"&&f[0]!="first_name"&&f[0]!="last_name"}).map(function(f){return[f[1],S.d[f[0]],f[2]=="textarea"]})],
[STEPS[1],F[1].filter(function(f){return f[0]!="role"||roleEligible(S.d.employment)}).map(function(f){return[f[1],S.d[f[0]],f[2]=="textarea"||f[0]=="cv"]})],
[STEPS[2],F[2].map(function(f){return[f[1],S.d[f[0]],true]})]
];
h+="<p class='review-intro'>Please make sure the information you entered is accurate; it will be used later for identification and to contact you. You can go back to make changes.</p><p class='notice'>Only shortlisted applicants will be contacted about the outcome of their application. Applicants who are not shortlisted will not receive an individual notification.</p><div class='review-stack'>"+reviewCard("Account details",contact)+groups.map(function(group){return reviewCard(group[0],group[1])}).join("")+"</div>"+
"<section class='review-confirmations'><h3>Confirmations</h3><label class='chk'><input type='checkbox' id='c1'"+(S.d.c1?" checked":"")+"> I confirm the information I provided is accurate.</label>"+
"<label class='chk'><input type='checkbox' id='c2'"+(S.d.c2?" checked":"")+"> I understand the $20 fee is non-refundable and that payment does not guarantee selection.</label>"+(S.err.c?"<div class='err' role='alert'>"+S.err.c+"</div>":"")+"</section>"
}
else{h+="<div class='sum'><div><span>GBI registration fee</span><span>$20.00</span></div><div class='tot'><span>Total due</span><span>$20.00 USD</span></div></div><div class='notice'>One-time and non-refundable. Continue to Paystack's secure hosted checkout. Your email is already verified, so your application will enter review after payment is confirmed.</div><p>Paystack will show the payment methods available for your location and account. Card details are never entered on this site.</p>"+(S.err.pay?"<div class='err' role='alert'>"+esc(S.err.pay)+"</div>":"")}
h+='<div class="actions">'+(S.step>0?'<button class="btn sec" id="back">Back</button>':'<span></span>')+'<button class="btn" id="next">'+(S.step==3?"Continue to payment":S.step==4?"Pay $20.00 with Paystack":"Save and continue")+'</button></div></div></div></div>';
app.innerHTML=h;bindUpload();bindPhoneCountry();bindCurrentRole();
document.getElementById("back")&&(document.getElementById("back").onclick=async function(){if(S.step==3){S.d.c1=document.getElementById("c1").checked;S.d.c2=document.getElementById("c2").checked}collect();buttonLoading(this,"Saving…");save();await loadingPause();S.step--;S.direction="back";S.err={};save();renderApplicationForm();window.scrollTo(0,0)});
document.getElementById("next").onclick=async function(){
var bt=document.getElementById("next");
if(S.step<3){collect();if(!validate()){renderApplicationForm();return}buttonLoading(bt,"Saving…");save();await loadingPause()}
else if(S.step==3){
S.d.c1=document.getElementById("c1").checked;S.d.c2=document.getElementById("c2").checked;if(!S.d.c1||!S.d.c2){S.err={c:"Tick both boxes to continue."};renderApplicationForm();return}
buttonLoading(bt,"Saving application…");
try{await saveApplication()}catch(e){S.err={c:e.message};renderApplicationForm();return}
}
else{
buttonLoading(bt,"Connecting to Paystack…");
try{var payment=await apiRequest("/api/payments/initialize",{method:"POST"});window.location.assign(payment.authorizationUrl)}catch(e){S.err.pay=e.message;renderApplicationForm()}
return
}
S.err={};S.step++;S.direction="forward";save();renderApplicationForm();window.scrollTo(0,0)}}
async function apply(){
try{
var session=await getSession();
if(!session){renderSignup();return}
var result=await apiRequest("/api/applications"),profile=result.profile||{};
S.profile=profile;loadDraft(profile.id);
if(result.application){
if(!["draft","awaiting_payment"].includes(result.application.status)){dash();return}
S.d=Object.assign({},result.application.details||{},S.d);delete S.d.city;delete S.d.field;delete S.d.m4;if(!roleEligible(S.d.employment))delete S.d.role;
S.hasSavedCv=!!(result.application.details&&result.application.details.cv);
}
S.d.first_name=S.d.first_name||profile.first_name||"";S.d.last_name=S.d.last_name||profile.last_name||"";
renderApplicationForm();
}catch(error){app.innerHTML='<div class="wrap"><div class="card"><h2>Could not open the application</h2><p class="err" role="alert">'+esc(error.message)+'</p><div class="application-error-actions"><a class="btn application-error-action" href="/dashboard">Go to dashboard</a></div></div></div>'}
}

function dash(){
app.innerHTML='<div class="wrap"><div class="card"><p role="status">Loading your application…</p></div></div>';
getSession().then(function(session){
if(!session){
var token=localStorage.getItem(APP_TOKEN_KEY);
if(token){
applicationRequest("/api/applications").then(function(result){
var a=result.application;if(!a)throw new Error("No application was found.");
if(a.status==="awaiting_email_verification"){renderPostPaymentSignup(a);return}
if(a.status==="awaiting_payment"){renderPendingPayment(a);return}
renderLogin("Your application is already linked to an account. Sign in to continue.")
}).catch(function(e){if(e.message.indexOf("expired")>=0||e.message.indexOf("not found")>=0)localStorage.removeItem(APP_TOKEN_KEY);renderLogin(e.message)})
return
}
renderLogin();return
}
apiRequest("/api/applications").then(function(result){
S.profile=result.profile||{};
var a=result.application,first=S.profile.first_name||"";
if(!a){app.innerHTML='<div class="wrap"><div class="card"><h2>Welcome, '+esc(first||"applicant")+'</h2><p>Your account is ready. Start your application whenever you’re ready.</p><div class="actions"><a class="btn" href="/apply">Apply now</a><button class="btn sec" id="signout">Sign out</button></div></div></div>';document.getElementById("signout").onclick=signOut;return}
var d=a.details||{},payment=(a.payments||[]).slice(-1)[0],paid=payment&&payment.status==="paid",status=a.status.replace(/_/g," "),statusClass=paid?"ok":a.status==="awaiting_payment"?"pending":"";
var paymentMessage=paid?'<span class="payment-message success">Payment confirmed · '+esc(payment.paystack_reference)+'</span>':'<span class="payment-message pending">Payment not confirmed</span>';
var card='<div class="wrap"><h2>Welcome, '+esc(first||"applicant")+'</h2><div class="card"><div class="ref">'+esc(a.reference)+'</div><p>'+paymentMessage+' · <span class="pill '+statusClass+'">'+esc(status)+'</span></p>';
if(!paid&&a.status==="awaiting_payment")card+='<p>Your application is saved. Complete payment to submit it for review.</p><div class="dashboard-actions"><button class="btn" id="pay-retry">Continue to payment</button><a class="btn edit-app" href="/apply"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg><span>Edit application</span></a></div>';
card+='<h3>Application status</h3><ul class="tl">'+(paid?'<li class="done">Payment received</li><li class="done">Application submitted</li>':'<li class="now pending">Awaiting payment</li>')+'<li class="'+(a.status==="under_review"?"now":"")+'">Under review</li><li>Shortlisted</li><li>Decision</li></ul></div><div class="card" style="margin-top:18px"><h3>Event</h3><p>Cohort 1 · 3 April 2027 · 7 days · Amsterdam, Netherlands</p><p>Payment does not guarantee selection.</p></div><div class="card" style="margin-top:18px"><h3>Your application</h3><dl><dt>First name</dt><dd>'+esc(d.first_name||S.profile.first_name||"–")+'</dd><dt>Last name</dt><dd>'+esc(d.last_name||S.profile.last_name||"–")+'</dd><dt>Email</dt><dd>'+esc(S.profile.email||"–")+'</dd><dt>Phone</dt><dd>'+esc(d.phone||S.profile.phone||"–")+'</dd>'+[].concat(F[0],F[1],F[2]).filter(function(f){return f[0]!="phone"&&f[0]!="first_name"&&f[0]!="last_name"&&(f[0]!="role"||roleEligible(d.employment))}).map(function(f){return"<dt>"+f[1]+"</dt><dd>"+esc(d[f[0]]||"–")+"</dd>"}).join("")+'</dl><button class="btn sec" id="signout">Sign out</button></div></div>';
app.innerHTML=card;document.getElementById("signout").onclick=signOut;
var retry=document.getElementById("pay-retry");if(retry)retry.onclick=async function(){retry.disabled=true;retry.textContent="Connecting to Paystack…";try{var p=await apiRequest("/api/payments/initialize",{method:"POST"});location.assign(p.authorizationUrl)}catch(e){S.err.payment=e.message;dash()}};
}).catch(function(e){app.innerHTML='<div class="wrap"><div class="card"><h2>Could not load your application</h2><p class="err" role="alert">'+esc(e.message)+'</p><button class="btn sec" id="signout">Sign out</button></div></div>';document.getElementById("signout").onclick=signOut})
}).catch(function(e){app.innerHTML='<div class="wrap"><div class="card"><h2>Could not load your application</h2><p class="err" role="alert">'+esc(e.message)+'</p></div></div>'})
}
function renderLogin(message){
renderGoogleAuth(message)
}
function renderPostPaymentSignup(a){
var d=a.details||{};
renderGoogleAuth("This application was created before Google sign-in. Continue with the Google account using "+(d.email||"the same application email")+" to link it to your dashboard.")
}
function renderPendingPayment(a){
app.innerHTML='<div class="wrap"><div class="card"><div class="ref">'+esc(a.reference)+'</div><h2>Application saved</h2><p>Continue to Paystack to pay the registration fee. Then continue with Google using the same email address to access your application.</p><button class="btn" id="pay-retry">Continue to payment</button>'+(S.err.payment?'<div class="err" role="alert">'+esc(S.err.payment)+'</div>':'')+'</div></div>';
document.getElementById("pay-retry").onclick=async function(){var b=this;b.disabled=true;b.textContent="Connecting to Paystack…";try{var p=await applicationRequest("/api/payments/initialize",{method:"POST"});location.assign(p.authorizationUrl)}catch(e){S.err.payment=e.message;renderPendingPayment(a)}}
}
function signOut(){localStorage.removeItem("gbi-auth-session");AD.auth=false;AD.apps=null;navigateTo("/",true)}

var AD={auth:false,q:"",ff:"",fa:"",sel:null,apps:null};
function adLoad(){if(!AD.apps)AD.apps=[]}
function adList(){var q=AD.q.toLowerCase();return AD.apps.filter(function(a){
if(AD.ff&&a.field!=AD.ff)return false;if(AD.fa&&a.acad!=AD.fa)return false;
if(q&&(a.name+a.email+a.ref).toLowerCase().indexOf(q)<0)return false;return true})}
function adOpts(arr,all){return"<option value=''>"+all+"</option>"+arr.map(function(o){return"<option>"+o+"</option>"}).join("")}
function adStats(){var L=AD.apps,cs={},paid=L.filter(function(a){return a.paid});
L.forEach(function(a){cs[a.country]=1});
var it=[["Applicants",L.length],["Paid registrations","$"+paid.length*20],["Countries",Object.keys(cs).length]];
document.getElementById("st").innerHTML=it.map(function(x){return"<div><b>"+x[1]+"</b><span>"+x[0]+"</span></div>"}).join("")}
function adTable(){var L=adList();
document.getElementById("tb").innerHTML=L.length?L.map(function(a){
return"<tr tabindex='0' data-r='"+esc(a.ref)+"' aria-label='View application for "+esc(a.name)+"' class='"+(AD.sel==a.ref?"on":"")+"'><td>"+esc(a.ref)+"</td><td><b>"+esc(a.name)+"</b><br><small class='mu'>"+esc(a.email)+"</small></td><td>"+esc(a.field)+"</td><td>"+esc(a.country)+"</td><td>"+esc(a.acad)+"</td><td><span class='admin-payment-status "+(a.paid?"paid":"pending")+"'>"+(a.paid?"Paid":"Pending")+"</span></td><td>"+esc(a.date)+"</td></tr>"}).join(""):"<tr><td class='admin-empty-state' colspan='7'>No applicants match. Clear a filter to see more.</td></tr>";
document.getElementById("applicant-count").textContent="Showing "+L.length+" of "+AD.apps.length+" applicants";
document.getElementById("ex").disabled=!L.length;
[].forEach.call(document.querySelectorAll("#tb tr[data-r]"),function(r){var go=function(){AD.sel=r.getAttribute("data-r");adTable();adDetail();if(innerWidth<900)document.getElementById("dt").scrollIntoView()};r.onclick=go;r.onkeydown=function(e){if(e.key=="Enter")go()}})}
function adDetail(){var a=AD.apps.filter(function(x){return x.ref==AD.sel})[0],el=document.getElementById("dt");
if(!a){el.innerHTML="<div class='card'><h3>Select an applicant</h3><p class='mu'>Choose a row to see their full application.</p></div>";return}
var g=function(t,rows){return"<section class='admin-detail-section'><h4>"+t+"</h4><dl>"+rows.map(function(x){return"<dt>"+x[0]+"</dt><dd>"+esc(x[1]||"–")+"</dd>"}).join("")+"</dl></section>"};
el.innerHTML="<article class='card admin-detail-card'><header class='admin-detail-head'><div><p class='admin-kicker'>Application "+esc(a.ref)+"</p><h3>"+esc(a.name)+"</h3></div><span class='admin-payment-status "+(a.paid?"paid":"pending")+"'>"+(a.paid?"Payment received":"Payment pending")+"</span></header><p class='admin-detail-date'>Applied "+esc(a.date)+"</p>"+
g("Personal",[["Date of birth",a.dob],["Email",a.email],["Phone",a.phone],["Country",a.country],["City",a.city]])+
g("Academic",[["Institution",a.inst],["Education level",a.edu],["Status",a.acad],["Course",a.course],["Graduation",a.grad]])+
g("Experience & Skills",[["Field",a.field],["Employment",a.emp]].concat(roleEligible(a.emp)?[["Current role",a.role]]:[]).concat([["Skills",a.skills],["Experience",a.exp],["LinkedIn",a.linkedin],["Portfolio",a.portfolio]]))+
g("Documents and payment",[["CV",a.cv],["Payment",a.tx+" · "+(a.paid?"$20.00 paid":"not paid")]])+
"<section class='admin-detail-section'><h4>Motivation statement</h4><div class='admin-motivation'>"+(a.mot?esc(a.mot):"No motivation statement provided.")+"</div></section></article>"}
function adCsv(applicants){var rows=[["Reference","Name","Email","Phone","Country","City","Institution","Academic status","Course","Field","Payment status","Payment reference","Applied"]].concat(applicants.map(function(a){return[a.ref,a.name,a.email,a.phone,a.country,a.city,a.inst,a.acad,a.course,a.field,a.paid?"Paid":"Pending",a.tx,a.date]}));
return"\uFEFF"+rows.map(function(r){return r.map(function(c){var value=String(c==null?"":c);if(/^[\s\uFEFF]*[=+\-@]/.test(value))value="'"+value;return'"'+value.replace(/"/g,'""')+'"'}).join(",")}).join("\r\n")}
function exportCsv(){var applicants=adList(),feedback=document.getElementById("cv");if(!applicants.length){feedback.textContent="No applicants to export.";return}
try{var blob=new Blob([adCsv(applicants)],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="gbi-applicants-"+new Date().toISOString().slice(0,10)+".csv";document.body.appendChild(link);link.click();link.remove();window.setTimeout(function(){URL.revokeObjectURL(url)},1000);feedback.textContent="Exported "+applicants.length+" applicants to CSV."}catch(error){feedback.textContent="CSV export failed: "+error.message}}
async function loadAdminApplications(){
var result=await apiRequest("/api/admin/applications");
AD.apps=result.applications.map(function(row){var d=row.details||{},payment=(row.payments||[]).slice(-1)[0]||{};return{ref:row.reference,name:d.name||"",dob:d.dob||"",email:d.email||"",phone:d.phone||"",country:d.country||"",city:d.city||"",inst:d.institution||"",edu:d.education||"",acad:d.status||"",course:d.course||"",grad:d.gradyear||"",field:d.field||"",emp:d.employment||"",role:d.role||"",skills:d.skills||"",exp:d.experience||"",linkedin:d.linkedin||"",portfolio:d.portfolio||"",cv:d.cv||"",date:(row.created_at||"").slice(0,10),tx:payment.paystack_reference||"Not paid",paid:payment.status==="paid",mot:[d.m1,d.m2,d.m3,d.m4,d.m5].filter(Boolean).join("\\n\\n")}});
AD.auth=true;
if(location.pathname==="/admin")admin()
}
function admin(){
if(!AD.auth){
app.innerHTML="<div class='wrap' style='max-width:460px'><div class='card'><h2>Staff sign in</h2><p>Continue with a Google account that has staff access. Admin access is checked securely by Supabase.</p><button class='google-auth-btn' id='admin-google'><span class='google-mark' aria-hidden='true'>G</span>Continue with Google</button><div id='admin-error' class='err' role='alert' aria-live='polite'></div></div></div>";
var button=document.getElementById("admin-google"),error=document.getElementById("admin-error");
button.onclick=async function(){button.disabled=true;button.textContent="Connecting to Google…";try{await beginGoogleSignIn("/admin")}catch(e){sessionStorage.removeItem("gbi-oauth-code-verifier");sessionStorage.removeItem("gbi-oauth-return-to");error.textContent=e.message;button.disabled=false;button.innerHTML="<span class='google-mark' aria-hidden='true'>G</span>Continue with Google"}};
getSession().then(function(session){if(!session)return;button.disabled=true;button.textContent="Checking staff access…";return loadAdminApplications()}).catch(function(e){if(location.pathname==="/admin"){error.textContent=e.message;button.disabled=false;button.innerHTML="<span class='google-mark' aria-hidden='true'>G</span>Continue with Google"}});
return}
adLoad();
var F2=["AI and technology","Business and entrepreneurship","Engineering","Content creation and digital media","Other"];
app.innerHTML="<div class='wrap wide adm'><header class='admin-header'><div><p class='admin-kicker'>Staff console</p><h1>Applicant dashboard</h1><p class='admin-header-copy'>Review applications, payment status, and applicant details.</p></div><div class='admin-actions'><button class='btn admin-export' id='ex' type='button'>Export CSV</button><button class='btn sec' id='so' type='button'>Sign out</button></div></header><div class='stats' id='st'></div><div class='admin-feedback' id='cv' role='status' aria-live='polite'></div>"+
"<section class='admin-list-panel' aria-labelledby='admin-applicants-title'><div class='admin-panel-head'><div><h2 id='admin-applicants-title'>Applicants</h2><p>Search and filter the applicant list. Select a row to view the full application.</p></div><p class='admin-result-count' id='applicant-count' aria-live='polite'>Loading applicants…</p></div>"+
"<div class='admin-filters' role='search'><label for='aq'>Search applicants<input id='aq' type='search' placeholder='Name, email, or reference'></label><label for='aff'>Field<select id='aff'>"+adOpts(F2,"All fields")+"</select></label><label for='afa'>Academic status<select id='afa'>"+adOpts(["Continuing student","Recent graduate"],"All statuses")+"</select></label></div>"+
"<div class='al'><div class='tw'><table aria-label='Filtered applicants'><thead><tr><th>Reference</th><th>Applicant</th><th>Field</th><th>Country</th><th>Academic status</th><th>Payment</th><th>Applied</th></tr></thead><tbody id='tb'></tbody></table></div><aside id='dt' class='admin-detail' aria-label='Applicant details'></aside></div></section></div>";
document.getElementById("aq").oninput=function(){AD.q=this.value;adTable()};
document.getElementById("aff").onchange=function(){AD.ff=this.value;adTable()};
document.getElementById("afa").onchange=function(){AD.fa=this.value;adTable()};
document.getElementById("so").onclick=signOut;
document.getElementById("ex").onclick=exportCsv;
adStats();adTable();adDetail()}

function contact(){app.innerHTML='<div class="wrap"><h2>Contact us</h2><p>Have a question about the programme, your application or your payment? Send us an email and we will get back to you.</p><div class="card cc"><span class="ico"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></span><div><h3 style="margin:0 0 4px">Email</h3><a class="em" href="mailto:info@gbi.com">info@gbi.com</a></div></div><p class="mu" style="margin-top:16px">If you have already applied, please include your application reference number.</p></div>'}
function reveal(){var els=[].slice.call(document.querySelectorAll(".rv,.grid>div,.chips span,.wrap>h2,.wrap>.notice,.fq"));
els.forEach(function(e){e.classList.add("rv");var k=[].indexOf.call(e.parentNode.children,e);e.style.setProperty("--d",Math.min(k,5)*80+"ms")});
if(!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("in")});return}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.1});els.forEach(function(e){io.observe(e)})}
var ROUTES={home:home,apply:apply,dashboard:dash,faq:faq,contact:contact,privacy:privacy,terms:terms,admin:admin};
function updateLandingHeader(){var landing=document.body.classList.contains("landing-page");document.body.classList.toggle("landing-page-scrolled",landing&&window.scrollY>24)}
function route(){if(!app)return;var legacy=(location.hash||"").slice(1);if(ROUTES[legacy])history.replaceState({},"",(legacy=="home"?"/":"/"+legacy)+location.search);var name=location.pathname.split("/").filter(Boolean).pop()||"home";window.scrollTo(0,0);document.body.classList.toggle("landing-page",name=="home");updateLandingHeader();(ROUTES[name]||home)();startCd();reveal()}
function navigateTo(path,replace){history[replace?"replaceState":"pushState"]({},"",path);route()}
function handleInternalNavigation(event){if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;var link=event.target.closest&&event.target.closest("a[href]");if(!link||link.target&&link.target!="_self"||link.hasAttribute("download"))return;var url=new URL(link.href,location.href);if(url.origin!==location.origin)return;var pathname=url.pathname;if(url.hash){var legacy=url.hash.slice(1);if(!ROUTES[legacy])return;pathname=legacy=="home"?"/":"/"+legacy}var name=pathname.split("/").filter(Boolean).pop()||"home";if(!ROUTES[name])return;event.preventDefault();var next=pathname+url.search;if(next!=location.pathname+location.search){history.pushState({},"",next);route()}}
function setupMobileNavigation(){
var nav=document.querySelector("nav"),toggle=nav&&nav.querySelector(".nav-toggle");
if(!toggle)return;
function setOpen(open){nav.classList.toggle("nav-open",open);toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Close navigation menu":"Open navigation menu")}
toggle.addEventListener("click",function(){setOpen(toggle.getAttribute("aria-expanded")!=="true")});
nav.addEventListener("click",function(event){if(event.target.closest&&event.target.closest("a"))setOpen(false)});
document.addEventListener("click",function(event){if(!nav.contains(event.target))setOpen(false)});
document.addEventListener("keydown",function(event){if(event.key==="Escape"&&nav.classList.contains("nav-open")){setOpen(false);toggle.focus()}});
window.addEventListener("resize",function(){if(window.innerWidth>620)setOpen(false)});
}
setupMobileNavigation();
if(app)document.addEventListener("click",handleInternalNavigation);
window.addEventListener("scroll",updateLandingHeader,{passive:true});
window.addEventListener("popstate",route);route();
