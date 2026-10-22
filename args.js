/* =====================================================================
   MKT101 argument builders for the case activities
   ---------------------------------------------------------------------
   ARGS[case] is a list with one entry per activity, in the same order as
   the case's activities (null = no argument builder for that activity).
   The builder shows first on the activity page, as "Start here".

   Entry: {steps:[...], rows (optional), intro (optional)}
     rows:  the parts of the answer that get a score out of 2. Leave out to
            use the default rows in index.html (Key ideas, Case evidence,
            Analysis).
     steps: {label, row, need, max, opts:[{t, s, fb}]}
       row:  which row this step scores (0, 1 or 2)
       need: how many 'good' chips the student needs for full marks.
             Steps that share a row add their need together.
       max:  how many chips the student may pick
       t:    the chip text. It goes into "Your answer so far", so write it
             as a short, plain sentence.
       s:    'good' or 'weak'
       fb:   one short line shown after the check
   Write good chips first. The page shows them in a mixed order.
   A row scores 2 when it has all the good chips it needs and no weak ones,
   1 when it has at least half, and 0 otherwise.
   Never put real exam questions here.
   ===================================================================== */

const ARGS={
sto:[
 /* 1 Build the channel */
 {rows:[
   {n:'Key ideas',tip:['Name the channel level and say what it means.','Check the channel level again. How many businesses are between STO and the household?','The channel level is named and defined correctly.']},
   {n:'Case evidence',tip:['Use facts from the case, not opinions. Look at STO Online and Exhibits 1 and 2.','Use at least two specific case facts, and take out any vague or off-topic ones.','Strong, specific evidence from the case.']},
   {n:'Explanation',tip:['Say why the route suits Malé, and why it is harder in the atolls.','Nearly there. Give a reason for Malé and a reason for the atolls.','Clear reasons for both places.']}],
  steps:[
  {label:'Name the channel level',row:0,need:1,max:1,opts:[
   {t:'STO Online home delivery is a direct (zero-level) channel: STO sells straight to the household, with no intermediaries.',s:'good',fb:'Correct. No business stands between STO and the household.'},
   {t:'STO Online is a one-level channel, because the app is the retailer.',s:'weak',fb:'The app is STO’s own tool, not a separate business. No intermediary means zero-level.'},
   {t:'STO Online is a three-level channel, like the rice route to the atolls.',s:'weak',fb:'That is the atoll route in Exhibit 2. Home delivery has no businesses in between.'},
   {t:'STO Online is a channel because customers use their phones.',s:'weak',fb:'Too vague. Name the channel level and say what it means.'}]},
  {label:'Choose your case evidence',row:1,need:2,max:3,opts:[
   {t:'Customers in Malé and Hulhumalé receive home delivery within hours.',s:'good',fb:'A specific fact that shows the route works well near the warehouse.'},
   {t:'On the atoll route, rice passes through a distributor, a stockist and a shop, and each one adds a margin.',s:'good',fb:'Strong. This is the longer route in Exhibits 1 and 2.'},
   {t:'A bag of rice costs MVR 28 in Malé but can reach MVR 45 on a southern island.',s:'good',fb:'Strong. It shows what the longer route costs.'},
   {t:'During the southwest monsoon, rough seas can delay boats for several days.',s:'good',fb:'Good. It shows why delivery to far islands is hard.'},
   {t:'Internet connections on a few islands are still unreliable.',s:'good',fb:'Good. An app is harder to use where the internet is weak.'},
   {t:'Everyone in the Maldives likes shopping online.',s:'weak',fb:'The case does not say this, and it is too general.'},
   {t:'STO was founded in 1964.',s:'weak',fb:'A real fact, but it does not help explain this channel.'},
   {t:'STO Select is a premium range for higher-income households.',s:'weak',fb:'This is about a product range, not this delivery route.'}]},
  {label:'Explain where the route works',row:2,need:2,max:2,opts:[
   {t:'It suits Malé and Hulhumalé because customers live close to the warehouse, so many orders in a small area keep delivery fast and cheap.',s:'good',fb:'Good. Distance and order numbers explain it.'},
   {t:'It is harder in the outer atolls because distance, boat delays and small orders make delivery to every home very costly.',s:'good',fb:'Good. You link the problem to case facts.'},
   {t:'With no intermediaries, no other business adds a margin, so prices can stay lower.',s:'good',fb:'Good. This is a key benefit of a direct channel.'},
   {t:'It suits Malé because people in Malé are richer.',s:'weak',fb:'The case does not say this. The reason is distance and delivery cost.'},
   {t:'It is harder in the atolls because island people do not want new things.',s:'weak',fb:'34% of STO Online users are from outer atolls, so the demand is there.'}]}]},

 /* 2 Design the STO Select corner */
 {rows:[
   {n:'Key ideas',tip:['Define store atmosphere and name some of its parts.','Check your definition. Atmosphere is about how the store feels.','Store atmosphere is defined correctly.']},
   {n:'Premium cues',tip:['Choose cues that make the corner feel premium.','Some of your cues say “everyday”, not “premium”. Swap them.','Strong cues that fit a premium range.']},
   {n:'Explanation',tip:['Say why the corner should feel different, and what should stay the same.','Nearly there. Give one reason for “different” and one for “the same”.','Clear reasons for both.']}],
  steps:[
  {label:'Define the key idea',row:0,need:1,max:1,opts:[
   {t:'Store atmosphere is the look and feel of a store, such as lighting, sound, scent, layout, display and service, which shapes how customers feel and buy.',s:'good',fb:'Correct definition.'},
   {t:'Store atmosphere is the weather outside the store.',s:'weak',fb:'No. It is the feel the store creates inside.'},
   {t:'Store atmosphere means the prices and discounts in a store.',s:'weak',fb:'Price is a different retail decision. Atmosphere is about the senses and feelings.'}]},
  {label:'Choose premium cues for the corner',row:1,need:2,max:3,opts:[
   {t:'Warm spotlights and soft background music make the corner feel calm and special.',s:'good',fb:'Sight and sound cues that say “premium”.'},
   {t:'A few items, neatly arranged on open tables, tell shoppers the range is carefully chosen.',s:'good',fb:'Display and layout cues that say “curated”.'},
   {t:'A tasting counter with fresh coffee lets shoppers try the specialty coffee.',s:'good',fb:'A scent cue that also lets shoppers try the product.'},
   {t:'A staff member who can explain the products gives a premium service.',s:'good',fb:'A people cue. Premium shoppers expect advice.'},
   {t:'Products are stacked high on tall shelves, so more of them fit.',s:'weak',fb:'This is the everyday look of the main store. It does not feel premium.'},
   {t:'Large price signs and store announcements.',s:'weak',fb:'These say “practical and cheap”, not “premium and curated”.'}]},
  {label:'Explain what changes and what stays',row:2,need:2,max:2,opts:[
   {t:'The corner should feel different because STO Select targets higher-income urban shoppers and is positioned as premium.',s:'good',fb:'Good. A different position needs a different feel.'},
   {t:'Some things should stay the same, such as bilingual signs and easy movement, so it still feels welcoming and like STO.',s:'good',fb:'Good. Keeping some STO cues keeps it familiar.'},
   {t:'The corner should feel different so STO can charge more for rice.',s:'weak',fb:'Rice stays in the main store. The corner is for the STO Select range.'},
   {t:'Everything should change, so customers forget it is STO.',s:'weak',fb:'The corner is inside an STO store. Keeping some STO cues keeps trust.'},
   {t:'The corner should look like the rest of the store, to save money.',s:'weak',fb:'Then the premium range sends mixed signals.'}]}]},

 /* 3 Coach the island sales team */
 {rows:[
   {n:'Key ideas',tip:['Define both ideas: personal selling and sales promotion. Read the Topic 13 notes if you are not sure.','One definition is missing or not quite right. Check both.','Both ideas are defined correctly.']},
   {n:'Case evidence',tip:['Use facts from the case, not opinions. Read “The island sales team” again.','Use at least two specific case facts, and take out any vague or off-topic ones.','Strong, specific evidence from the case.']},
   {n:'Analysis',tip:['Choose ideas that help shop owners, and give a reason about trust or value.','Nearly there. Check that every reason is about the shop owners, not only about STO.','Clear analysis. Each reason links the idea to the relationship.']}],
  steps:[
   {label:'Name the key ideas',row:0,need:2,max:2,opts:[
    {t:'Personal selling is when a company’s salespeople present in person to make sales and build customer relationships.',s:'good',fb:'Correct definition of personal selling.'},
    {t:'Sales promotion is short-term rewards that encourage people to buy now.',s:'good',fb:'Correct definition of sales promotion.'},
    {t:'Personal selling is any way a company tells customers about its products.',s:'weak',fb:'Too broad. That is promotion in general. Personal selling is a salesperson, in person.'},
    {t:'Sales promotion is a long-term plan to build a strong brand.',s:'weak',fb:'Sales promotion is short-term. Building a brand over years is not its main job.'},
    {t:'Advertising is paid messages that reach many people at once.',s:'weak',fb:'True, but the question asks about personal selling and sales promotion.'}]},
   {label:'Choose your case evidence',row:1,need:2,max:3,opts:[
    {t:'Before landing, the representative checks the shop’s past orders on her tablet (pre-approach).',s:'good',fb:'A specific case fact, linked to a selling step.'},
    {t:'When the owner says he has no room, she suggests smaller orders more often (handling objections).',s:'good',fb:'A specific case fact, linked to a selling step.'},
    {t:'A week after the goods arrive, she phones to check that nothing was damaged (follow-up).',s:'good',fb:'A specific case fact, linked to a selling step.'},
    {t:'Many owners say they trust STO because they deal with the same person on every visit.',s:'good',fb:'Strong evidence that the relationship depends on the visits.'},
    {t:'Owners of very small shops feel that the best offers only go to shops that can order a lot.',s:'good',fb:'Strong evidence of a problem in the relationship.'},
    {t:'STO cares a lot about its island customers.',s:'weak',fb:'Too vague. This is an opinion, not a fact from the case.'},
    {t:'The representatives work very hard.',s:'weak',fb:'The case does not say this. Use facts the case gives you.'},
    {t:'A bag of rice costs MVR 28 in Malé and MVR 45 on a southern island.',s:'weak',fb:'A real case fact, but it is about the price gap, not the sales team.'}]},
   {label:'Choose two ideas that build relationships',row:2,need:2,max:2,opts:[
    {t:'The Regional Sales Manager’s idea builds relationships: the same trusted person keeps visiting, and small shops get attention too.',s:'good',fb:'Good. It keeps trust and answers the small shops’ complaint.'},
    {t:'The senior representative’s idea builds relationships: helping owners plan stock before the monsoon solves a real problem for them.',s:'good',fb:'Good. This is value selling, so owners see STO as a partner.'},
    {t:'The Head of Retail’s “Shop of the Year” contest and free display stand reward good partners without cutting prices.',s:'good',fb:'Good. Trade promotions that help shops sell and reward loyalty.'},
    {t:'The Head of Sales’ idea builds relationships, because phone calls save travel costs.',s:'weak',fb:'Saving cost helps STO, not the relationship. Owners trust the person who visits.'},
    {t:'The big discount for shops that double their order builds relationships, because shops get more stock.',s:'weak',fb:'Small shops have little storage, and the effect is short-term.'}]},
   {label:'Choose one idea that could harm relationships',row:2,need:1,max:1,opts:[
    {t:'However, the Finance Manager’s idea could harm relationships: if pay depends only on order size, representatives will chase large buyers and small shops will feel even more ignored.',s:'good',fb:'Strong. Pay shapes behaviour, and this plan rewards the wrong behaviour.'},
    {t:'However, the Head of Sales’ idea could harm relationships: owners would lose the face-to-face contact they trust, and the internet is weak on some islands.',s:'good',fb:'Strong. You use two case facts to explain the harm.'},
    {t:'However, the Finance Manager’s idea could harm relationships, because representatives would earn more money.',s:'weak',fb:'Say what changes for shop owners. Who would the representatives spend their time with?'},
    {t:'However, the Regional Sales Manager’s idea could harm relationships, because it costs more.',s:'weak',fb:'This idea helps relationships. The case gives no sign that it would hurt trust.'}]}]},

 /* 4 Answer the price critics */
 {rows:[
   {n:'Key ideas',tip:['Define sustainable marketing and name a principle you will use.','One idea is missing or not quite right. Check the definitions.','The key ideas are defined correctly.']},
   {n:'Case evidence',tip:['Use facts from the case, not opinions. Read “Fair prices and public trust” again.','Use at least two specific case facts, and take out any vague or off-topic ones.','Strong, specific evidence from the case.']},
   {n:'Evaluation',tip:['Judge the proposals: which helps island consumers most, and which damages trust?','Nearly there. Check both judgements and their reasons.','A clear judgement, with reasons linked to the principles.']}],
  steps:[
  {label:'Name the key ideas',row:0,need:2,max:2,opts:[
   {t:'Sustainable marketing meets the needs of consumers and the business today, while protecting the ability of future generations to meet their needs.',s:'good',fb:'Correct definition.'},
   {t:'Societal marketing means acting for the long-term good of consumers and society, not only for today’s sales.',s:'good',fb:'A principle that fits this question well.'},
   {t:'Consumer-oriented marketing means seeing the business from the consumer’s point of view.',s:'good',fb:'A principle that fits this question well.'},
   {t:'Sustainable marketing means using green packaging.',s:'weak',fb:'Too narrow. It is about people and society too, not only the environment.'},
   {t:'Sustainable marketing means making as much profit as possible every year.',s:'weak',fb:'No. It balances profit with the long-term good of customers and society.'}]},
  {label:'Choose your case evidence',row:1,need:2,max:3,opts:[
   {t:'A bag of rice costs MVR 28 in Malé but can reach MVR 45 on a southern island.',s:'good',fb:'Strong. It shows the size of the price gap.'},
   {t:'Some island residents now order from private sellers in Malé, even though delivery takes longer.',s:'good',fb:'Strong. It shows STO is losing customers and trust.'},
   {t:'STO is majority government-owned, so people expect it to act for the whole nation.',s:'good',fb:'Strong. It explains why the public expects more from STO.'},
   {t:'A post shared thousands of times said: “Reusable bags are nice, but my family cannot eat a bag.”',s:'good',fb:'Good. It shows small green steps do not answer the price problem.'},
   {t:'Everyone on social media hates STO.',s:'weak',fb:'An exaggeration. Use the specific facts the case gives.'},
   {t:'STO Online delivers within hours in Malé.',s:'weak',fb:'A real fact, but it does not show the price problem on the islands.'}]},
  {label:'Which proposal shows the most real responsibility?',row:2,need:1,max:1,opts:[
   {t:'The fixed price for ten essentials on every island shows the most responsibility: it is societal marketing and fits STO’s public duty, even though it costs STO money.',s:'good',fb:'Strong. You weigh the cost against the benefit.'},
   {t:'Publishing how the price of rice builds up shows real responsibility: it gives honest information and helps rebuild trust.',s:'good',fb:'Good. Honest information is consumer-oriented.'},
   {t:'The “STO Cares” advert shows the most responsibility, because many people will see it.',s:'weak',fb:'An advert without action on price. Critics would see it as words only.'},
   {t:'Refillable sacks show the most responsibility, because they close the price gap.',s:'weak',fb:'They help the environment, but they do not lower island prices.'}]},
  {label:'Which proposal would damage trust?',row:2,need:1,max:1,opts:[
   {t:'However, deleting angry comments would damage trust: it hides the problem instead of fixing it.',s:'good',fb:'Strong. Hiding criticism looks dishonest.'},
   {t:'However, blaming the shops would damage trust: STO designs the channel, so the public expects STO to act.',s:'good',fb:'Strong. STO cannot pass the problem to others.'},
   {t:'However, publishing a price breakdown would damage trust, because people would see the numbers.',s:'weak',fb:'Honest information usually builds trust. Choose a proposal that hides or avoids the problem.'},
   {t:'However, the fixed price would damage trust, because it costs STO money.',s:'weak',fb:'Cost is a real issue for STO, but it does not damage trust with island consumers.'}]}]},

 /* 5 Plan for the monsoon */
 {rows:[
   {n:'(a) Channel change',tip:['Choose a channel or wholesaling change, and link it to the monsoon.','Nearly there. Check that your change and its reason both fit the monsoon problem.','A specific change, clearly linked to the monsoon.']},
   {n:'(b) Tool',tip:['Choose a practical distribution tool, and say how it helps.','Nearly there. Check the tool and its reason.','A practical tool, clearly explained.']},
   {n:'(c) Challenge',tip:['Name a realistic challenge for your plan, and a sensible response.','Nearly there. Check the challenge and the response.','A realistic challenge with a sensible response.']}],
  steps:[
  {label:'(a) Pick a channel or wholesaling change',row:0,need:1,max:1,opts:[
   {t:'Before the monsoon, STO fills hub warehouses on two or three larger southern islands with essentials.',s:'good',fb:'A specific wholesaling change.'},
   {t:'Before the monsoon, island shops place early bulk pre-orders through STO Online.',s:'good',fb:'A specific channel change.'},
   {t:'Just before the monsoon, STO removes all the atoll distributors.',s:'weak',fb:'Distributors store goods and give credit. Removing them now adds risk.'}]},
  {label:'(a) Link it to the monsoon',row:0,need:1,max:1,opts:[
   {t:'This puts stock close to the islands, so a few days of rough seas do not empty the shelves.',s:'good',fb:'Good. You link the change to the delay problem.'},
   {t:'This lets STO raise prices when stock is short.',s:'weak',fb:'That would hurt island families and trust in STO. The aim is to keep shelves stocked.'},
   {t:'This means STO will not need boats any more.',s:'weak',fb:'Boats are still needed. The plan moves stock earlier.'}]},
  {label:'(b) Pick a distribution tool',row:1,need:1,max:1,opts:[
   {t:'A shared stock dashboard, so STO, stockists and shops can see which essentials are running low.',s:'good',fb:'A practical tool.'},
   {t:'Pre-packed bundles of essentials (rice, flour, oil, tinned fish) that are quick to load and deliver.',s:'good',fb:'A practical tool.'},
   {t:'Priority loading of essentials on cargo dhonis when the sea is calm.',s:'good',fb:'A practical tool.'},
   {t:'A TV advert asking people to buy less.',s:'weak',fb:'That is promotion, not a distribution tool. It does not move goods.'}]},
  {label:'(b) Say how the tool helps',row:1,need:1,max:1,opts:[
   {t:'It helps STO send the most needed goods first, so they reach the islands before a delay.',s:'good',fb:'Good. You explain what the tool changes.'},
   {t:'It makes the products look more premium.',s:'weak',fb:'Image is not the problem here. Getting goods to the shelves is.'},
   {t:'It means shops can stop ordering.',s:'weak',fb:'Shops still need to order. The tool helps orders arrive on time.'}]},
  {label:'(c) Name a challenge for your plan',row:2,need:1,max:1,opts:[
   {t:'Small island shops have little storage space for extra stock.',s:'good',fb:'A realistic challenge from the case.'},
   {t:'Stockists and distributors may feel STO is going around them.',s:'good',fb:'A realistic challenge from the case.'},
   {t:'Weak internet on some islands makes online pre-orders hard.',s:'good',fb:'A realistic challenge from the case.'},
   {t:'Customers may stop eating rice.',s:'weak',fb:'Not a realistic challenge in this case.'}]},
  {label:'(c) Choose a response',row:2,need:1,max:1,opts:[
   {t:'STO keeps the extra stock in its hubs and sends small, frequent top-ups, so shops do not need more space.',s:'good',fb:'A sensible response.'},
   {t:'STO works with the stockists: they hold hub stock and earn a fee, so they stay on STO’s side.',s:'good',fb:'A sensible response.'},
   {t:'STO ignores the problem, because the monsoon is short.',s:'weak',fb:'Every plan needs a response to its main challenge.'},
   {t:'STO gives a big discount to shops that double their order.',s:'weak',fb:'Small shops cannot store double. This makes the problem worse.'}]}]},

 /* 6 Spot the channel conflict */
 {rows:[
   {n:'Key ideas',tip:['Define channel conflict, and explain vertical and horizontal conflict.','One idea is missing or not quite right. Which conflict is between levels, and which is at the same level?','The key ideas are defined correctly.']},
   {n:'Case evidence',tip:['Find one case example of each type of conflict.','Check each example. Are the two businesses at the same level or at different levels?','A correct case example of each type.']},
   {n:'Management',tip:['Suggest a realistic way to manage one conflict, and say why it works.','Nearly there. Give a realistic idea and a reason.','A realistic idea with a clear reason.']}],
  steps:[
  {label:'Name the key ideas',row:0,need:2,max:2,opts:[
   {t:'Channel conflict is disagreement between channel members over goals, roles and rewards.',s:'good',fb:'Correct definition.'},
   {t:'Vertical conflict is between different levels of the same channel; horizontal conflict is between members at the same level.',s:'good',fb:'Correct. Both types are explained.'},
   {t:'Channel conflict is when customers complain about prices.',s:'weak',fb:'Customers are not channel members. Conflict is between the businesses in the channel.'},
   {t:'Horizontal conflict is between a supplier and its retailers.',s:'weak',fb:'That is vertical. Horizontal conflict is at the same level.'}]},
  {label:'Match the case to each type',row:1,need:2,max:2,opts:[
   {t:'Vertical conflict: island stockists say STO is “selling around them” through STO Online.',s:'good',fb:'Correct. STO and the stockists are at different levels.'},
   {t:'Horizontal conflict: two northern distributors cut prices to win the same island shops.',s:'good',fb:'Correct. Both are distributors, at the same level.'},
   {t:'Horizontal conflict: STO and the island stockists disagree about STO Online.',s:'weak',fb:'STO and the stockists are at different levels, so this is vertical.'},
   {t:'Vertical conflict: two northern distributors cut prices against each other.',s:'weak',fb:'Both are distributors, at the same level, so this is horizontal.'},
   {t:'Older customers prefer to pay cash to a shopkeeper they know.',s:'weak',fb:'A real fact, but it is about customers, not conflict between channel members.'}]},
  {label:'Choose how to manage one conflict',row:2,need:2,max:2,opts:[
   {t:'STO could bring stockists into STO Online, for example as pick-up points that earn a fee.',s:'good',fb:'A realistic idea for the vertical conflict.'},
   {t:'This works because the stockists keep a clear role and a fair reward, so they keep working with STO.',s:'good',fb:'A good reason.'},
   {t:'STO could give each northern distributor its own group of islands, so they stop fighting over the same shops.',s:'good',fb:'A realistic idea for the horizontal conflict.'},
   {t:'STO could stop working with all stockists, so there is no conflict.',s:'weak',fb:'STO needs their storage, credit and local knowledge. Supply would suffer.'},
   {t:'STO could ignore it, because conflict always ends by itself.',s:'weak',fb:'Price wars and unhappy stockists can cause gaps in supply. STO should act.'}]}]},

 /* 7 How widely should each product go? */
 {rows:[
   {n:'Key ideas',tip:['Define the three levels of distribution intensity.','Check your definition.','The three levels are defined correctly.']},
   {n:'Level for each product',tip:['Choose a level for each of the three products.','One or two choices are not the best fit. Think about price, how often people buy and service.','A suitable level for each product.']},
   {n:'Evidence and evaluation',tip:['Use case facts to justify your choices.','Use at least two specific case facts, and take out any off-topic ones.','Each choice is backed by case facts.']}],
  steps:[
  {label:'Define the key idea',row:0,need:1,max:1,opts:[
   {t:'Intensive distribution uses as many outlets as possible; selective uses a few chosen outlets; exclusive uses very few, often authorised dealers.',s:'good',fb:'Correct. All three levels are defined.'},
   {t:'Intensive distribution means selling at the highest price.',s:'weak',fb:'Intensity is about how many outlets, not price.'},
   {t:'Exclusive distribution means selling only online.',s:'weak',fb:'Exclusive means very few outlets, not online.'}]},
  {label:'Choose a level for each product',row:1,need:3,max:3,opts:[
   {t:'Rice and cooking oil: intensive distribution.',s:'good',fb:'Correct. Essentials bought often must be everywhere.'},
   {t:'Household appliances: selective distribution.',s:'good',fb:'Correct. A few larger stores are enough.'},
   {t:'Marine engines: exclusive distribution.',s:'good',fb:'Correct. Engines need trained service.'},
   {t:'Rice and cooking oil: exclusive distribution.',s:'weak',fb:'Essentials are bought often and must be available on every island.'},
   {t:'Marine engines: intensive distribution.',s:'weak',fb:'Engines need trained technicians and spare parts. Not every shop can give that.'},
   {t:'Household appliances: intensive distribution.',s:'weak',fb:'Customers compare a few models and need some support. A few larger stores work better.'}]},
  {label:'Justify with case facts',row:2,need:2,max:3,opts:[
   {t:'STO must keep essential goods affordable and available across all 20 atolls.',s:'good',fb:'Strong evidence for rice and oil.'},
   {t:'Engine buyers need trained technicians, spare parts and after-sales service close by.',s:'good',fb:'Strong evidence for engines.'},
   {t:'Appliance customers like to compare a few models, but do not need a specialist on every island.',s:'good',fb:'Strong evidence for appliances.'},
   {t:'Engines are popular, so they should be sold everywhere.',s:'weak',fb:'The case says engines need trained service, so wide distribution would lose control.'},
   {t:'STO Select should only be in high-footfall stores.',s:'weak',fb:'True for STO Select, but it is not one of the three products here.'}]}]},

 /* 8 Who’s who in STO’s world */
 {steps:[
  {label:'Name the key ideas',row:0,need:2,max:2,opts:[
   {t:'Retailers sell to final consumers for their own use.',s:'good',fb:'Correct definition.'},
   {t:'Wholesalers sell to businesses that resell the goods or use them in their work.',s:'good',fb:'Correct definition.'},
   {t:'Wholesalers always sell online.',s:'weak',fb:'Wholesaling is about who the buyer is, not how they order.'},
   {t:'A retailer is any business that sells food.',s:'weak',fb:'Retailers sell to final consumers, whatever the product.'}]},
  {label:'Match each business to a type, with proof',row:1,need:2,max:3,opts:[
   {t:'STO People’s Choice is a retailer: it sells groceries and household items to families in its stores.',s:'good',fb:'Correct, with a case feature.'},
   {t:'STO is a merchant wholesaler when it sells rice in bulk to resorts and cafés: it owns the goods it sells.',s:'good',fb:'Correct, with a case feature.'},
   {t:'STO Online is a non-store retailer when it delivers groceries to homes in Malé.',s:'good',fb:'Correct, with a case feature.'},
   {t:'Island stockists act as wholesalers: they buy in bulk and resell to small shops.',s:'good',fb:'Correct, with a case feature.'},
   {t:'Island shops are wholesalers, because they sell rice.',s:'weak',fb:'They sell to households, so they are retailers.'},
   {t:'STO is only a retailer.',s:'weak',fb:'The case says STO plays two roles: wholesaler and retailer.'}]},
  {label:'Explain the key difference',row:2,need:1,max:1,opts:[
   {t:'The type depends on who the buyer is: a final consumer (retail) or a business (wholesale). That is why STO can be both.',s:'good',fb:'Correct. The buyer decides the type.'},
   {t:'The type depends on how big the business is.',s:'weak',fb:'Size does not decide it. The type of buyer does.'},
   {t:'The type depends on where the store is.',s:'weak',fb:'Location does not decide it. The type of buyer does.'}]}]}
],

soneva:[
 /* 1 Which tool for which offer? */
 {rows:[
   {n:'Key ideas',tip:['Define personal selling.','Check your definition. Personal selling is one-to-one.','Personal selling is defined correctly.']},
   {n:'Villa stay',tip:['Use case facts to show why a villa stay needs personal selling.','Use at least two specific case facts, and take out any vague or off-topic ones.','Strong, specific reasons for the villa stay.']},
   {n:'Second offer',tip:['Choose a second offer and a better tool for it.','Nearly there. Check that the tool fits the offer.','A second offer with a better tool and a reason.']}],
  steps:[
  {label:'Define the key idea',row:0,need:1,max:1,opts:[
   {t:'Personal selling is one-to-one communication by a salesperson to make a sale and build a relationship.',s:'good',fb:'Correct definition.'},
   {t:'Personal selling is advertising aimed at rich people.',s:'weak',fb:'Advertising is paid and reaches many people at once. Personal selling is one-to-one.'},
   {t:'Personal selling means guests sell the resort to their friends.',s:'weak',fb:'No. It is the company’s salesperson talking with the customer.'}]},
  {label:'Why personal selling suits a villa stay',row:1,need:2,max:3,opts:[
   {t:'A stay costs USD 2,000 to 6,000 per night, so guests have many questions before they pay.',s:'good',fb:'Strong. High price means a careful decision.'},
   {t:'The booking involves several people, a large budget and months of planning.',s:'good',fb:'Strong. A complex decision needs personal help.'},
   {t:'The sales team reviews each client’s past stays, villa type and special occasions to tailor the offer.',s:'good',fb:'Strong. Tailoring is what personal selling does best.'},
   {t:'Guests like to talk to people.',s:'weak',fb:'Too vague. Use the specific facts about price and planning.'},
   {t:'Solar panels provide much of the resort’s energy.',s:'weak',fb:'A real fact, but it does not explain why selling is personal.'}]},
  {label:'Choose a second offer and a better tool',row:2,need:2,max:2,opts:[
   {t:'For a glass vase in the resort shop, the guest is already there and the price is lower, so a good display and a short chat are enough.',s:'good',fb:'Good. A full sales process is not needed.'},
   {t:'The low-season “stay seven, pay six” offer is sales promotion: it reaches many guests at once without a salesperson.',s:'good',fb:'Good. The right tool for a short-term offer.'},
   {t:'Telling the public about the coral work is public relations: it builds the brand’s reputation with many people.',s:'good',fb:'Good. The right tool for reputation.'},
   {t:'Every offer should use personal selling, because it works for villas.',s:'weak',fb:'Personal selling is costly. Low-cost or mass offers need other tools.'},
   {t:'The glass vase should be sold with TV advertising.',s:'weak',fb:'Too costly for small handmade items, and the guest is already in the shop.'}]}]},

 /* 2 Sort out the booking channels */
 {rows:[
   {n:'Key ideas',tip:['Explain direct and indirect channels, and channel conflict.','One idea is missing or not quite right. Check the definitions.','The key ideas are explained correctly.']},
   {n:'Case evidence',tip:['Use facts that show what each channel does, and what caused the conflict.','Use at least two specific case facts, and take out any vague or off-topic ones.','Strong, specific evidence from the case.']},
   {n:'Analysis and judgement',tip:['Choose the idea that causes the most conflict, and a way to reduce it.','Nearly there. Check your judgement and your solution.','A clear judgement and a realistic solution.']}],
  steps:[
  {label:'Name the key ideas',row:0,need:2,max:2,opts:[
   {t:'Booking on Soneva’s website is a direct (zero-level) channel; agents and OTAs are intermediaries in indirect channels.',s:'good',fb:'Correct.'},
   {t:'Channel conflict is disagreement between channel members over goals, roles and rewards.',s:'good',fb:'Correct definition.'},
   {t:'OTAs are part of Soneva, so they are a direct channel.',s:'weak',fb:'OTAs are separate businesses that charge commission, so the route is indirect.'},
   {t:'Channel conflict happens when guests choose another resort.',s:'weak',fb:'That is competition. Conflict is between Soneva and its channel members.'}]},
  {label:'Choose your case evidence',row:1,need:2,max:3,opts:[
   {t:'Many first-time guests discover Soneva while comparing resorts on an OTA.',s:'good',fb:'Shows what OTAs do for Soneva.'},
   {t:'Wealthy families with complex plans often prefer a travel designer who knows their tastes.',s:'good',fb:'Shows what agents do for Soneva.'},
   {t:'Direct bookings give Soneva more profit and more information about each guest.',s:'good',fb:'Shows what direct booking does for Soneva.'},
   {t:'Agents are unhappy that free spa treatments now go only to guests who book directly.',s:'good',fb:'Shows the cause of the conflict.'},
   {t:'Soneva charges USD 2,000 to 6,000 per night.',s:'weak',fb:'A real fact, but it does not show what each channel does.'},
   {t:'OTAs are bad for luxury brands.',s:'weak',fb:'An opinion. The case shows OTAs bring first-time guests.'}]},
  {label:'Which idea would cause the most conflict?',row:2,need:1,max:1,opts:[
   {t:'The Digital Manager’s idea would cause the most conflict: bigger direct perks every season would pull even more clients away from agents.',s:'good',fb:'Strong. It makes the agents’ complaint worse.'},
   {t:'The Director of Sales’ idea would cause the most conflict, because three channels are too many.',s:'weak',fb:'Clear roles for each channel reduce conflict.'},
   {t:'The Guest Relations Manager’s idea would cause the most conflict, because it is about OTA guests.',s:'weak',fb:'Inviting OTA guests back directly causes little conflict with agents.'},
   {t:'The Revenue Manager’s idea would cause the most conflict, because it saves commission.',s:'weak',fb:'Leaving OTAs loses first-time guests, but the agents are the ones already unhappy.'}]},
  {label:'How could Soneva reduce the conflict?',row:2,need:1,max:1,opts:[
   {t:'Give each channel a clear role: agents keep the clients they bring, and direct perks go only to guests without an agent.',s:'good',fb:'A realistic way to reduce conflict.'},
   {t:'Create an agent-only package, such as a private sandbank dinner, so agents also have something special to sell.',s:'good',fb:'A realistic way to reduce conflict.'},
   {t:'Stop paying agents commission.',s:'weak',fb:'This would make agents even angrier.'},
   {t:'Make the direct-booking spa treatment bigger.',s:'weak',fb:'That would increase the conflict.'}]}]},

 /* 3 Match the principles */
 {rows:[
   {n:'Key ideas',tip:['Define sustainable marketing and name its principles.','One idea is missing or not quite right. Check the definitions.','The key ideas are defined correctly.']},
   {n:'Practices matched',tip:['Match Soneva’s practices to the principles.','Some matches are not the best fit. Check them.','At least three practices matched correctly.']},
   {n:'Analysis',tip:['Choose one principle and justify it with case evidence.','Nearly there. Check the principle and your reason.','One principle, clearly justified.']}],
  steps:[
  {label:'Name the key ideas',row:0,need:2,max:2,opts:[
   {t:'Sustainable marketing meets today’s customer needs while protecting the ability of future generations to meet theirs.',s:'good',fb:'Correct definition.'},
   {t:'Its principles are consumer-oriented, customer-value, innovative, sense-of-mission and societal marketing.',s:'good',fb:'Correct. All five principles are named.'},
   {t:'Sustainable marketing is only about recycling.',s:'weak',fb:'Too narrow. It also covers customers, value, mission and society.'},
   {t:'Sustainable marketing means cutting prices to help customers.',s:'weak',fb:'Not a principle. Soneva rarely cuts its prices.'}]},
  {label:'Match practices to principles',row:1,need:3,max:4,opts:[
   {t:'The glass studio turns waste glass into products: innovative marketing.',s:'good',fb:'Correct. A new use for waste.'},
   {t:'The Soneva GIVE fund supports education and community projects: sense-of-mission marketing.',s:'good',fb:'Correct. A clear social purpose.'},
   {t:'Guests join reef surveys and coral planting: customer-value marketing.',s:'good',fb:'Correct. Sustainability adds to the guest’s experience.'},
   {t:'Solar panels and composting all food waste: societal marketing.',s:'good',fb:'Correct. Good for society in the long run.'},
   {t:'The glass studio: consumer-oriented marketing, because guests buy glass.',s:'weak',fb:'The key point is the new use of waste, which is innovation.'},
   {t:'The GIVE fund: innovative marketing.',s:'weak',fb:'The fund gives money to a social cause. That shows a sense of mission.'}]},
  {label:'Which principle best explains why Soneva sells sustainability?',row:2,need:2,max:2,opts:[
   {t:'Customer-value marketing best explains it: Soneva makes sustainability part of what the guest enjoys, like planting coral.',s:'good',fb:'Strong choice.'},
   {t:'This is because the sales team talks about sustainability as part of the guest experience, not a background policy.',s:'good',fb:'Good case evidence.'},
   {t:'Societal marketing also fits: the stay satisfies guests now and helps the reef in the long run.',s:'good',fb:'A good choice too, with a clear reason.'},
   {t:'Sense-of-mission marketing best explains it, because Soneva wants to sell more villas.',s:'weak',fb:'Sense of mission is about a social purpose, not sales.'},
   {t:'This is because sustainability lets Soneva charge any price.',s:'weak',fb:'Some guests already doubt this. The value must be real.'}]}]},

 /* 4 Where should the glass go? */
 {rows:[
   {n:'Key ideas',tip:['Explain location, product assortment and store atmosphere.','One idea is missing or not quite right. Check the definitions.','The key ideas are explained correctly.']},
   {n:'Case evidence',tip:['Use facts about the strengths and problems of each option.','Use at least two specific case facts, and take out any vague or off-topic ones.','Strong, specific evidence from the case.']},
   {n:'Judgement',tip:['Recommend one option, and name its main risk and a response.','Nearly there. Check your recommendation and the risk.','A clear recommendation with a realistic risk.']}],
  steps:[
  {label:'Name the key ideas',row:0,need:2,max:2,opts:[
   {t:'Location is where the store is, which decides which customers it reaches.',s:'good',fb:'Correct.'},
   {t:'Product assortment is the range of products; store atmosphere is the look and feel of the store.',s:'good',fb:'Correct.'},
   {t:'Atmosphere means how cheap the products are.',s:'weak',fb:'Atmosphere is look and feel, not price.'},
   {t:'Assortment means how many shops a company has.',s:'weak',fb:'Assortment is the range of products in a store.'}]},
  {label:'Choose your case evidence',row:1,need:2,max:3,opts:[
   {t:'Thousands of travellers, including Soneva guests on their way home, pass through the airport every day.',s:'good',fb:'A strength of the airport.'},
   {t:'Airport rent is high, the glass breaks easily, and the shop would need trained staff.',s:'good',fb:'Problems of the airport.'},
   {t:'In Malé souvenir shops, the glass would sit next to T-shirts and fridge magnets.',s:'good',fb:'A problem of the souvenir shops.'},
   {t:'An online shop costs much less, but does not give the same experience.',s:'good',fb:'Strength and problem of the online shop.'},
   {t:'Glass is very popular in the Maldives.',s:'weak',fb:'The case does not say this.'},
   {t:'Soneva Fushi is in Baa Atoll, a UNESCO Biosphere Reserve.',s:'weak',fb:'A real fact, but it does not help compare the options.'}]},
  {label:'Recommend one option',row:2,need:1,max:1,opts:[
   {t:'I recommend the airport boutique, with soft spotlights, a few pieces and trained staff: it reaches the right guests and fits the luxury brand.',s:'good',fb:'A clear, supported recommendation.'},
   {t:'I recommend the online shop: it costs much less and lets guests buy after they leave.',s:'good',fb:'A clear, supported recommendation.'},
   {t:'I recommend the Malé souvenir shops, because they are cheap and busy.',s:'weak',fb:'Wrong customers, and a cheap image next to fridge magnets.'},
   {t:'I recommend a duty-free style shop, with crowded shelves and SALE signs.',s:'weak',fb:'Mixed signals. This does not fit fragile, handmade luxury glass.'}]},
  {label:'Name the main risk and a response',row:2,need:1,max:1,opts:[
   {t:'The main risk is high rent and breakage, so Soneva should start small, with a few pieces and strong packaging, and track sales.',s:'good',fb:'A realistic risk and response for the airport.'},
   {t:'The main risk is that fragile glass can break in shipping and buyers miss the story, so use strong packaging and a video of the artists.',s:'good',fb:'A realistic risk and response for the online shop.'},
   {t:'There is no real risk with my choice.',s:'weak',fb:'Every option has a risk. Name it and say how to manage it.'},
   {t:'The main risk is that guests will not like glass.',s:'weak',fb:'Guests already ask where they can buy more.'}]}]},

 /* 5 Pitch the Glass and Sun Escape */
 {rows:[
   {n:'(a) Opening',tip:['Open with questions that build trust.','Nearly there. Ask and listen before you sell.','A question-based opening that builds trust.']},
   {n:'(b) Selling point',tip:['Choose one specific selling point and say why it suits this family.','Nearly there. Check the selling point and the reason.','A specific selling point that suits the family.']},
   {n:'(c) Objection',tip:['Name a realistic objection and an honest, specific response.','Nearly there. Check the objection and the response.','A realistic objection with an honest response.']}],
  steps:[
  {label:'(a) How will you open?',row:0,need:2,max:2,opts:[
   {t:'I would ask what the family wants to feel on this holiday, before I talk about villas.',s:'good',fb:'Good. This is how the case’s sales manager opened with Lena.'},
   {t:'I would ask about the children’s interests and past holidays, and listen.',s:'good',fb:'Good. Listening builds trust.'},
   {t:'I would start with the price and a discount.',s:'weak',fb:'Soneva rarely discounts, and price first does not build trust.'},
   {t:'I would read a long list of all the resort’s features.',s:'weak',fb:'That is a pitch before listening. Ask questions first.'}]},
  {label:'(b) Choose a selling point and a reason',row:1,need:2,max:2,opts:[
   {t:'I would highlight the glass workshop, where the children make their own piece from recycled bottles.',s:'good',fb:'Specific and suited to a family.'},
   {t:'I would highlight the solar and waste tour, where the family sees how the resort really works.',s:'good',fb:'Specific and suited to a family.'},
   {t:'This suits the family because it is hands-on for the children and shows real sustainability, not just a promise.',s:'good',fb:'A good reason.'},
   {t:'I would say that Soneva is eco-chic and planet-friendly.',s:'weak',fb:'Vague words, like the rival resorts use. Be specific.'},
   {t:'This suits the family because it is the cheapest package.',s:'weak',fb:'The case gives no price for it. Sell value, not a low price.'}]},
  {label:'(c) Choose an objection and a response',row:2,need:2,max:2,opts:[
   {t:'The parent may ask: “Is this sustainability real, or just a story for a high price?”',s:'good',fb:'A realistic objection from the case.'},
   {t:'I would answer with specific facts: all food waste is composted, glass is recycled in the studio, and guests join reef surveys.',s:'good',fb:'An honest, specific response.'},
   {t:'The parent may say the price is higher than other resorts, so I would explain what is included and offer to hold the villa while they decide.',s:'good',fb:'A realistic objection with a good response, like Lena’s booking.'},
   {t:'I would offer a big discount at once.',s:'weak',fb:'This makes a luxury brand look ordinary.'},
   {t:'I would say the stay has zero impact on the planet.',s:'weak',fb:'Overclaiming. Guests fly a long way. Be honest about limits.'}]}]},

 /* 6 Follow Lena’s booking */
 {rows:[
   {n:'Key ideas',tip:['Name the selling steps and explain relationship selling.','One idea is missing or not quite right. Check the definitions.','The key ideas are explained correctly.']},
   {n:'Steps in the case',tip:['Match moments from Lena’s booking to the selling steps.','Some matches are not right. Check them again.','Steps correctly matched to Lena’s booking.']},
   {n:'Two steps and relationships',tip:['Explain how two steps build a long-term relationship.','Nearly there. Check both explanations.','Two steps clearly linked to loyalty.']}],
  steps:[
  {label:'Name the key ideas',row:0,need:2,max:2,opts:[
   {t:'The selling steps are prospecting, pre-approach, approach, presentation, handling objections, closing and follow-up.',s:'good',fb:'Correct. All seven steps.'},
   {t:'Relationship selling aims for long-term loyalty; transactional selling only tries to close the sale quickly.',s:'good',fb:'Correct.'},
   {t:'Personal selling is the same as advertising.',s:'weak',fb:'Advertising is one-to-many and paid. Personal selling is one-to-one.'},
   {t:'The selling process ends when the customer pays.',s:'weak',fb:'Follow-up after the sale is a step too.'}]},
  {label:'Match moments to steps',row:1,need:3,max:4,opts:[
   {t:'Meeting Lena at a travel fair and noting that her clients match Soneva’s guests: prospecting.',s:'good',fb:'Correct.'},
   {t:'Reading about the family’s past holidays before the call: pre-approach.',s:'good',fb:'Correct.'},
   {t:'Explaining what is included instead of giving a discount: handling objections.',s:'good',fb:'Correct.'},
   {t:'Offering to hold the villa for 48 hours: closing.',s:'good',fb:'Correct.'},
   {t:'Calling Lena after the stay and sending the coral photo: follow-up.',s:'good',fb:'Correct.'},
   {t:'Sending the tailored proposal: follow-up.',s:'weak',fb:'That is the presentation.'},
   {t:'Asking what the family wants to feel: closing.',s:'weak',fb:'That is the approach.'}]},
  {label:'Choose two steps that build a relationship',row:2,need:2,max:2,opts:[
   {t:'The pre-approach research shows the family that they are known and valued.',s:'good',fb:'Good. It builds trust from the start.'},
   {t:'Handling the price objection without a discount protects trust and the brand’s value.',s:'good',fb:'Good. Value, not price.'},
   {t:'The follow-up coral photo keeps the relationship alive and brings return visits.',s:'good',fb:'Good. It encourages loyalty and referrals.'},
   {t:'Closing fast with a discount builds loyalty.',s:'weak',fb:'That is transactional, and Soneva did not discount.'},
   {t:'Prospecting builds loyalty because the fair was in Germany.',s:'weak',fb:'The place does not build loyalty. Explain what the step does for the client.'}]}]},

 /* 7 Test the claims */
 {rows:[
   {n:'Key ideas',tip:['Define greenwashing.','Check your definition.','Greenwashing is defined correctly.']},
   {n:'Evidence on both sides',tip:['Find credible claims and risky claims.','Some claims are sorted the wrong way. Ask: is it specific and checkable?','Credible and risky claims, correctly sorted.']},
   {n:'Judgement',tip:['Make a clear final judgement about Soneva, with a reason.','Nearly there. Check your judgement and its limit.','A clear judgement, supported by the case.']}],
  steps:[
  {label:'Define the key idea',row:0,need:1,max:1,opts:[
   {t:'Greenwashing means sustainability claims that are vague, exaggerated or not backed by real action.',s:'good',fb:'Correct definition.'},
   {t:'Greenwashing means cleaning with eco-friendly products.',s:'weak',fb:'No. It is about misleading claims.'},
   {t:'Greenwashing means any claim about nature.',s:'weak',fb:'Only vague or misleading claims are greenwashing.'}]},
  {label:'Sort credible and risky claims',row:1,need:2,max:4,opts:[
   {t:'Credible: all food waste is composted on the island. It is specific and can be checked.',s:'good',fb:'Correct.'},
   {t:'Credible: glass bottles are recycled in Soneva’s own glass studio.',s:'good',fb:'Correct.'},
   {t:'Risky: rival resorts call themselves “eco-chic” or a “planet-friendly paradise” without saying what they do.',s:'good',fb:'Correct. Vague words with no action.'},
   {t:'Risky: a “zero impact” holiday ignores the long flights guests take.',s:'good',fb:'Correct. Overclaiming.'},
   {t:'Credible: “planet-friendly paradise”, because it sounds positive.',s:'weak',fb:'Positive but vague. There is no action or number.'},
   {t:'Risky: guests can take part in reef surveys.',s:'weak',fb:'This is a specific, real activity, so it is credible.'}]},
  {label:'Make your judgement',row:2,need:2,max:2,opts:[
   {t:'Soneva is more credible than the rival resorts, because it shares real programs and outcomes, not broad promises.',s:'good',fb:'A clear judgement with a reason.'},
   {t:'But Soneva must be honest about limits, such as the flights, or its claims could also look like greenwashing.',s:'good',fb:'Good. A balanced judgement.'},
   {t:'Soneva is credible because it is expensive.',s:'weak',fb:'Price does not prove anything. Evidence does.'},
   {t:'All resorts are the same, so no claim can be trusted.',s:'weak',fb:'The case shows clear differences. Judge the evidence.'}]}]},

 /* 8 Sort the promotions */
 {steps:[
  {label:'Name the key ideas',row:0,need:2,max:2,opts:[
   {t:'Consumer promotions target guests; trade promotions target travel agents and travel designers.',s:'good',fb:'Correct.'},
   {t:'Business promotions help find new business, for example at trade fairs.',s:'good',fb:'Correct.'},
   {t:'A trade promotion is an advert on TV.',s:'weak',fb:'An advert is advertising. Trade promotions reward resellers.'},
   {t:'Consumer promotions are aimed at travel agents.',s:'weak',fb:'Agents are resellers. Consumer promotions target guests.'}]},
  {label:'Classify the promotions',row:1,need:3,max:4,opts:[
   {t:'Stay seven nights and pay for six in the rainy months: a consumer promotion.',s:'good',fb:'Correct.'},
   {t:'A free observatory evening for returning guests: a consumer promotion.',s:'good',fb:'Correct.'},
   {t:'Familiarisation trips and extra commission for agents: trade promotions.',s:'good',fb:'Correct.'},
   {t:'Meeting agents at luxury travel trade fairs: a business promotion.',s:'good',fb:'Correct.'},
   {t:'Extra commission for agents: a consumer promotion.',s:'weak',fb:'Agents are resellers, so this is a trade promotion.'},
   {t:'Familiarisation trips: a business promotion.',s:'weak',fb:'They reward the agents who sell Soneva, so they are trade promotions.'}]},
  {label:'Why add value instead of cutting prices?',row:2,need:2,max:2,opts:[
   {t:'Heavy discounts could make a luxury brand look ordinary.',s:'good',fb:'Correct. This is the reason the case gives.'},
   {t:'Extras, like a free night or a special experience, reward guests without lowering the value of the stay.',s:'good',fb:'Correct.'},
   {t:'Soneva cannot afford discounts.',s:'weak',fb:'The case says the reason is the brand image, not money.'},
   {t:'Guests do not like low prices.',s:'weak',fb:'Too general. The point is protecting the luxury image.'}]}]}
]
};
