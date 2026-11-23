// Vishnu Sahasranama: structured, partial. Only the parts below are present; everything else is clearly marked pending.
// To complete it, add verses to the `Namavali` group (ids v4, v5 ...) and replace the pending block. No UI change is needed.
export const VISHNU_SAHASRANAMA={
 id:'vishnu-sahasranama',title:'Vishnu Sahasranama',category:'vishnu',kind:'scripture',chantable:false,
 keywords:['sahasranamam','sahasranam','thousand names','vishnu 1000 names','bhishma','yudhishthira','shuklambaradharam','vishvam vishnur'],
 summary:'The thousand names of Vishnu, from the Mahabharata. Structure ready; text being added.',
 explanation:'The Vishnu Sahasranama is a hymn of one thousand names of Vishnu taught by Bhishma to Yudhishthira in the Anushasana Parva of the Mahabharata. Each name reveals a quality of the Divine. This section is built with a dhyana (meditation), the namavali verses, and a closing section, so the full text can be added verse by verse.',
 pronunciation:'Chant slowly and evenly. Long vowels (ā, ī, ū) are held about twice as long as short ones.',
 source:'Mahabharata, Anushasana Parva',
 status:{text:'pending',note:'Introduction, the opening dhyana verse and verses 1 to 3 are added and still need checking against a printed edition. The rest of the namavali and the phalashruti are not yet added, so nothing has been invented.'},
 sections:[
  {id:'intro',group:'Introduction',label:'About this text',en:'Yudhishthira asks Bhishma, lying on his bed of arrows, who the one supreme refuge is and by what name he may be praised. Bhishma answers with the thousand names of Vishnu. Reciting them is said to bring peace of mind, protection and devotion.'},
  {id:'dhyana',group:'Dhyana',label:'Opening dhyana',sa:'शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्।\nप्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥',tr:'Śuklāmbaradharaṁ viṣṇuṁ śaśivarṇaṁ caturbhujam\nPrasannavadanaṁ dhyāyet sarvavighnopaśāntaye',en:'One should meditate on Vishnu, clad in white, moon-coloured, four-armed and with a serene face, so that all obstacles may be calmed.',status:'needs-verification'},
  {id:'v1',group:'Namavali',label:'Verse 1',sa:'ॐ विश्वं विष्णुर्वषट्कारो भूतभव्यभवत्प्रभुः।\nभूतकृद्भूतभृद्भावो भूतात्मा भूतभावनः॥१॥',tr:'Oṁ viśvaṁ viṣṇur vaṣaṭkāro bhūta-bhavya-bhavat-prabhuḥ\nBhūtakṛd bhūtabhṛd bhāvo bhūtātmā bhūtabhāvanaḥ',en:'Names: Vishvam (the universe), Vishnu (the all-pervading), Vashatkara (the one invoked by "vashat"), Lord of past, future and present, Creator of beings, Sustainer of beings, Bhava (the one who is), Self of all beings, Nourisher of beings.',status:'needs-verification'},
  {id:'v2',group:'Namavali',label:'Verse 2',sa:'पूतात्मा परमात्मा च मुक्तानां परमा गतिः।\nअव्ययः पुरुषः साक्षी क्षेत्रज्ञोऽक्षर एव च॥२॥',tr:'Pūtātmā paramātmā ca muktānāṁ paramā gatiḥ\nAvyayaḥ puruṣaḥ sākṣī kṣetrajño \'kṣara eva ca',en:'Names: the Pure Self, the Supreme Self, the highest goal of the liberated, the Imperishable, the Person (Purusha), the Witness, the Knower of the field, the Indestructible.',status:'needs-verification'},
  {id:'v3',group:'Namavali',label:'Verse 3',sa:'योगो योगविदां नेता प्रधानपुरुषेश्वरः।\nनारसिंहवपुः श्रीमान् केशवः पुरुषोत्तमः॥३॥',tr:'Yogo yogavidāṁ netā pradhāna-puruṣeśvaraḥ\nNārasiṁha-vapuḥ śrīmān keśavaḥ puruṣottamaḥ',en:'Names: Yoga, Leader of those who know yoga, Lord of Prakriti and Purusha, the one with the form of Narasimha, Shriman (the glorious), Keshava, Purushottama (the best of persons).',status:'needs-verification'},
  {id:'namavali-rest',group:'Namavali',label:'Verse 4 onward',pending:true,note:'Not yet added. Remaining verses of the namavali will appear here as they are verified.'},
  {id:'phalashruti',group:'Phalashruti',label:'Closing section',pending:true,note:'Not yet added. The phalashruti (benefits of recitation) will appear here once verified.'},
 ],
};
