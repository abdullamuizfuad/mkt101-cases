/* =====================================================================
   MKT101 story mode (engine/fun.js): a fictional Maldivian juice start-up that grows one chapter per topic.
   ---------------------------------------------------------------------
   STORY = {title, intro, ch:{topic:{title, text, q:[2 decisions, the first option is right]}}, review}.
   A chapter opens once the student has answered 10 MCQs in its topic. The lecturer releases story mode on the Lecturer tab (meta/expert story).
   The business and everything that happens to it is invented for practice (STORY.review).
   ===================================================================== */
const STORY=(()=>{
const Q=(t,n,q,o,why)=>({id:'s'+t+'-'+n,q,o,why});
return {title:'Raalhu Juice',
intro:"Aisha and her cousin Nashid start Raalhu Juice, a small juice bar in Hulhumalé. Each chapter is one step in growing the business. Read it, then make the call.",
ch:{
8:{title:'A new drink',text:"Raalhu sells mango and lime juice. Customers keep asking for something cold and filling after the gym. Aisha has ten ideas, from a protein smoothie to a sea-salt lemonade. Nashid wants to launch all ten next week.",
 q:[Q(8,1,"What should Raalhu do first with the ten ideas?",["Screen them and keep the few that fit customers and costs","Launch all ten next week","Pick the cheapest one without asking anyone","Copy the drink a rival sells"],"Idea screening drops weak ideas early, before money is spent on them."),
  Q(8,2,"Before a full launch, Raalhu sells the protein smoothie for two weeks at the gym door only. This is:",["Test marketing","Commercialisation","Idea generation","The decline stage"],"Test marketing tries the product and its marketing in a realistic setting before the full launch.")]},
9:{title:'Setting the price',text:"The protein smoothie is a hit at the gym. It costs MVR 22 to make. Rival cafés sell smoothies for MVR 45 to 60. Gym members say it is better than anything nearby.",
 q:[Q(9,1,"Customers see high value and rivals charge MVR 45–60. A sensible price is:",["Around MVR 50, set by the value customers see","MVR 25, just above cost","MVR 120, ten times the cost","Free for the first year"],"Customer value-based pricing starts from how much customers value the product, then checks costs and rivals."),
  Q(9,2,"Selling 'smoothie + banana muffin' for less than both separately is:",["Product bundle pricing","Captive-product pricing","Market-skimming pricing","Segmented pricing"],"Bundle pricing combines products and offers the bundle at a reduced price.")]},
10:{title:'Beyond Hulhumalé',text:"A café in Malé and two guesthouses on Maafushi want to sell Raalhu smoothies. The bottles must stay cold and last only three days.",
 q:[Q(10,1,"Raalhu → café → customer is a:",["One-level channel","Zero-level channel","Two-level channel","Direct channel"],"One intermediary (the café) between Raalhu and the customer makes a one-level channel."),
  Q(10,2,"With a three-day shelf life, the key logistics choice is:",["Fast chilled transport and small, frequent deliveries","A large warehouse holding a month of stock","Selling only by post","Exclusive distribution in one shop"],"Perishable goods need fast transport and cold storage, with stock kept low.")]},
11:{title:'A shop of our own',text:"Raalhu opens a second outlet. Aisha must choose: a tiny kiosk by the ferry terminal or a bigger café with seats in a quiet street.",
 q:[Q(11,1,"Commuters buy quickly on the way to the ferry. The kiosk suits which retail idea?",["Location and convenience: being where busy customers already are","Atmosphere for long visits","A deep product assortment","Off-price retailing"],"Place is a key retail decision; convenience shoppers buy where it is quick and near."),
  Q(11,2,"The kiosk plays upbeat music and smells of fresh mango. This is part of the store's:",["Atmosphere (store environment)","Price decision","Wholesaling function","Sales force structure"],"Atmosphere, the look, sound and smell of a store, is part of a retailer's product and service decisions.")]},
12:{title:'Getting the word out',text:"Raalhu has MVR 15,000 for promotion this month. Nashid wants to spend it all on one big billboard. Aisha wants Instagram reels, free tasters at the ferry and a story in the local news.",
 q:[Q(12,1,"Using reels, tasters and a news story with one clear message is:",["Integrated marketing communications","A push strategy only","Personal selling","The affordable method"],"IMC coordinates the promotion tools so they carry one clear, consistent message."),
  Q(12,2,"A free news story about Raalhu's plastic-free bottles is an example of:",["Public relations (publicity)","Advertising","Sales promotion","Direct selling"],"PR builds good relations and favourable publicity; the media coverage is not paid for like advertising.")]},
13:{title:'Selling to resorts',text:"A resort wants 300 bottles a week for its spa. Its buyer asks for a meeting and worries about delivery delays.",
 q:[Q(13,1,"Learning about the resort and its buyer before the meeting is the:",["Preapproach","Closing","Follow-up","Prospecting"],"The preapproach is learning about the prospect before the sales call."),
  Q(13,2,"Answering the worry about delays with a written delivery plan is:",["Handling objections","Prospecting","Approach","Sales promotion"],"Handling objections means finding and resolving the buyer's concerns during the presentation.")]},
14:{title:'Growing responsibly',text:"Raalhu is now busy every day. Waste cups pile up, and a customer asks whether the 'healthy' label is true when some drinks are very sweet.",
 q:[Q(14,1,"Switching to refillable bottles with a small deposit reflects which sustainable marketing principle?",["Societal marketing: meeting customers' wants while caring for society's long-run interests","Planned obsolescence","High-pressure selling","Deceptive pricing"],"Societal marketing balances customers' wants, the company's needs and society's long-run interests."),
  Q(14,2,"Labelling very sweet drinks 'healthy' risks which criticism?",["Deceptive practices","High distribution costs","Planned obsolescence","Poor service to disadvantaged consumers"],"Misleading claims about a product's benefits are deceptive practices.")]}
},
review:['Raalhu Juice, Aisha and Nashid, the Hulhumalé juice bar, all prices (MVR 22 cost, MVR 45–60 rivals, MVR 15,000 budget), the Maafushi guesthouses and the resort order of 300 bottles a week are invented for practice.']};
})();
if(typeof module!=='undefined')module.exports={STORY};
