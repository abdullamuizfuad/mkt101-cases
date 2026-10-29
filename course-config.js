/* MKT101 Arena course settings read by the shared engine (engine/*.js). Loaded first. */
const CRS={
  id:'mkt101',CODE:'MKT101',name:'MKT101 Arena',ls:'mkt101_',repo:'mkt101-cases',
  title:'Introduction to Marketing',
  /* the weekly 6th-spot challenge (engine/wild.js): class starts Wednesday 4:00 pm (GMT+5); the challenge is open the 24 hours before */
  wild:{day:3,hour:16},
  /* topics the lecturer has already chosen for a week (used when no other topics are saved before it opens) */
  wildPlan:{'w2026-11-04':['10','11']},
  themeColor:{light:'#f6f0e4',dark:'#0d0718'},
  /* level index cut-offs for the three leaderboard tiers */
  tierCut:[2,5],
  noreply:'noreply@mkt101-arena.firebaseapp.com',
  /* course-only counters and progress fields in a new student's record */
  blankN:{typed:0,reviewed:0,mcq:0,mcqRight:0,mcqSets:0,bestRow:0,perfect30:0,speedrun:0,acts:0,notes:0,longs:0},
  blankX:{act:{},long:{},fin:{},tw:{},mt:{},mq:null,mlast:[],mday:{d:'',ids:{}},mh:[]},
  /* written-answer areas are keyed 't'+topic */
  bPfx:'t',
  logw:{plan:'answer plan',typed:'typed answer',timed:'timed answer',check:'self-check',mcq:'MCQ answered',mcqr:'MCQ retry',ltimed:'long answer',lmark:'long answer marked'},
  heatWord:'Coloured',
  recentWhat:'plans, typed and timed answers, MCQs and MCQ sets',
  /* concept check (engine/concepts.js): case names to ignore, and course synonyms */
  conceptStop:'sto soneva fushi',
  conceptSyn:{
    intermediar:['middleman','distributor','agent','wholesaler','stockist','retailer'],channel:['route','distribution'],
    atmospher:['atmosphere','ambience','mood','feel','lighting','music','scent'],sampl:['tasting','free trial','try'],
    promot:['offer','deal','discount','promotion'],loyal:['repeat','return','come back','regular'],greenwash:['green wash','misleading','vague claim'],
    sustainab:['green','eco','environment','future generation'],skim:['high price','premium'],penetrat:['low price','cheap']},
  conceptOver:{},conceptNeed:{}
};
