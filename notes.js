/* =====================================================================
   MKT101 study notes
   ---------------------------------------------------------------------
   One entry per paper. A paper with notes gets a "Study notes" tab.
   Definitions follow Armstrong & Kotler, Marketing: An Introduction,
   15th Global Edition. Plain, short sentences for Level 100 students.

   Topic format:
     sum:     one-line summary for the topic list
     lo:      what students must be able to do
     exam:    what the exam asks (general, never real exam questions)
     ideas:   [{h: heading, p: explanation, l: optional list, eg: Maldives example}]
     check:   [[question, answer]] shown with hidden answers
     prompts: three ready-made study prompts to copy into Gemini
   To add notes for the Final, add a final:{intro, topics:{8:{...}}} entry.
   ===================================================================== */

const NOTES={
midterm:{
 intro:"Short notes for each Midterm topic. Read the key ideas, test yourself with the check questions, then practise that topic. Your textbook is still the main source.",
 topics:{
 1:{sum:"What marketing is, needs, wants and demands, the five marketing orientations, and building customer relationships.",
  lo:"Explain the core ideas of marketing and how companies create value for customers and capture value in return.",
  exam:["Section A: define key terms, and spot an orientation or idea in a short business story.","Section B: explain a core idea with an example, or show how a local business could use it to win and keep customers."],
  ideas:[
   {h:"Marketing",p:"Marketing is the process by which companies engage customers, build strong customer relationships and create customer value, so that they capture value from customers in return. It is not only selling and advertising. Selling is just one small part.",eg:"A guesthouse on Maafushi that listens to guests, gives them a great stay and keeps in touch gets repeat bookings and good reviews in return."},
   {h:"Needs, wants and demands",p:"These three ideas build on each other.",l:["Needs: states of felt deprivation, such as hunger, safety or belonging.","Wants: the form a need takes, shaped by culture and personality.","Demands: wants backed by buying power."],eg:"Hunger is a need. Wanting mas huni and roshi is a want. Wanting it and having the money to buy it at a café is a demand."},
   {h:"Market offerings and marketing myopia",p:"A market offering is a mix of products, services, information or experiences offered to satisfy a need or want. Marketing myopia is the mistake of paying more attention to the product than to the benefits and experiences it gives.",eg:"A boat builder that only talks about its engines, and forgets that fishermen are buying a safe, reliable catch, has marketing myopia."},
   {h:"Exchange and markets",p:"An exchange is getting something you want from someone by offering something in return. A market is the set of all actual and possible buyers of a product."},
   {h:"The five marketing management orientations",p:"These are five ways a company can think about its marketing.",l:["Production concept: make products available and cheap.","Product concept: keep improving quality and features.","Selling concept: sell and promote hard.","Marketing concept: know target customers' needs and satisfy them better than competitors.","Societal marketing concept: balance company profit, customer wants and society's long-term interests."],eg:"A juice brand that cuts sugar and uses recyclable bottles follows the societal marketing concept."},
   {h:"Customer value and satisfaction",p:"Customer-perceived value is the customer's judgement of all the benefits and all the costs of an offer, compared with competitors. Customer satisfaction depends on how the product's performance compares with what the buyer expected.",eg:"If a speedboat transfer is on time, clean and friendly, the guest is satisfied. If staff also help with bags and give cold water, the guest is delighted."},
   {h:"Customer relationship management (CRM)",p:"CRM is the overall process of building and keeping profitable customer relationships by delivering superior customer value and satisfaction. Today, companies also use customer-engagement marketing, so the brand becomes part of customers' conversations and lives. Consumer-generated marketing is brand content made by customers themselves."},
   {h:"Capturing value from customers",p:"Loyal customers are worth a lot over time.",l:["Customer lifetime value: the value of all the purchases a customer makes over a lifetime of buying.","Share of customer: the portion of a customer's buying in a category that the company gets.","Customer equity: the total combined lifetime values of all the company's customers."],eg:"A diver who visits a dive centre every year for ten years is worth far more than one trip."}
  ],
  check:[
   ["What is the difference between a want and a demand?","A demand is a want backed by buying power. You can want something you cannot pay for, but it only becomes demand when you can buy it."],
   ["A phone shop pushes extended warranties on every customer to meet sales targets. Which orientation is this?","The selling concept. The shop focuses on making the sale, not on what the customer needs."],
   ["Give the meaning of customer satisfaction in one sentence.","It depends on how well a product's performance matches the buyer's expectations."],
   ["What is customer equity?","The total combined customer lifetime values of all the company's current and possible customers."]
  ],
  prompts:[
   "I am a Level 100 marketing student in the Maldives. Explain the difference between needs, wants and demands in simple English. Use two examples from Maldivian life. Then ask me three short questions, one at a time, to check that I understand.",
   "Explain the five marketing management orientations (production, product, selling, marketing and societal marketing) in simple English. For each one, give an example of a Maldivian business that might follow it. Make a short table at the end.",
   "Act as my marketing tutor. Give me a short story about a Maldivian guesthouse that wants more repeat guests. Ask me how it could use customer relationship management, customer lifetime value and customer engagement. Give me feedback on my answer."
  ]},
 2:{sum:"Strategic planning, the mission, the BCG matrix, growth strategies, the value chain and the marketing mix.",
  lo:"Explain how a company plans its strategy, and how marketing fits into the plan with partners and the marketing mix.",
  exam:["Section A: define planning terms, and place a business in the BCG matrix or the growth grid.","Section B: explain a planning tool, or apply it to a Maldivian company's options."],
  ideas:[
   {h:"Strategic planning",p:"Strategic planning is developing and keeping a fit between the organisation's goals and abilities and its changing marketing opportunities. It has four steps.",l:["Define the company mission.","Set company objectives and goals.","Design the business portfolio.","Plan marketing and other functional strategies."]},
   {h:"The mission statement",p:"A mission statement is a statement of the organisation's purpose: what it wants to achieve in the wider environment. A good mission is market-oriented. It is about meeting basic customer needs, not about products.",eg:"Not 'we run boats', but 'we connect island families safely and on time'."},
   {h:"The business portfolio and the BCG matrix",p:"The business portfolio is the collection of businesses and products that make up a company. The BCG growth-share matrix sorts them by market growth rate and relative market share.",l:["Stars: high share, high growth. Need money to keep growing.","Cash cows: high share, low growth. Bring in cash.","Question marks: low share, high growth. Need money; may become stars.","Dogs: low share, low growth. Weak sources of cash."],eg:"A resort group's well-known villa brand in a market that has stopped growing is a cash cow."},
   {h:"Four strategies for each business",p:"After the BCG analysis, the company chooses a strategy for each business: build (invest to grow share), hold (keep share), harvest (take short-term cash) or divest (sell or close)."},
   {h:"The product/market expansion grid",p:"This grid shows four ways to grow.",l:["Market penetration: more sales of current products to current customers.","Market development: current products in new markets.","Product development: new or changed products for current customers.","Diversification: new products in new markets."],eg:"A Malé bakery that opens a branch in Addu is using market development."},
   {h:"Downsizing",p:"Downsizing means cutting the portfolio by dropping businesses or products that are no longer profitable or that no longer fit the strategy."},
   {h:"Partnering to build relationships",p:"The value chain is the series of departments inside the company that create value. The value delivery network is wider: the company, its suppliers, distributors and customers working together to improve the whole system."},
   {h:"Marketing strategy and the marketing mix",p:"The company decides which customers it will serve (segmentation and targeting) and how (differentiation and positioning). It then uses the marketing mix, the four Ps: product, price, place and promotion."},
   {h:"Managing the marketing effort",p:"Marketing management has four functions.",l:["Analysis: often a SWOT analysis of strengths, weaknesses (inside), opportunities and threats (outside).","Planning: choosing strategies and writing the plan.","Implementation: turning plans into actions.","Control: measuring results and fixing problems."],eg:"More tourists from India is an opportunity for a guesthouse. Old, slow coffee machines are a café's weakness."},
   {h:"Measuring marketing return",p:"Return on marketing investment (marketing ROI) is the net return from a marketing investment divided by its cost."}
  ],
  check:[
   ["What makes a mission statement market-oriented?","It defines the business by the customer needs it meets, not by the products it makes."],
   ["A business has high share in a low-growth market. Where does it sit in the BCG matrix?","It is a cash cow."],
   ["A Maldivian airline starts selling travel insurance to new customers abroad. Which growth strategy is this?","Diversification: a new product in a new market."],
   ["Is 'rising fuel prices' a weakness or a threat for a ferry company? Why?","A threat. It comes from outside the company, and the company cannot control it."]
  ],
  prompts:[
   "I am a Level 100 marketing student in the Maldives. Explain the BCG growth-share matrix in simple English. Use an imaginary Maldivian company with four businesses and put each one in the matrix. Then quiz me with three questions, one at a time.",
   "Explain the product/market expansion grid in simple English. Give one example of each growth strategy for a small café in Malé. Then give me two new examples and ask me to name the strategy.",
   "Help me practise SWOT analysis. Describe a small guesthouse on a local island in the Maldives in five sentences. Ask me to write one strength, weakness, opportunity and threat. Then check my answers and explain any mistakes."
  ]},
 3:{sum:"The microenvironment, the six macroenvironment forces, publics, and how companies respond to change.",
  lo:"Describe the forces in a company's marketing environment and explain how changes in them affect marketing decisions.",
  exam:["Section A: name the actor or force behind a change, and know the types of publics and markets.","Section B: explain the two environments, or analyse how changes in the environment affect a Maldivian business."],
  ideas:[
   {h:"Marketing environment",p:"The marketing environment is the actors and forces outside marketing that affect the company's ability to build and keep good relationships with target customers. It has two parts: the microenvironment and the macroenvironment."},
   {h:"The microenvironment",p:"The microenvironment is the actors close to the company that affect its ability to serve its customers.",l:["The company: its own departments, such as finance, operations and HR.","Suppliers: provide the resources the company needs.","Marketing intermediaries: help promote, sell and distribute, such as resellers, logistics firms, agencies and banks.","Competitors: the company must give more value than they do.","Publics: groups with an interest in, or impact on, the company.","Customers: consumer, business, reseller, government and international markets."],eg:"For a café in Malé, a late milk shipment from India is a supplier problem."},
   {h:"Types of publics",p:"A public is any group that has an actual or possible interest in, or impact on, an organisation's ability to achieve its goals.",l:["Financial publics: banks and investors.","Media publics: news websites, TV, bloggers.","Government publics: ministries and councils.","Citizen-action publics: consumer and environmental groups.","Internal publics: staff, managers and the board.","Local publics: neighbours and community groups.","General public: the wider public's view of the company."]},
   {h:"The macroenvironment",p:"The macroenvironment is the larger societal forces that affect the whole microenvironment. There are six forces.",l:["Demographic: population size, age, location, gender and occupation.","Economic: income, prices and spending patterns.","Natural: natural resources and the planet.","Technological: new technologies.","Political and social: laws, government agencies and pressure groups.","Cultural: values, beliefs and ways of life."]},
   {h:"Demographic and economic forces",p:"Demography is the study of human populations. Marketers watch age groups, family types and where people live. The economic environment covers buying power and how people spend.",eg:"Many young families moving to Hulhumalé, and families spending more on rent and less on eating out."},
   {h:"Natural and technological forces",p:"The natural environment includes the resources marketers need and the effects of marketing on nature. Technology creates new products and new ways to reach customers.",eg:"Coral bleaching and beach erosion affect resorts. Booking apps and mobile wallets change how guests pay."},
   {h:"Political, social and cultural forces",p:"Laws protect companies, consumers and society. Cultural values change slowly. Core beliefs are passed from parents to children and are hard to change. Secondary beliefs change more easily.",eg:"A new Green Tax rule is political. More young people choosing healthy food is a cultural shift."},
   {h:"Responding to the environment",p:"A reactive company watches the environment and reacts to it. A proactive company takes action to shape the publics and forces in its environment.",eg:"Guesthouse owners who meet the government to ask for fairer licence fees are being proactive."}
  ],
  check:[
   ["What is the main difference between the microenvironment and the macroenvironment?","The microenvironment is the actors close to the company. The macroenvironment is the larger societal forces that affect all of them."],
   ["A bank refuses a loan to a guesthouse. Which type of public is the bank?","A financial public."],
   ["Name the six macroenvironment forces.","Demographic, economic, natural, technological, political and social, and cultural."],
   ["More tourists now pay with mobile wallets. Which force is this?","The technological environment."]
  ],
  prompts:[
   "I am a Level 100 marketing student in the Maldives. Explain the six forces of the macroenvironment in simple English, with one Maldivian example for each. Then give me four news-style sentences and ask me to name the force in each one.",
   "Explain the actors in a company's microenvironment using a Maldivian resort as the example. Make a simple table with the actor, who it is for the resort, and how it can help or harm the resort.",
   "Act as my tutor. Describe a Maldivian food company facing two changes in its environment. Ask me to name the force behind each change and suggest a marketing response. Then give me feedback."
  ]},
 4:{sum:"Marketing information systems, primary and secondary data, the research process, research approaches and sampling.",
  lo:"Explain how companies gather and use marketing information, and apply the marketing research process to a real problem.",
  exam:["Section A: tell types of data, research and samples apart, and name the method in a short story.","Section B: explain the parts of a marketing information system or a research idea, or plan research for a Maldivian business."],
  ideas:[
   {h:"Marketing information system (MIS)",p:"An MIS is the people and procedures that help managers assess their information needs, develop the needed information, and help them use it for customer and market insights. Information comes from three main sources.",l:["Internal databases: the company's own records, such as sales, bookings and customer data.","Marketing intelligence: public information about consumers, competitors and the market.","Marketing research: studies designed for a specific problem."]},
   {h:"Primary and secondary data",p:"Secondary data is information that already exists, collected for another purpose. Primary data is new information collected for the problem at hand. Secondary data is usually faster and cheaper. Primary data is more relevant and up to date.",eg:"Tourist arrival figures from the tourism ministry are secondary data. A survey of your own guests is primary data."},
   {h:"The marketing research process",p:"The textbook gives four steps.",l:["Define the problem and research objectives.","Develop the research plan.","Implement the plan: collect and analyse the data.","Interpret and report the findings."]},
   {h:"Three types of research objective",p:"Each objective needs a different kind of research.",l:["Exploratory: gather early information to define the problem.","Descriptive: describe things, such as market size or customer attitudes.","Causal: test cause-and-effect relationships."],eg:"Testing whether a lower price makes more people buy a juice is causal research."},
   {h:"Research approaches",p:"There are three main ways to gather primary data.",l:["Observational research: watch people, actions and situations. Ethnographic research watches people in their natural setting.","Survey research: ask people questions about their knowledge, attitudes and behaviour.","Experimental research: give matched groups different treatments and compare the results."]},
   {h:"Contact methods",p:"Data can be collected by mail, telephone, personal interview or online. Personal interviews can be with one person or with a small group (a focus group of 6 to 10 people). Online research includes online surveys, online focus groups and social media listening."},
   {h:"Sampling",p:"A sample is a group chosen to represent the whole population. Researchers decide who to survey, how many, and how to choose them.",l:["Probability samples: every member has a known chance of being chosen, for example a simple random sample or a stratified random sample.","Non-probability samples: for example a convenience sample (easiest people to reach) or a judgement sample."]},
   {h:"Research instruments",p:"The questionnaire is the most common instrument. Closed-end questions list all possible answers. Open-end questions let people answer in their own words."},
   {h:"Big data and marketing analytics",p:"Big data is the very large and complex data sets produced by today's technologies. Marketing analytics is the tools and processes used to find patterns in that data and gain customer insights. Companies must protect customer privacy."}
  ],
  check:[
   ["A guesthouse uses tourist arrival figures published by the tourism ministry. Is this primary or secondary data?","Secondary data. It already exists and was collected by someone else for another purpose."],
   ["Which research type would you use first when the problem is not clear?","Exploratory research."],
   ["What is the difference between a simple random sample and a convenience sample?","In a simple random sample everyone has an equal chance of being chosen. A convenience sample uses whoever is easiest to reach."],
   ["Name the four steps of the marketing research process.","Define the problem and objectives, develop the research plan, implement the plan, and interpret and report the findings."]
  ],
  prompts:[
   "I am a Level 100 marketing student in the Maldives. Explain the difference between primary and secondary data in simple English. Give three Maldivian examples of each. Then give me five examples and ask me to sort them.",
   "Explain exploratory, descriptive and causal research in simple English, with one example each for a Maldivian business. Then describe two research problems and ask me which type fits each one.",
   "Act as my tutor. A small café in Hulhumalé wants to know why fewer students are coming in. Ask me to plan the research step by step: the problem, the data, the method and the sample. Give me feedback after each step."
  ]},
 5:{sum:"What shapes consumer buying, the four types of buying behaviour, the buyer decision process, and business buyers.",
  lo:"Explain the factors that influence consumer and business buyers, and apply them to real buying decisions.",
  exam:["Section A: name the factor, behaviour type or stage in a short buying story.","Section B: explain a model of buying, or show how a factor influences Maldivian buyers and how a business can use it."],
  ideas:[
   {h:"The model of consumer behaviour",p:"Marketing and other stimuli enter the buyer's 'black box'. The buyer's characteristics and decision process then shape the response: what, where, when and how much they buy."},
   {h:"Cultural factors",p:"Culture is the most basic cause of a person's wants and behaviour. It is learned from family, school and society.",l:["Culture: the values, perceptions and behaviours we learn.","Subculture: a group with shared values from common experiences, such as nationality, religion or region.","Social class: fairly permanent, ordered divisions in a society whose members share similar values and behaviours."]},
   {h:"Social factors",p:"Other people shape what we buy.",l:["Groups and social networks, including membership groups and reference groups.","Opinion leaders: people whose status or expertise influences others.","Family: often the strongest influence.","Roles and status: what a person is expected to do, and the respect that goes with it."],eg:"A teenager buys the same trainers as a Maldivian footballer she follows on Instagram."},
   {h:"Personal factors",p:"A buyer's own life also matters.",l:["Age and life-cycle stage.","Occupation.","Economic situation.","Lifestyle: activities, interests and opinions.","Personality and self-concept."]},
   {h:"Psychological factors",p:"Four factors work inside the buyer's mind.",l:["Motivation: Maslow's needs go from physiological, to safety, social, esteem and self-actualisation.","Perception: how we select, organise and interpret information. It includes selective attention, selective distortion and selective retention.","Learning: changes in behaviour that come from experience.","Beliefs and attitudes: attitudes are consistent feelings about an object or idea, and are hard to change."]},
   {h:"Four types of buying behaviour",p:"They depend on how involved the buyer is, and how different the brands are.",l:["Complex: high involvement, big brand differences, such as a laptop.","Dissonance-reducing: high involvement, few differences, such as a sofa.","Habitual: low involvement, few differences, such as salt.","Variety-seeking: low involvement, big differences, such as biscuits."]},
   {h:"The buyer decision process",p:"Buyers go through five stages: need recognition, information search, evaluation of alternatives, purchase decision and post-purchase behaviour. After buying, the buyer may feel cognitive dissonance: discomfort from doubts about the choice."},
   {h:"Business buyer behaviour",p:"Business markets have fewer but larger buyers, and their demand is derived from consumer demand. Everyone involved in a buying decision forms the buying centre.",l:["Straight rebuy: reorder with no changes.","Modified rebuy: change the product, price or supplier.","New task: buy something for the first time."],eg:"A new resort buying its first desalination plant is a new task. Monthly cleaning chemicals are a straight rebuy."}
  ],
  check:[
   ["What is the most basic cause of a person's wants and behaviour?","Culture."],
   ["A shopper buys whatever brand of sugar is on the shelf without thinking. Which buying behaviour is this?","Habitual buying behaviour."],
   ["Name the five stages of the buyer decision process in order.","Need recognition, information search, evaluation of alternatives, purchase decision, post-purchase behaviour."],
   ["What is derived demand?","Business demand that comes from the demand for consumer goods."]
  ],
  prompts:[
   "I am a Level 100 marketing student in the Maldives. Explain the cultural, social, personal and psychological factors that affect consumer buying, in simple English. Give one Maldivian example for each group. Then quiz me with four questions, one at a time.",
   "Explain the four types of buying behaviour (complex, dissonance-reducing, habitual and variety-seeking) in simple English. Use a 2 by 2 table. Then give me six Maldivian products and ask me to place each one.",
   "Act as my tutor. Tell me a short story about a Maldivian student buying a new phone. Stop at each stage of the buyer decision process and ask me which stage it is and what a phone shop could do at that stage."
  ]},
 6:{sum:"Segmentation, targeting, differentiation and positioning: choosing customers and a clear place in their minds.",
  lo:"Apply market segmentation, targeting, differentiation and positioning to design a customer value-driven strategy.",
  exam:["Section A: name the segmentation base, targeting strategy or value proposition in a short story.","Section B: explain the steps or requirements, or recommend a target market and position for a Maldivian business."],
  ideas:[
   {h:"Four steps of a customer value-driven strategy",p:"Two steps choose the customers. Two steps decide how to serve them.",l:["Segmentation: divide the market into smaller groups with different needs.","Targeting: choose one or more segments to serve.","Differentiation: make the offer different to create superior value.","Positioning: give the offer a clear, distinctive and desirable place in target customers' minds."]},
   {h:"Bases for segmenting consumer markets",p:"There are four main bases.",l:["Geographic: countries, regions, atolls, islands.","Demographic: age, gender, income, occupation, family life cycle.","Psychographic: lifestyle, personality, social class.","Behavioural: occasions, benefits sought, user status, usage rate, loyalty."],eg:"A resort that groups guests into honeymooners, families and divers is using several bases together."},
   {h:"Requirements for useful segments",p:"Good segments are measurable, accessible, substantial, differentiable and actionable. A segment that is too small or cannot be reached is not useful."},
   {h:"Targeting strategies",p:"Companies can target broadly or narrowly.",l:["Undifferentiated (mass) marketing: one offer for the whole market.","Differentiated marketing: separate offers for several segments.","Concentrated (niche) marketing: a big share of one or a few small segments.","Micromarketing: local marketing for local groups, or individual marketing for one customer."],eg:"A small dive shop that serves only experienced technical divers is a niche marketer."},
   {h:"Differentiation and competitive advantage",p:"A competitive advantage is an advantage over competitors gained by offering greater customer value. Companies can differentiate by product, service, channel, people or image.",eg:"A guesthouse with a resident marine biologist offers a service difference rivals cannot easily copy."},
   {h:"Positioning maps and value propositions",p:"A perceptual positioning map shows how buyers see brands on key dimensions, such as price and quality. The value proposition is the full mix of benefits a brand offers. Winning value propositions are: more for more, more for the same, the same for less, less for much less, and more for less."},
   {h:"The positioning statement",p:"A positioning statement sums up the position in one sentence. Form: To (target segment and need) our (brand) is (concept) that (point of difference).",eg:"To busy office workers in Malé who want a quick healthy lunch, Fresh Bowl is the salad bar that serves your meal in under five minutes."}
  ],
  check:[
   ["What is the difference between segmentation and targeting?","Segmentation divides the market into groups. Targeting chooses which of those groups to serve."],
   ["A phone shop groups customers by how often they upgrade their phone. Which base is this?","Behavioural segmentation (usage rate)."],
   ["Name the five requirements for useful segments.","Measurable, accessible, substantial, differentiable and actionable."],
   ["A resort offers private butlers at a very high price. Which value proposition is this?","More for more."]
  ],
  prompts:[
   "I am a Level 100 marketing student in the Maldives. Explain the four bases for segmenting consumer markets in simple English. For a local airline, give one segment for each base. Then ask me to segment a different Maldivian business.",
   "Explain the four targeting strategies (undifferentiated, differentiated, concentrated and micromarketing) in simple English with Maldivian examples. Then describe three businesses and ask me which strategy each one uses.",
   "Act as my tutor. Help me write a positioning statement for a new guesthouse on a local island. Ask me questions about the target customers and the point of difference, one at a time. Then check my final statement against the textbook form."
  ]},
 7:{sum:"Levels of product, types of products, product and brand decisions, and the special nature of services.",
  lo:"Explain product, service and brand decisions, and apply them to products and services in the Maldives.",
  exam:["Section A: classify products, name service characteristics, and know product mix and brand terms.","Section B: explain a product or service idea, or apply product and brand decisions to a Maldivian business."],
  ideas:[
   {h:"Product and service",p:"A product is anything that can be offered to a market for attention, use or consumption that might satisfy a want or need. A service is an activity or benefit that is intangible and does not result in owning anything."},
   {h:"Three levels of product",p:"Each level adds more customer value.",l:["Core customer value: the benefit the customer is really buying.","Actual product: the features, design, quality, brand name and packaging.","Augmented product: extra services and benefits, such as warranty, delivery and support."],eg:"A mobile data plan sells staying connected with family (core), a 30 GB bundle with a brand name and an app (actual), and free customer support around the clock (augmented)."},
   {h:"Consumer products",p:"Consumer products are grouped by how people buy them.",l:["Convenience: bought often with little effort, such as bread and phone top-ups.","Shopping: compared on quality, price and style, such as phones and furniture.","Specialty: unique products buyers make a special effort for, such as a luxury watch.","Unsought: products people do not think of buying, such as life insurance."]},
   {h:"Industrial products",p:"Industrial products are bought for further processing or for use in running a business. They include materials and parts, capital items such as boats and generators, and supplies and services."},
   {h:"Individual product decisions",p:"Companies make five main decisions: product and service attributes (quality, features, style and design), branding, packaging, labelling, and product support services."},
   {h:"Product line and product mix",p:"A product line is a group of closely related products. The product mix is all the lines and items a company sells.",l:["Width: the number of product lines.","Length: the total number of items in the lines.","Depth: the number of versions of each product.","Consistency: how closely the lines are related."]},
   {h:"Four characteristics of services",p:"Services are different from physical goods.",l:["Intangibility: cannot be seen or felt before buying.","Inseparability: cannot be separated from the people who provide them.","Variability: quality depends on who provides it, and when and where.","Perishability: cannot be stored for later sale or use."],eg:"An empty seat on today's ferry cannot be sold tomorrow. That is perishability."},
   {h:"Marketing strategies for services",p:"The service profit chain links service firm profits with employee and customer satisfaction. Internal marketing trains and motivates staff to work as a team. Interactive marketing trains staff in the skill of serving customers well."},
   {h:"Brands and brand strategy",p:"Brand equity is the extra effect that knowing the brand name has on customer response to the product. Key brand decisions include positioning, name selection, sponsorship and development.",l:["Sponsorship: national (manufacturer) brand, store (private) brand, licensing or co-branding.","Development: line extensions, brand extensions, multibrands or new brands."],eg:"An airline and a bank that launch a joint credit card are co-branding."}
  ],
  check:[
   ["What is the difference between the actual product and the augmented product?","The actual product is the product itself: features, design, brand and packaging. The augmented product adds extra services and benefits, such as delivery or a warranty."],
   ["Guests get very different service depending on which staff member is on duty. Which service characteristic is this?","Variability."],
   ["A tuna brand adds a new chilli flavour under its existing name. Which brand development strategy is this?","A line extension."],
   ["Into which group of consumer products does life insurance usually fall?","Unsought products."]
  ],
  prompts:[
   "I am a Level 100 marketing student in the Maldives. Explain the three levels of product in simple English. Show all three levels for a speedboat transfer service and for a café in Malé. Then ask me to do the same for a dive centre.",
   "Explain the four characteristics of services (intangibility, inseparability, variability and perishability) in simple English. For each one, give a Maldivian tourism example and one way a business can manage it. Then quiz me with four questions.",
   "Act as my tutor. Explain the four brand development strategies (line extension, brand extension, multibrands and new brands) using a Maldivian food brand. Then give me three new product ideas and ask me which strategy fits each one."
  ]}
 }
}
};
