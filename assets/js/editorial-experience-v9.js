(() => {
  const path = location.pathname.replace(/\/{2,}/g,'/');
  const body = document.body;
  const main = document.querySelector('main');
  if (!body || !main || !body.classList.contains('concept-page')) return;
  body.classList.add('v9-acne-floor');

  const defaultRoute = [
    ['01','Clarify','Define the main concern and what has changed.'],
    ['02','Assess','Examine the pattern, severity, context and relevant risks.'],
    ['03','Plan','Choose treatment only after the likely diagnosis and priorities are clear.'],
    ['04','Review','Reassess response, tolerability and the next useful step.']
  ];

  const P = (match, data) => ({match, ...data});
  const profiles = [
    P(/^\/concept\/?$/,{
      family:'home',label:'Start here',stripTitle:'Choose the shortest useful route.',
      shortcuts:[
        ['Concern first','Acne, pigment, hair or a rash','concerns finder'],
        ['Treatment library','Already know the procedure?','treatments'],
        ['Clinic access','Doctor, branches and booking','doctor clinics']
      ],cta:'Book consultation',ctaHref:'/concept/book-appointment/',
      signal:null
    }),
    P(/\/acne-treatment\//,{
      family:'acne',label:'Acne',stripTitle:'What matters first with acne.',
      shortcuts:[
        ['Deep / painful','Earlier assessment is useful','when-to-see signs'],
        ['Leaving marks or scars','Control activity before scar work','possibilities route'],
        ['Keeps returning','Severity + triggers change the plan','assessment causes']
      ],cta:'Book acne assessment',ctaHref:'/concept/book-appointment/',
      signal:'Deep, painful acne or new scarring deserves earlier assessment rather than repeated product switching.',signalKeys:'when-to-see',
      topics:[
        ['Active acne','Breakouts first','Active inflammatory acne, severity and scar risk usually set the first priority.','If acne is still active, controlling new lesions commonly comes before scar procedures.','route'],
        ['Marks','Colour is not a scar','Red or brown post-acne marks are colour changes after inflammation; they are different from depressed scars.','The treatment strategy for marks is different from scar remodelling.','patterns'],
        ['Scars','Structure matters','Rolling, boxcar and ice-pick scars do not respond as one single problem.','Scar morphology is mapped before procedure selection.','possibilities'],
        ['Maintenance','Recurrence is possible','A plan may need a maintenance phase once active acne improves.','Follow-up can simplify or adjust treatment according to response.','route']
      ]
    }),
    P(/\/(acne-scar-treatment|mnrf-treatment|fractional-co2-laser)\//,{
      family:'scars',label:'Scar treatment',stripTitle:'Scar structure comes before the device.',
      shortcuts:[
        ['Map the scar','Rolling, boxcar, ice-pick or mixed','patterns assessment'],
        ['Active acne?','Stabilise new breakouts first','overview assessment'],
        ['Downtime + pigment risk','Skin type changes planning','route safety recovery']
      ],cta:'Book scar assessment',ctaHref:'/concept/book-appointment/',
      signal:'A single “scar package” is a weak plan: scar type, active acne, skin tone and downtime tolerance should shape the sequence.',signalKeys:'assessment route',
      topics:[
        ['Rolling','Tethering can matter','Broad depressions may involve fibrous tethering beneath the skin.','A surface-only treatment may not address every rolling scar.','patterns'],
        ['Boxcar','Edges + depth matter','Boxcar scars vary in depth and edge definition.','Procedure choice depends on morphology rather than one setting for everyone.','patterns'],
        ['Ice-pick','Narrow and deep','Deep narrow scars often behave differently from broad shallow depressions.','They may need a different focal strategy.','patterns'],
        ['Skin response','Pigment + recovery','Indian skin can develop post-inflammatory pigment change after procedures.','Energy, depth, intervals and aftercare should be planned conservatively.','route']
      ],route:[
        ['01','Stabilise','Control active acne and ongoing inflammation before aggressive scar work.'],
        ['02','Map','Identify scar morphology, depth, tethering and pigment tendency.'],
        ['03','Sequence','Combine or stage procedures according to the structures being treated.'],
        ['04','Review','Allow healing, compare consistent photographs and decide whether another step is useful.']
      ]
    }),
    P(/\/melasma-treatment\//,{
      family:'pigment',label:'Melasma',stripTitle:'Melasma is a maintenance condition.',
      shortcuts:[['Photoprotection','Daily light protection is foundational','assessment route'],['Triggers','Hormonal, heat and irritation context matters','assessment'],['Procedures','Not automatically first-line','route possibilities']],cta:'Book melasma assessment',ctaHref:'/concept/book-appointment/',
      signal:'Melasma can recur even after improvement; a procedure without photoprotection and maintenance is an incomplete plan.',signalKeys:'route',
      topics:[['Pattern','Confirm it is melasma','Distribution and history help distinguish melasma from other pigment disorders.','Not every facial brown patch is melasma.','patterns'],['Depth','Surface vs deeper pigment','Pigment depth and skin tone influence what can reasonably improve.','More aggressive treatment is not automatically better.','assessment'],['Triggers','Reduce repeated stimulation','Sunlight, visible light, heat, irritation and hormonal context can contribute.','Trigger control supports treatment.','assessment'],['Maintenance','Plan for recurrence','Long-term protection and maintenance often matter more than one intensive session.','Recurrence does not necessarily mean the original plan was pointless.','route']],route:[['01','Confirm','Confirm the pigment pattern and rule out look-alikes.'],['02','Protect','Build consistent photoprotection and reduce avoidable triggers.'],['03','Treat','Use suitable topical or procedural options according to skin and response.'],['04','Maintain','Step down or adjust while continuing protection and monitoring recurrence.']]
    }),
    P(/\/dark-circles-under-eye-treatment\//,{
      family:'pigment',label:'Under-eye',stripTitle:'Dark circles are not one diagnosis.',
      shortcuts:[['Pigment','Brown colour needs one approach','patterns assessment'],['Vessels / shadow','Blue-purple or hollowing differs','patterns'],['Eye-area safety','Anatomy changes procedure choice','assessment route']],cta:'Book under-eye assessment',ctaHref:'/concept/book-appointment/',
      signal:'Under-eye darkness can come from pigment, visible vessels, shadowing, thin skin or several factors together.',signalKeys:'assessment',
      topics:[['Pigment','Brown tone','Melanin-related colour behaves differently from structural shadow.','Treating “darkness” without identifying the component can disappoint.','assessment'],['Vascular','Blue / purple tone','Visible vessels and thin skin can contribute to colour.','Pigment-only treatment may miss this component.','assessment'],['Structure','Shadow + hollowing','Tear-trough anatomy and volume distribution can create shadow.','A brightening procedure cannot correct every structural cause.','assessment'],['Skin quality','Texture + fine lines','Thin or crepey skin can change how the area reflects light.','Eye-area treatment requires conservative anatomy-aware planning.','route']],route:defaultRoute
    }),
    P(/\/dark-lips-treatment\//,{
      family:'pigment',label:'Lip pigmentation',stripTitle:'First find what is driving the colour.',
      shortcuts:[['Habit / irritation','Lip licking, products and inflammation','assessment'],['Pattern','Diffuse vs focal colour matters','patterns'],['Procedure suitability','Laser is not for every cause','route treatment']],cta:'Book lip assessment',ctaHref:'/concept/book-appointment/',
      signal:'Persistent lip pigmentation may be influenced by irritation, habits, inflammation, medicines or natural variation; treatment starts with the cause.',signalKeys:'assessment',
      topics:[['Irritation','Barrier first','Repeated irritation can maintain pigment.','Removing the driver may matter as much as adding a procedure.','assessment'],['Natural variation','Not all colour is disease','Baseline lip colour varies naturally.','Goals should be realistic and diagnosis-led.','patterns'],['Inflammation','Treat active disease','Cheilitis or dermatitis can leave pigment behind.','Ongoing inflammation should be controlled before pigment procedures.','assessment'],['Procedure','Select carefully','Peels or laser may suit selected cases after assessment.','Response and recurrence vary.','route']],route:defaultRoute
    }),
    P(/\/freckles-treatment\//,{
      family:'pigment',label:'Freckles',stripTitle:'Confirm the spot before treating it.',
      shortcuts:[['Typical freckles','Small sun-responsive spots','patterns'],['Changing lesion','Diagnosis comes before cosmetic removal','assessment'],['Sun exposure','New pigment can return','route']],cta:'Book pigment assessment',ctaHref:'/concept/book-appointment/',
      signal:'A changing, irregular or unusual pigmented lesion should be assessed before it is treated as a freckle.',signalKeys:'assessment',
      topics:[['Freckle pattern','Small + sun-linked','Typical freckles often darken with ultraviolet exposure.','New lesions can appear even after older spots improve.','patterns'],['Lentigines','Not identical','Sun spots can resemble freckles but behave differently.','Diagnosis matters before device selection.','patterns'],['Atypical lesion','Do not laser first','Irregular or changing lesions need medical assessment.','Cosmetic treatment should not erase diagnostic clues.','assessment'],['Prevention','Sun still matters','Photoprotection helps reduce darkening and new sun-related pigment.','Maintenance matters after treatment.','route']],route:defaultRoute
    }),
    P(/\/(q-switched-laser-toning|ipl-photofacial|chemical-peels|sun-damage-treatment|pigmentation-treatment)\//,{
      family:'pigment',label:'Pigment / tone',stripTitle:'Diagnosis before brightening.',
      shortcuts:[['Pattern + depth','Melasma, PIH and sun spots differ','patterns compare'],['Active inflammation','Control what keeps making pigment','assessment'],['Recurrence','Maintenance changes outcomes','route treatment']],cta:'Book pigment assessment',ctaHref:'/concept/book-appointment/',
      signal:'Changing or unusual dark lesions should be diagnosed before cosmetic laser, peel or light treatment.',signalKeys:'assessment',
      topics:[['Melasma','Chronic + recurrent','Melasma commonly needs protection and maintenance rather than one aggressive procedure.','Laser or peel is not automatically the first step.','patterns'],['PIH','Inflammation leaves colour','Acne, dermatitis and procedures can leave post-inflammatory hyperpigmentation.','Control the inflammation that keeps creating new marks.','patterns'],['Sun spots','Defined pigment','Selected sun-related spots may respond differently from diffuse pigmentation.','Diagnosis and sun protection both matter.','compare'],['Procedure choice','Device follows diagnosis','Peel, Q-switched laser, IPL and topical care are not interchangeable.','Skin tone, depth, downtime and recurrence risk influence selection.','route']],route:[['01','Identify','Define the pigment pattern and exclude atypical lesions.'],['02','Stabilise','Control inflammation, triggers and photoprotection.'],['03','Select','Choose topical or procedural treatment according to diagnosis and skin.'],['04','Maintain','Protect the skin and review recurrence before escalating again.']]
    }),
    P(/\/hair-fall-treatment\//,{
      family:'hair',label:'Hair fall',stripTitle:'Hair loss starts with the pattern.',
      shortcuts:[['Shedding vs thinning','These suggest different pathways','patterns'],['Scalp symptoms','Dandruff, pain or scale matter','assessment'],['Sudden / patchy','Earlier diagnosis is useful','when-to-see assessment']],cta:'Book hair assessment',ctaHref:'/concept/book-appointment/',
      signal:'Sudden patchy loss, scalp inflammation or rapidly progressive thinning should be assessed before jumping straight to PRP or supplements.',signalKeys:'assessment',
      topics:[['Shedding','More hair entering shed phase','Diffuse shedding can follow stressors, illness, nutrition issues or other triggers.','History and timing matter.','patterns'],['Pattern thinning','Miniaturisation pattern','Gradual patterned thinning behaves differently from sudden shedding.','Long-term management may be needed.','patterns'],['Scalp disease','Inflammation changes the plan','Dandruff, psoriasis, fungal disease or scarring inflammation can affect hair.','Treat the scalp condition rather than masking it.','assessment'],['Procedures','Adjunct, not diagnosis','PRP/GFC or transplant only make sense in selected patterns.','The cause comes before the procedure.','route']],route:[['01','Classify','Decide whether the dominant pattern is shedding, thinning, patchy loss or scalp disease.'],['02','Look for cause','Review timeline, medicines, nutrition, illness, hormones and scalp findings.'],['03','Stabilise','Treat the underlying or active process before adding procedures.'],['04','Review','Track density, shedding and tolerance over time before changing direction.']]
    }),
    P(/\/alopecia-areata-treatment\//,{
      family:'hair',label:'Alopecia areata',stripTitle:'Smooth patches need diagnosis, not hair oil.',
      shortcuts:[['Patch activity','New / enlarging patches matter','patterns activity'],['Scalp exam','Look for classic clinical clues','assessment'],['Associated context','Nails and autoimmune history can matter','assessment']],cta:'Book patchy hair-loss assessment',ctaHref:'/concept/book-appointment/',
      signal:'Alopecia areata is different from patterned thinning and from fungal scalp disease; the treatment pathway is not interchangeable.',signalKeys:'assessment',
      topics:[['Patch pattern','Smooth focal loss','Alopecia areata often creates smooth patches rather than diffuse miniaturisation.','The pattern helps separate it from other causes.','patterns'],['Activity','Is it still spreading?','New patches or enlargement can change treatment goals.','Activity matters during follow-up.','activity'],['Nails','A useful clue','Some patients have nail changes alongside alopecia areata.','Associated findings can support assessment.','assessment'],['Regrowth','Response varies','Regrowth can occur, but recurrence is possible.','Review should focus on activity and sustained response.','route']],route:defaultRoute
    }),
    P(/\/seborrheic-dermatitis-dandruff\//,{
      family:'hair',label:'Dandruff / scalp',stripTitle:'Flaking is not always “dry scalp.”',
      shortcuts:[['Scale + redness','Inflammation changes care','patterns'],['Hair fall concern','Treat scalp disease separately','assessment'],['Maintenance','Recurrence is common','route']],cta:'Book scalp assessment',ctaHref:'/concept/book-appointment/',
      signal:'Seborrheic dermatitis often recurs; maintenance is usually more realistic than searching for a one-time cure.',signalKeys:'route',
      topics:[['Flaking','Scale pattern','Greasy or fine scale can occur with scalp inflammation.','Severity and distribution matter.','patterns'],['Redness / itch','Inflammation','Itching and redness suggest more than simple cosmetic flaking.','Control inflammation as well as scale.','patterns'],['Look-alikes','Psoriasis or fungal disease','Other scalp disorders can mimic dandruff.','Persistent or unusual patterns deserve assessment.','assessment'],['Maintenance','Keep control','Symptoms may return when treatment stops completely.','A practical maintenance plan can reduce flares.','route']],route:defaultRoute
    }),
    P(/\/hair-transplant\//,{
      family:'hair',label:'Hair transplant',stripTitle:'Donor area + diagnosis decide candidacy.',
      shortcuts:[['Stabilise loss','Ongoing thinning may continue','assessment'],['Donor supply','Finite hair must be planned','assessment'],['Hairline design','Natural density beats overpromising','route']],cta:'Book transplant assessment',ctaHref:'/concept/book-appointment/',
      signal:'A transplant redistributes existing follicles; it does not stop untreated progressive hair loss elsewhere.',signalKeys:'assessment',
      topics:[['Diagnosis','Is transplant the right tool?','Patterned permanent loss may be suitable; temporary shedding or active inflammatory loss needs another pathway.','Cause before surgery.','assessment'],['Donor','Finite resource','Density, calibre and safe donor area determine what can realistically be moved.','Donor overharvesting cannot be undone easily.','assessment'],['Design','Plan for future loss','Hairline design should account for age, face, donor supply and likely progression.','A dense low hairline is not automatically a good long-term plan.','route'],['Aftercare','Growth takes time','Transplanted hairs pass through a growth cycle before visible change develops.','Expect staged healing and delayed cosmetic assessment.','route']],route:[['01','Confirm candidacy','Diagnose the hair-loss pattern and assess stability.'],['02','Map donor + design','Estimate safe donor supply and plan a long-term hairline.'],['03','Transplant','Move selected follicular units using the planned surgical approach.'],['04','Protect + review','Follow healing, future native-hair loss and longer-term growth.']]
    }),
    P(/\/prp-gfc-hair-treatment\//,{
      family:'hair',label:'PRP / GFC',stripTitle:'Regenerative injections are not for every hair loss.',
      shortcuts:[['Diagnosis first','Pattern determines usefulness','assessment'],['Viable follicles','Destroyed follicles behave differently','patterns'],['Course + review','Response should be measured','route']],cta:'Book hair assessment',ctaHref:'/concept/book-appointment/',
      signal:'PRP/GFC should not replace diagnosis of iron deficiency, thyroid disease, alopecia areata, scarring alopecia or other causes.',signalKeys:'assessment',
      topics:[['Pattern thinning','Potential adjunct','Selected patterned hair loss may be considered for adjunctive injection therapy.','It is not a substitute for the rest of the plan.','patterns'],['Shedding','Find the trigger','Diffuse shedding may improve by correcting the cause rather than adding injections.','Timeline and medical context matter.','assessment'],['Scarring loss','Follicle destruction matters','When follicles are permanently destroyed, regenerative injections cannot recreate them.','Early diagnosis is important.','assessment'],['Tracking','Measure response','Photographs, density and shedding trend are more useful than day-to-day mirror checks.','Continue only when the pathway makes sense.','route']],route:defaultRoute
    }),
    P(/\/laser-hair-reduction\//,{
      family:'laser',label:'Laser hair reduction',stripTitle:'Hair colour + skin tone set the physics.',
      shortcuts:[['Hair calibre','Coarse dark hair responds differently','assessment'],['Skin tone','Settings must protect epidermal pigment','assessment'],['Hormonal growth','New hair can still develop','route']],cta:'Book laser assessment',ctaHref:'/concept/book-appointment/',
      signal:'Laser hair reduction means reduction, not a guarantee of zero hair forever; hormonal context and hair colour influence response.',signalKeys:'route',
      topics:[['Target','Melanin in the hair','Laser energy is selected to damage hair follicles while limiting skin injury.','Hair colour and calibre matter.','assessment'],['Cycles','Not every hair is active','Hair follicles cycle through growth phases, so treatment is staged.','One session cannot target every follicle equally.','route'],['Skin tone','Safety settings','Darker skin contains more competing epidermal pigment.','Device choice and conservative settings matter.','assessment'],['Hormones','New growth can occur','PCOS or other hormonal drivers can maintain or create new hair growth.','Medical context may need parallel management.','assessment']],route:[['01','Assess','Review skin tone, hair colour, calibre, area and hormonal context.'],['02','Patch / plan','Choose device parameters and treatment intervals for the individual.'],['03','Treat cycles','Repeat treatment as new hairs enter a responsive growth phase.'],['04','Maintain','Review residual growth and use maintenance only when needed.']]
    }),
    P(/\/laser-tattoo-removal\//,{
      family:'laser',label:'Tattoo removal',stripTitle:'Ink colour and depth change the route.',
      shortcuts:[['Colour','Black and multicolour behave differently','patterns'],['Cover-up / density','Layered ink may need more work','assessment'],['Sessions','Clearance is gradual','route']],cta:'Book tattoo assessment',ctaHref:'/concept/book-appointment/',
      signal:'Tattoo removal usually requires multiple sessions; complete clearance and scar-free removal cannot be guaranteed.',signalKeys:'route',
      topics:[['Black ink','Often the simplest target','Black pigment commonly absorbs useful laser wavelengths efficiently.','Depth and density still affect response.','patterns'],['Colours','Different wavelengths','Green, blue, red and other pigments can require different laser strategies.','One wavelength does not fit every colour.','patterns'],['Cover-ups','Layered pigment','Cover-up tattoos may contain dense or mixed layers.','Assessment should account for the underlying tattoo.','assessment'],['Spacing','Healing between sessions','The body needs time to clear fragmented pigment and the skin needs recovery.','Rushing sessions can increase risk without guaranteeing faster clearance.','route']],route:defaultRoute
    }),
    P(/\/hifu-treatment\//,{
      family:'aesthetic',label:'HIFU',stripTitle:'Laxity is not the same as volume loss.',
      shortcuts:[['Mild laxity','Where HIFU may fit','patterns'],['Volume loss','Tightening may not solve hollowing','assessment'],['HIFU vs RF','Energy + depth differ','compare route']],cta:'Book HIFU assessment',ctaHref:'/concept/book-appointment/',
      signal:'HIFU is not a non-surgical facelift substitute for severe laxity, and volume loss may need a different strategy.',signalKeys:'assessment',
      topics:[['Laxity','Mild-to-moderate looseness','Selected lower-face, jawline or neck laxity may be considered after assessment.','Severe excess skin usually needs a different conversation.','patterns'],['Volume','Hollowing is different','Loss of facial volume can create sagging or shadow that tightening alone may not correct.','Anatomy comes before device choice.','assessment'],['Depth','Focused ultrasound','Energy is placed at planned tissue depths rather than broadly warming the surface.','Mapping avoids treating every area identically.','route'],['Expectation','Gradual + modest','Collagen remodelling develops over time and results vary.','The goal should be improvement, not a surgical-equivalent promise.','route']],route:[['01','Map anatomy','Distinguish laxity from volume loss and assess treatment zones.'],['02','Choose depth','Select suitable treatment depths and settings for the device and anatomy.'],['03','Treat','Deliver focused ultrasound while monitoring contact and comfort.'],['04','Review','Allow collagen remodelling and reassess over the following months.']]
    }),
    P(/\/rf-skin-tightening\//,{
      family:'aesthetic',label:'Surface RF',stripTitle:'Surface RF ≠ RF microneedling.',
      shortcuts:[['Surface treatment','No needles in this pathway','compare'],['Heat monitoring','Comfort + temperature matter','route'],['RF vs HIFU','Different energy delivery','compare']],cta:'Book RF assessment',ctaHref:'/concept/book-appointment/',
      signal:'Non-invasive surface RF and needle-based RF microneedling have different indications, recovery and risk profiles.',signalKeys:'compare',
      topics:[['Surface RF','External applicator','Energy is delivered from the skin surface to create controlled tissue heating.','This page does not describe MNRF.','compare'],['Laxity','Selected mild looseness','Surface RF may be considered for selected facial or body skin laxity.','Severe structural sagging is a different problem.','patterns'],['Temperature','Controlled heating','Treatment comfort and tissue temperature guide safe delivery.','Sharp pain or intense focal heat should be reported immediately.','route'],['Comparison','RF vs HIFU','RF uses radiofrequency electrical energy; HIFU uses focused ultrasound.','Neither is automatically better for everyone.','compare']],route:defaultRoute
    }),
    P(/\/hydrafacial-medifacial\//,{
      family:'aesthetic',label:'Medifacial',stripTitle:'A facial should match the skin in front of you.',
      shortcuts:[['Congestion','Blackheads + oil need one approach','patterns'],['Sensitive / inflamed','Barrier problems need caution','assessment'],['Event glow','Temporary skin-quality goals','route']],cta:'Book skin-quality assessment',ctaHref:'/concept/book-appointment/',
      signal:'Inflamed acne, rosacea, eczema or a damaged skin barrier may need medical control before aggressive extraction or exfoliation.',signalKeys:'assessment',
      topics:[['Dehydrated','Hydration + barrier','Dry-looking skin may benefit from gentler hydration-focused steps.','Persistent dryness can signal dermatitis or over-exfoliation.','patterns'],['Congested','Surface blockage','Controlled cleansing, exfoliation and extraction may help selected superficial congestion.','Deep inflammatory acne needs a medical acne plan.','patterns'],['Reactive','Less can be more','Sensitive or inflamed skin should not receive the same aggressive protocol as oily resilient skin.','Assessment prevents over-treatment.','assessment'],['Event prep','Short-term polish','A facial may improve temporary radiance and surface feel.','It is not a replacement for treatment of underlying disease.','route']],route:defaultRoute
    }),
    P(/\/botulinum-toxin-dermal-fillers\//,{
      family:'aesthetic',label:'Injectables',stripTitle:'Anatomy before units or syringes.',
      shortcuts:[['Movement lines','Botulinum toxin targets muscle activity','compare'],['Volume / contour','Fillers address structure differently','compare'],['Risk zones','Medical history + anatomy matter','assessment']],cta:'Book injectable assessment',ctaHref:'/concept/book-appointment/',
      signal:'Botulinum toxin and dermal fillers solve different problems; neither should be selected from a fixed package without facial assessment.',signalKeys:'assessment',
      topics:[['Movement','Dynamic lines','Botulinum toxin can reduce selected muscle activity.','Dose and placement depend on anatomy and movement.','compare'],['Volume','Structural change','Fillers may be used for selected volume or contour concerns.','Product, plane and amount depend on anatomy and goal.','compare'],['Natural result','Preserve proportion','More product does not automatically mean a better result.','A conservative plan can protect facial character.','route'],['Safety','Know the anatomy','Injection risks vary by area and technique.','Consent should include relevant alternatives and complications.','assessment']],route:defaultRoute
    }),
    P(/\/(wart-mole-skin-tag-removal|dpn-seborrheic-keratosis-removal)\//,{
      family:'procedure',label:'Skin growths',stripTitle:'Identify it before you remove it.',
      shortcuts:[['Diagnosis','Benign growths can resemble others','assessment'],['Changing lesion','Do not treat cosmetically first','assessment'],['Removal method','Location + skin type matter','route']],cta:'Book lesion assessment',ctaHref:'/concept/book-appointment/',
      signal:'A changing, bleeding, irregular or uncertain growth should be assessed before cosmetic destruction or laser removal.',signalKeys:'assessment',
      topics:[['Skin tag','Soft + pedunculated','Skin tags are benign but can resemble other growths in some locations.','Confirmation comes before removal.','patterns'],['DPN / SK','Benign epidermal growths','DPN and seborrheic keratoses can be removed when diagnosis is secure and treatment is desired.','Pigment change is a relevant consideration in darker skin.','patterns'],['Mole / atypical','Do not erase clues','An unusual pigmented lesion may need dermoscopy or biopsy rather than cosmetic destruction.','Histology can matter when diagnosis is uncertain.','assessment'],['Method','Match technique to lesion','Snip, cautery, radiofrequency, curettage or another method may be considered depending on the lesion.','One removal method does not suit everything.','route']],route:defaultRoute
    }),
    P(/\/vitiligo-treatment\//,{
      family:'medical',label:'Vitiligo',stripTitle:'Activity changes the treatment plan.',
      shortcuts:[['New / enlarging patches','May indicate active disease','activity'],['Not every white patch','Rule out look-alikes','differentiate'],['Site matters','Face, hands and hair behave differently','patterns']],cta:'Book white-patch assessment',ctaHref:'/concept/book-appointment/',
      signal:'New or enlarging white patches change the clinical situation; confirming activity is important before choosing treatment.',signalKeys:'activity',
      topics:[['Diagnosis','White does not always mean vitiligo','Fungal disease, previous inflammation and other conditions can create pale patches.','Confirmation is the first useful step.','differentiate'],['Activity','Is pigment loss spreading?','New patches, enlargement or colour loss after injury can suggest activity.','Stable and active vitiligo are managed differently.','activity'],['Site','Response varies by area','Face and trunk may repigment differently from fingers, toes or areas with white hair.','Site changes expectations.','patterns'],['Stigma','Not contagious','Vitiligo cannot spread by touch, food or sharing household items.','The condition is autoimmune, not a hygiene problem.','myths']],route:[['01','Confirm','Differentiate vitiligo from fungal, inflammatory and other pale-patch conditions.'],['02','Assess activity','Map new or enlarging patches, hair colour and distribution.'],['03','Treat','Choose medical or procedural options according to site, age, extent and activity.'],['04','Review','Track spread and repigmentation, then adjust treatment or maintenance.']]
    }),
    P(/\/fungal-infection-treatment\//,{
      family:'medical',label:'Fungal infection',stripTitle:'Treat the fungus — not the temporary redness.',
      shortcuts:[['Steroid creams','Can mask and worsen fungal disease','assessment'],['Family / towel spread','Reinfection can matter','route'],['Finish the course','Stopping early increases recurrence','route']],cta:'Book rash assessment',ctaHref:'/concept/book-appointment/',
      signal:'Steroid-containing combination creams can temporarily reduce redness while allowing a fungal infection to spread or become harder to recognise.',signalKeys:'assessment',
      topics:[['Pattern','Ring-like is not enough','Fungal infection can vary in appearance and other rashes can mimic it.','Diagnosis still matters.','patterns'],['Moisture','Warm + sweaty areas','Occlusion, sweating and damp clothing can support recurrence.','Drying and clothing habits can support medical treatment.','assessment'],['Steroids','Masking is not curing','Potent steroid mixtures can alter the rash while fungus persists.','Avoid self-escalating combination creams.','assessment'],['Household','Reinfection loop','Shared towels, untreated close contacts or contaminated clothing can contribute in selected cases.','Breaking the loop can matter.','route']],route:defaultRoute
    }),
    P(/\/(eczema-atopic-dermatitis-treatment|contact-dermatitis-treatment)\//,{
      family:'medical',label:'Dermatitis',stripTitle:'First protect the barrier and find the trigger.',
      shortcuts:[['Active flare','Redness, itch and oozing need control','patterns'],['Trigger search','Products / work / friction may matter','assessment'],['Maintenance','Barrier care lowers repeat irritation','route']],cta:'Book dermatitis assessment',ctaHref:'/concept/book-appointment/',
      signal:'Repeatedly changing creams without identifying irritation, allergy or barrier damage can keep dermatitis cycling.',signalKeys:'assessment',
      topics:[['Barrier','Skin protection first','Dermatitis disrupts the skin barrier and increases sensitivity.','Gentle care supports medical treatment.','patterns'],['Irritant','Direct damage','Soaps, sanitizers, detergents and friction can irritate skin without a true allergy.','Exposure pattern matters.','assessment'],['Allergy','Delayed immune reaction','Contact allergy can look similar to irritation but may require avoidance and sometimes patch testing.','History and distribution guide suspicion.','assessment'],['Maintenance','Prevent the next flare','Once inflammation settles, trigger reduction and barrier care can help reduce recurrence.','A plan should include what to do between flares.','route']],route:defaultRoute
    }),
    P(/\/psoriasis-treatment\//,{
      family:'medical',label:'Psoriasis',stripTitle:'Severity is more than surface area.',
      shortcuts:[['Scalp / nails / folds','Special sites change treatment','patterns'],['Joint symptoms','Pain or stiffness matters','assessment'],['Long-term control','Psoriasis can recur','route']],cta:'Book psoriasis assessment',ctaHref:'/concept/book-appointment/',
      signal:'Joint pain, morning stiffness or swollen digits deserve attention because psoriasis can be associated with inflammatory arthritis.',signalKeys:'assessment',
      topics:[['Plaques','Classic raised scale','Thick scaly plaques are common but psoriasis has several patterns.','Location and extent influence treatment.','patterns'],['Special sites','Scalp, nails, folds','Small areas can still create high impact or need different treatment.','Severity is not only percentage of skin.','patterns'],['Joints','Ask beyond the skin','Pain, stiffness or swelling can suggest psoriatic arthritis.','Joint symptoms may need rheumatology input.','assessment'],['Maintenance','Chronic course','Psoriasis commonly waxes and wanes.','Long-term control is more realistic than a permanent cure promise.','route']],route:defaultRoute
    }),
    P(/\/urticaria-hives-treatment\//,{
      family:'medical',label:'Urticaria',stripTitle:'Hives are timed differently from most rashes.',
      shortcuts:[['Individual welt','Often fades within 24 hours','patterns'],['Swelling / breathing','Urgent symptoms need urgent care','assessment'],['Chronic hives','Daily triggers are not always obvious','route']],cta:'Book hives assessment',ctaHref:'/concept/book-appointment/',
      signal:'Breathing difficulty, throat swelling, faintness or rapidly worsening facial swelling requires urgent medical care rather than routine clinic booking.',signalKeys:'assessment',
      topics:[['Wheals','Transient raised welts','Typical hives move and fade, often within a day at one site.','Persistent fixed lesions may suggest another diagnosis.','patterns'],['Angioedema','Deeper swelling','Lips, eyelids or other areas may swell alongside hives.','Airway symptoms are urgent.','assessment'],['Chronic','More than six weeks','Long-lasting urticaria often has a different evaluation pathway from one-off acute hives.','A single food trigger is not always found.','patterns'],['Tracking','Patterns help','Timing, medicines, infections and physical triggers can be relevant.','A symptom diary can support assessment.','assessment']],route:defaultRoute
    }),
    P(/\/rosacea-treatment\//,{
      family:'medical',label:'Rosacea',stripTitle:'Redness, flushing and acne-like bumps are different clues.',
      shortcuts:[['Flushing','Heat / sun / spicy triggers may matter','patterns'],['Acne-like bumps','Not the same as acne','differentiate patterns'],['Eye symptoms','Ocular rosacea needs attention','assessment']],cta:'Book redness assessment',ctaHref:'/concept/book-appointment/',
      signal:'Rosacea can resemble acne, but aggressive acne products or repeated scrubbing may aggravate sensitive rosacea-prone skin.',signalKeys:'assessment',
      topics:[['Flushing','Episodes of redness','Heat, sun, alcohol, spicy food or emotion can trigger flushing in some people.','Trigger patterns are individual.','patterns'],['Persistent redness','Vessels + inflammation','Background redness and visible vessels can become more persistent.','Medical and device options address different components.','patterns'],['Bumps','Papules / pustules','Rosacea can create acne-like inflammatory bumps without blackheads.','Acne and rosacea treatment are not identical.','differentiate'],['Eyes','Ocular symptoms','Dry, gritty, red or irritated eyes can occur.','Eye involvement should be mentioned during assessment.','assessment']],route:defaultRoute
    }),
    P(/\/lichen-planus-treatment\//,{
      family:'medical',label:'Lichen planus',stripTitle:'The body site changes what matters.',
      shortcuts:[['Mouth','Painful erosive disease needs follow-up','patterns'],['Scalp / nails','Scarring or nail damage can be permanent','assessment'],['Genital disease','Not an STI, but needs diagnosis','patterns']],cta:'Book lichen planus assessment',ctaHref:'/concept/book-appointment/',
      signal:'Scalp, nail, oral and genital lichen planus can have different complications and may deserve closer follow-up than limited skin-only disease.',signalKeys:'assessment',
      topics:[['Skin','Itchy purple-brown bumps','Cutaneous lichen planus may leave dark marks after inflammation settles.','Appearance varies on deeper skin tones.','patterns'],['Mouth','White lace vs erosions','Oral disease can be painless or can create burning and ulcerated areas.','Persistent erosive disease needs review.','patterns'],['Scalp / nails','Protect structures','Scalp follicle damage can scar and nail disease can cause lasting change.','Earlier recognition matters.','assessment'],['Genital','Inflammatory, not infectious','Genital lichen planus is not sexually transmitted.','Diagnosis is important because several conditions look similar.','patterns']],route:defaultRoute
    }),
    P(/\/dr-cheena-langer\//,{
      family:'doctor',label:'Your dermatologist',stripTitle:'The useful trust signals, first.',
      shortcuts:[['Qualification','MBBS · MD Dermatology','credentials profile'],['Experience','20+ years in medicine','experience'],['Clinical scope','Medical, laser, hair + aesthetic','expertise services']],cta:'Book with Dr. Cheena',ctaHref:'/concept/book-appointment/',
      signal:'Treatment pages should connect back to who is assessing the patient—not just to a technology or procedure.',signalKeys:'expertise',topics:null
    }),
    P(/\/locations\/(karan-nagar|paloura)\//,{
      family:'location',label:'Clinic visit',stripTitle:'The visit essentials, before the story.',
      shortcuts:[['Directions','Open the branch map','directions map'],['Doctor timing','Plan around Dr. Cheena’s clinic hours','timing hours'],['Contact','Call or WhatsApp reception','contact phone']],cta:'Book this clinic',ctaHref:'/concept/book-appointment/',signal:null,topics:null
    }),
    P(/\/book-appointment\//,{
      family:'booking',label:'Booking',stripTitle:'Book without hunting for essentials.',
      shortcuts:[['Consultation','₹500 at either clinic','form consultation'],['Karan Nagar','Daytime doctor hours','clinic'],['Paloura','Evening doctor hours','clinic']],cta:'WhatsApp reception',ctaHref:'https://wa.me/917006613362',signal:null,topics:null
    }),
    P(/\/contact\//,{
      family:'contact',label:'Contact',stripTitle:'Call, message or get directions.',
      shortcuts:[['Primary','7006613362','contact'],['Alternative','9796676541','contact'],['Two clinics','Karan Nagar + Paloura','clinic']],cta:'WhatsApp reception',ctaHref:'https://wa.me/917006613362',signal:null,topics:null
    }),
    P(/\/conditions\//,{
      family:'index',label:'Medical concerns',stripTitle:'Start with the pattern, not a self-diagnosis.',
      shortcuts:[['Rash / itch','Inflammation, allergy or infection','medical'],['Pigment change','Dark, light or white patches','pigment'],['Hair / scalp','Shedding, patches or scale','hair']],cta:'Book dermatologist assessment',ctaHref:'/concept/book-appointment/',signal:null,topics:null
    }),
    P(/\/treatments\//,{
      family:'index',label:'Treatment library',stripTitle:'Choose by clinical goal, not trend.',
      shortcuts:[['Medical','Diagnosis + disease control','medical'],['Laser / device','Indication + skin type first','laser'],['Aesthetic','Anatomy + realistic change','aesthetic']],cta:'Book assessment',ctaHref:'/concept/book-appointment/',signal:null,topics:null
    }),
    P(/\/concept\//,{
      family:'generic',label:'Dermatology care',stripTitle:'Get to the relevant part faster.',
      shortcuts:[['Understand','What this concern actually is','overview pattern'],['Assessment','What changes the plan','assessment suitability'],['Next step','Treatment, recovery and review','route treatment']],cta:'Book consultation',ctaHref:'/concept/book-appointment/',
      signal:null,
      topics:[['Pattern','Start with what is present','The pattern, duration and distribution often change what is most likely.','Similar-looking concerns can need different treatment.','patterns'],['Context','History changes meaning','Previous treatment, medicines, triggers and medical context help interpret the skin finding.','Assessment is more than matching a photograph.','assessment'],['Treatment','Match tool to problem','A procedure or medicine should follow the likely diagnosis and priorities.','Avoid choosing a device only because it is popular.','route'],['Review','Response guides the next step','Follow-up helps decide whether to continue, adjust or stop.','More treatment is not always better treatment.','route']],route:defaultRoute
    })
  ];

  const profile = profiles.find(p => p.match.test(path)) || profiles[profiles.length-1];

  const directSections = () => [...main.children].filter(el => el.matches('section.editorial-section'));
  const sectionText = section => `${section.id || ''} ${section.querySelector('.section-no')?.textContent || ''} ${section.querySelector('h2')?.textContent || ''} ${section.getAttribute('aria-label') || ''}`.toLowerCase();
  const findSection = keys => {
    const terms = String(keys || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return null;
    return directSections().find(s => terms.some(k => sectionText(s).includes(k))) || null;
  };
  const ensureId = (section, seed='section') => {
    if (!section) return '';
    if (!section.id) section.id = `v9-${seed}-${Math.random().toString(36).slice(2,7)}`;
    return section.id;
  };
  const hrefForKeys = keys => {
    const target = findSection(keys);
    return target ? `#${ensureId(target,String(keys).split(/\s+/)[0])}` : '#v9-compass';
  };

  /* Reorder useful clinical information before lower-priority detail. */
  const score = section => {
    const t = sectionText(section);
    if (/overview|what .*is|pattern|type|sign|symptom|facts/.test(t)) return 10;
    if (/when to see|red flag|urgent|suitab|who may|candidate|differentiate|activity/.test(t)) return 14;
    if (/assessment|diagnos|before treatment|before .*laser|evaluation/.test(t)) return 20;
    if (/route|process|treatment route|how .*work|what happens|procedure/.test(t)) return 30;
    if (/possibilit|option|treatment|compare|approach|method/.test(t)) return 38;
    if (/risk|safety|downtime|recovery|aftercare|result|session|expect/.test(t)) return 48;
    if (/cost|price|clinic|doctor|location/.test(t)) return 58;
    if (/myth|research|evidence|reference|source|deep dive/.test(t)) return 72;
    if (/faq|question/.test(t)) return 84;
    return 44;
  };

  if (profile.family === 'home') {
    const wanted = ['concerns','finder','doctor','treatments','clinics','approach','directory'];
    const sections = directSections();
    const ordered = [];
    wanted.forEach(id => { const s = sections.find(x => x.id === id); if (s) ordered.push(s); });
    sections.forEach(s => { if (!ordered.includes(s)) ordered.push(s); });
    const anchor = [...main.children].find(el => el.classList.contains('stats-band')) || main.querySelector('.editorial-hero');
    let cursor = anchor;
    ordered.forEach(s => { cursor.after(s); cursor = s; });
  } else if (!['booking','contact','location'].includes(profile.family)) {
    const sections = directSections();
    const sorted = sections.map((s,i)=>({s,i,score:score(s)})).sort((a,b)=>a.score-b.score || a.i-b.i).map(x=>x.s);
    let cursor = main.querySelector('.editorial-hero');
    sorted.forEach(s => { if (cursor) { cursor.after(s); cursor = s; } });
  }

  /* Renumber visible editorial chapters after the priority sort. */
  let chapter = 1;
  directSections().forEach(section => {
    const no = section.querySelector('.section-no');
    if (!no) return;
    const label = no.textContent.includes('/') ? no.textContent.split('/').slice(1).join('/').trim() : no.textContent.trim();
    no.textContent = `${String(chapter++).padStart(2,'0')} / ${label}`;
  });

  /* Personalized shortcut strip. */
  const hero = main.querySelector('.editorial-hero');
  if (hero && !main.querySelector('.v9-priority-strip')) {
    const strip = document.createElement('section');
    strip.className = 'v9-priority-strip';
    strip.setAttribute('aria-label',`${profile.label} quick access`);
    const items = profile.shortcuts.slice(0,3).map(([label,title,keys]) => {
      const href = hrefForKeys(keys);
      return `<a class="v9-priority-item" href="${href}"><small>${label}</small><strong>${title}</strong><span>Jump to the relevant section</span></a>`;
    }).join('');
    const external = /^https?:/.test(profile.ctaHref || '');
    strip.innerHTML = `<div class="concept-shell"><div class="v9-priority-intro"><small>${profile.label} · quick route</small><strong>${profile.stripTitle}</strong></div>${items}<a class="v9-priority-cta" href="${profile.ctaHref || '/concept/book-appointment/'}"${external?' target="_blank" rel="noopener"':''}><small>Next step</small><strong>${profile.cta || 'Book consultation'}</strong></a></div>`;
    hero.after(strip);
  }

  /* Page-specific red-flag / reality strip after the first useful chapter. */
  if (profile.signal && !main.querySelector('.v9-signal-strip')) {
    const signal = document.createElement('section');
    signal.className = 'v9-signal-strip';
    const href = hrefForKeys(profile.signalKeys || 'assessment');
    signal.innerHTML = `<div class="concept-shell"><small>${profile.label} · important</small><strong>${profile.signal}</strong><a href="${href}">Why this matters →</a></div>`;
    const first = directSections()[0];
    (first || main.querySelector('.v9-priority-strip') || hero)?.after(signal);
  }

  /* Every clinical page gets a page-specific interactive compass unless it already
     has equivalent home/index/utility interactions. */
  if (profile.topics?.length && !main.querySelector('.v9-compass-section')) {
    const compassSection = document.createElement('section');
    compassSection.className = 'v9-compass-section';
    compassSection.id = 'v9-compass';
    const tabButtons = profile.topics.map((topic,i)=>`<button type="button" aria-selected="${i===0}" data-v9-compass-tab data-index="${i}" data-title="${topic[1].replace(/"/g,'&quot;')}" data-copy="${topic[2].replace(/"/g,'&quot;')}" data-note="${topic[3].replace(/"/g,'&quot;')}" data-keys="${topic[4] || ''}"><span>${String(i+1).padStart(2,'0')}</span><strong>${topic[0]}</strong></button>`).join('');
    const first = profile.topics[0];
    compassSection.innerHTML = `<div class="concept-shell"><div class="v9-compass-head"><small>${profile.label} · decision explorer</small><h2>The details that actually change the plan.</h2></div><div class="v9-compass"><div class="v9-compass-tabs" role="tablist">${tabButtons}</div><div class="v9-compass-stage" data-index="01"><small>Selected factor</small><h3>${first[1]}</h3><p>${first[2]}</p><strong>${first[3]}</strong><a href="${hrefForKeys(first[4])}">Open relevant section →</a></div></div></div>`;
    const sections = directSections();
    const insertAfter = findSection('assessment') || findSection('patterns') || sections[Math.min(1,sections.length-1)] || main.querySelector('.v9-signal-strip') || main.querySelector('.v9-priority-strip') || hero;
    insertAfter?.after(compassSection);

    const buttons = [...compassSection.querySelectorAll('[data-v9-compass-tab]')];
    const stage = compassSection.querySelector('.v9-compass-stage');
    buttons.forEach((button,i)=>button.addEventListener('click',()=>{
      buttons.forEach(b=>b.setAttribute('aria-selected',String(b===button)));
      stage.dataset.index = String(i+1).padStart(2,'0');
      stage.querySelector('h3').textContent = button.dataset.title;
      stage.querySelector('p').textContent = button.dataset.copy;
      stage.querySelector('strong').textContent = button.dataset.note;
      stage.querySelector('a').href = hrefForKeys(button.dataset.keys);
    }));
  }

  /* Weak pages receive a treatment/assessment pathway so they no longer stop
     after a few informational blocks. Existing Acne-style process stages win. */
  const shouldAddPath = profile.route?.length && !main.querySelector('.process-stage') && !main.querySelector('.v9-path-section') && !['home','index','doctor','booking','contact','location'].includes(profile.family);
  if (shouldAddPath) {
    const route = profile.route || defaultRoute;
    const section = document.createElement('section');
    section.className = 'v9-path-section';
    section.id = 'v9-care-path';
    section.innerHTML = `<div class="concept-shell"><div class="v9-path-head"><small>${profile.label} · clinical sequence</small><h2>A useful plan has an order.</h2></div><div class="v9-path-grid">${route.map(([n,t,c])=>`<article><span>${n}</span><div><h3>${t}</h3><p>${c}</p></div></article>`).join('')}</div></div>`;
    const after = findSection('assessment') || main.querySelector('.v9-compass-section') || directSections()[1] || directSections()[0];
    after?.after(section);
  }

  /* Semantic tones: dark default with occasional warm paper relief for long FAQ/evidence. */
  const darkCycle = ['coal','aubergine','forest','warm','coal','wine'];
  directSections().forEach((section,i)=>{
    const t = sectionText(section);
    let tone = darkCycle[i % darkCycle.length];
    if (/urgent|warning|when to see|red flag|safety/.test(t)) tone = 'wine';
    else if (/assessment|diagnos|suitab|activity/.test(t)) tone = 'forest';
    else if (/pattern|type|compare|explorer/.test(t)) tone = 'aubergine';
    else if (/route|process|treatment/.test(t)) tone = 'coal';
    else if (/faq|evidence|research|reference/.test(t)) tone = 'paper';
    section.dataset.v9Tone = tone;
  });

  /* Make existing sticky maps prioritize the clinically useful destinations. */
  const map = document.querySelector('.v7-page-map');
  if (map) {
    const list = map.querySelector('.concept-shell > div');
    if (list) {
      const priorityIds = profile.shortcuts.map(s => findSection(s[2])).filter(Boolean).map(s => `#${ensureId(s,'priority')}`);
      const anchors = [...list.querySelectorAll('a')];
      const high = anchors.filter(a => priorityIds.includes(a.getAttribute('href')));
      high.forEach(a=>a.dataset.v9Priority='high');
      high.reverse().forEach(a=>list.prepend(a));
    }
  }

  /* Conversion buttons should stay inside the premium concept. */
  document.querySelectorAll('a[href="/book-appointment/"]').forEach(a=>a.setAttribute('href','/concept/book-appointment/'));
  document.querySelectorAll('a[href="/contact/"]').forEach(a=>a.setAttribute('href','/concept/contact/'));

  /* Home: trust/doctor access before the broader treatment catalogue. */
  if (profile.family === 'home') {
    const doctor = document.getElementById('doctor');
    const treatments = document.getElementById('treatments');
    if (doctor && treatments) treatments.before(doctor);
  }
})();
