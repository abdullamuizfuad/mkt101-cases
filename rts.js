/* MKT101 Arena: Replacement Tutorial Sessions (engine/rts.js). Course data only.
   RTS_SESSIONS: one entry per session, switched on by the lecturer's request (add a new entry for the next one).
     id, title, from/to (GMT+5), mins (the time block shown to students), parts, bonus (the secret question).
   Parts: {kind:'mcq', items:[mcq ids]} · {kind:'write', title, pick (how many to choose; 0 = answer all), scenario, items:[written ids]}.
   RTS_Q holds every question: MCQs [topic, question, options (correct first), why]; written questions use the
   short-answer format ({id, t, topic, q, chips:[G key idea, D common mistake], minW}) so tools/marking can mark them. */
const RTS_SESSIONS=[
 {id:'r2026-11-03',title:'Replacement Tutorial Session',topics:'Topics 11 and 12',from:'2026-11-15T00:00:00+05:00',to:'2026-11-18T20:00:00+05:00',mins:30,
  parts:[
   {kind:'mcq',title:'Part 1: Quick-fire questions',sub:'20 questions on Topics 11 and 12, mixed. Pick the best answer.',
    items:['rm11a','rm12a','rm11b','rm12b','rm11c','rm12c','rm11d','rm12d','rm11e','rm12e','rm11f','rm12f','rm11g','rm12g','rm11h','rm12h','rm11i','rm12i','rm11j','rm12j']},
   {kind:'write',title:'Part 2: Short essay',sub:'About 150 words. Explain, apply and finish with a judgement.',pick:0,items:['rw101e']},
   {kind:'write',title:'Part 3: Mini case: Felivaru',sub:'Read the case, then answer both questions in about 60 to 80 words each.',pick:0,
    label:'Real business, case concept developed to fit Topics 11 and 12. The product, figures and plans are invented for practice.',
    scenario:'Felivaru is the tuna canning factory on Felivaru island in Lhaviyani Atoll, run by MIFCO. Imagine it is launching a new ready-to-eat tuna pouch: a 100 g spicy tuna snack for students and office workers. Today its canned tuna sells mainly through wholesalers who supply shops across the islands. For the pouch, the marketing team has a small budget, wants to reach young people in Malé and Hulhumalé, and must also reach shops on the outer islands.',
    items:['rw101c1','rw101c2']}
  ],
  bonus:'rw101x'}
];
const RTS_Q=(()=>{const G=t=>({t,g:1}),D=(t,why)=>({t,g:0,why});return {
/* ---- MCQs, Topic 11: retailing and wholesaling ---- */
rm11a:[11,'A supermarket in Malé where shoppers pick goods from the shelves and pay at a checkout is an example of:',['Self-service retailing','Full-service retailing','Limited-service retailing','Non-store retailing'],'Shoppers serve themselves, which keeps costs and prices low.'],
rm11b:[11,'A shop that sells only phones and phone accessories, with a deep range of each, is a:',['Specialty store','Department store','Convenience store','Supermarket'],'A specialty store carries a narrow product line with a deep assortment.'],
rm11c:[11,'Which retail marketing decision is about the look, sounds, smells and layout of a store?',['Store atmosphere','Product assortment','Price decision','Wholesale margin'],'Atmosphere is the physical environment that shapes how customers feel and how long they stay.'],
rm11d:[11,'A small grocery shop on an island buys from a business that buys in bulk from producers and sells in smaller amounts to shops. That business is a:',['Wholesaler','Retailer','Franchisee','Broker that never takes ownership'],'Wholesalers buy in bulk and break bulk for retailers.'],
rm11e:[11,'Which is a function wholesalers perform for retailers?',['Breaking bulk into smaller quantities','Setting the retailer\'s store atmosphere','Choosing the retailer\'s target market','Designing the retailer\'s logo'],'Breaking bulk saves retailers from buying huge quantities.'],
rm11f:[11,'A clothing shop that sells in its Malé store, on Instagram and through a website, with the same prices and stock information everywhere, is using:',['Omni-channel retailing','Showrooming','Category killing','Pure wholesaling'],'Omni-channel retailing joins all channels into one seamless experience.'],
rm11g:[11,'A shopper looks at a TV in a store and then buys it cheaper online. This is called:',['Showrooming','Webrooming','Franchising','Breaking bulk'],'Showrooming is checking a product in a store and buying it online.'],
rm11h:[11,'Which store is likely to have the highest prices because it offers a narrow range, long opening hours and a handy location?',['Convenience store','Discount store','Off-price retailer','Warehouse club'],'Convenience stores charge more for convenience: location and hours.'],
rm11i:[11,'A retailer that offers fewer services, lower prices and high volume, with a basic store layout, is following a:',['Low-markup, high-volume strategy','High-markup, low-volume strategy','Full-service strategy','Prestige pricing strategy'],'Discount retailers keep markups low and sell in volume.'],
rm11j:[11,'Which is the first retail marketing decision a new pharmacy in Hulhumalé should make?',['Choose its target market and positioning','Choose the colour of its shelves','Decide its weekly promotion','Decide the brand of its tills'],'Every other decision (assortment, price, promotion, place, atmosphere) follows from the target market and positioning.'],
/* ---- MCQs, Topic 12: communicating customer value ---- */
rm12a:[12,'Carefully joining up all of a company\'s communication channels to deliver one clear, consistent message is called:',['Integrated marketing communications','Personal selling','Push strategy','Sales promotion'],'IMC makes every channel tell the same story.'],
rm12b:[12,'In the communication process, turning an idea into words, pictures and symbols is:',['Encoding','Decoding','Feedback','Noise'],'The sender encodes the message; the receiver decodes it.'],
rm12c:[12,'A local ice cream brand gives shops a bigger margin and free freezers so they will stock and push its product. This is a:',['Push strategy','Pull strategy','Public relations strategy','Direct marketing strategy'],'A push strategy moves the product through the channel using trade promotion and selling.'],
rm12d:[12,'Setting the promotion budget as a fixed share of current or forecast sales is the:',['Percentage-of-sales method','Objective-and-task method','Competitive-parity method','Affordable method'],'The percentage-of-sales method links the budget to sales.'],
rm12e:[12,'Which promotion budget method starts from specific objectives, the tasks needed to reach them and the cost of those tasks?',['Objective-and-task method','Affordable method','Percentage-of-sales method','Competitive-parity method'],'It is the most logical method because spending follows what must be achieved.'],
rm12f:[12,'An advert whose main goal is to remind customers about a well-known product in the maturity stage is a:',['Reminder advertising objective','Informative advertising objective','Persuasive advertising objective','Comparative advertising objective'],'Reminder advertising keeps a mature brand in customers\' minds.'],
rm12g:[12,'Short-term incentives such as "buy one, get one free" to encourage buying now are:',['Sales promotion','Public relations','Personal selling','Advertising'],'Sales promotion gives a reason to buy now.'],
rm12h:[12,'A resort hosts journalists and shares a story about its coral restoration work. This is mainly:',['Public relations','Personal selling','Sales promotion','Direct marketing'],'PR builds good relations and a positive image through publicity and events.'],
rm12i:[12,'Distractions such as a crowded social media feed that stop a message being received as intended are called:',['Noise','Feedback','Response','Media'],'Noise is unplanned distortion or distraction in the communication process.'],
rm12j:[12,'"How the message is said" (style, tone, words and format, such as slice of life or a testimonial) is:',['Message execution','Message strategy','Media planning','Reach'],'Message strategy is what to say; execution is how to say it.'],
/* ---- written questions ---- */
rw101e:{id:'rw101e',t:11,topic:'Retail marketing decisions',minW:100,
 q:'A new mini-mart is opening in Hulhumalé, close to new apartment blocks. Explain THREE retail marketing decisions it must make, and judge which ONE matters most for its success.',
 chips:[G('Segmentation, targeting and positioning: who it serves and how it is different'),G('Product assortment and services: what it stocks and extra services'),G('Price decision: everyday low prices or higher prices for convenience'),G('Promotion and place: location, opening hours, delivery or WhatsApp orders'),G('Applies each decision to new apartment residents in Hulhumalé'),G('A clear judgement of which decision matters most, with a reason'),
  D('Lists decisions without explaining them','Each decision needs a sentence on what it means for this mini-mart.'),D('Ignores the target customer','The decisions all depend on who the mini-mart serves.')]},
rw101c1:{id:'rw101c1',t:11,topic:'Retailers and wholesalers (Felivaru case)',minW:60,
 q:'Case question 1: Which TWO types of retailer should sell the tuna pouch to students and office workers in Malé, and what role should wholesalers play for the outer islands?',
 chips:[G('Convenience stores near schools and offices: quick snack purchases'),G('Supermarkets: wide reach and shelf display'),G('Online or app delivery for busy office workers'),G('Wholesalers break bulk, store and transport to island shops'),G('Explains why each fits students and office workers'),
  D('Sell only through the factory','The factory is far from customers; retailers and wholesalers give reach.'),D('Wholesalers sell to final consumers','Wholesalers sell to retailers and businesses, not to the final consumer.')]},
rw101c2:{id:'rw101c2',t:12,topic:'Promotion mix and IMC (Felivaru case)',minW:60,
 q:'Case question 2: Recommend a promotion mix for the pouch launch. Say whether it should use mainly a push or a pull strategy, and how IMC keeps the message consistent.',
 chips:[G('Pull: social media adverts and sampling aimed at young people in Malé'),G('Push: trade deals and shelf displays so island shops stock it'),G('A mix of both, with a reason linked to the small budget'),G('IMC: one message and look across social media, packs and shop displays'),G('Sales promotion such as free tasting or a launch offer'),
  D('Push and pull are the same','Push works through the channel; pull creates demand from final customers.'),D('Spend everything on TV','A small budget aimed at young people suits targeted social media.')]},
rw101x:{id:'rw101x',t:12,topic:'Communication process (secret question)',minW:100,
 q:'Secret question (harder): Felivaru\'s first pouch advert is a fast, English-only Instagram Reel. Older households on the outer islands are not buying. Use the communication process (sender, encoding, message, media, decoding, receiver, response, feedback and noise) to explain why the message may be failing, and recommend TWO changes with a clear judgement.',
 chips:[G('Names the steps of the communication process correctly'),G('Encoding and decoding: English-only, fast message may not be understood'),G('Media: older island households may not use Instagram'),G('Noise: crowded feeds, weak signal, distractions'),G('Feedback: low sales and few comments show the problem'),G('Two realistic changes, such as Dhivehi messages, radio or island shop displays'),G('Clear judgement on the best change'),
  D('Blames the product only','The question is about the communication process, not the recipe.'),D('Lists the steps without applying them','Each step must be linked to Felivaru and older island households.')]}
}})();
