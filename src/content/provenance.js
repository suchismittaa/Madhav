// Provenance for every library text: where it comes from, how it can be checked, and how far it has been checked.
//
//   work          the scripture, composer or tradition the text is attributed to
//   ref           chapter / verse / section reference, ONLY where it was confirmed (otherwise omitted, never guessed)
//   edition       the edition or repository the wording was compared with
//   url           a page where the reader can verify the text
//   verification  'verified'  wording compared directly with the cited edition(s)
//                 'traditional' commonly recited text; the origin is traditional or the wording was not re-checked
//                 'devotional'  a devotional composition or name-chant: no scriptural verse is claimed
//                 'uncertain'   several versions circulate or the origin is unclear; compare with your own tradition
//                 'pending'     text not added yet
//   note          variants and caveats
//   checked       ISO date of the last direct check (omitted if never directly checked)
const D='2026-11-24';
export const VERIFY_LABEL={verified:'Verified against a cited edition',traditional:'Traditional text, not re-checked',devotional:'Devotional composition (no scriptural verse claimed)',uncertain:'Origin or wording uncertain',pending:'Text pending',custom:'Written by you'};

const PROV={
 'mm-hare':{work:'Kali-Santarana Upanishad (Krishna Yajurveda)',edition:'Order of names differs between recensions (see note)',url:'https://en.wikipedia.org/wiki/Kali-Santara%E1%B9%87a_Upani%E1%B9%A3ad',verification:'traditional',
  note:'Earliest known textual source of the mantra. Some recensions and translations (for example K. N. Aiyar’s) print Hare Rama first; the Gaudiya tradition chants Hare Krishna first, as shown in Madhav. Both orders are in use.',checked:D},
 'mm-vasu':{work:'Bhagavata Purana (Dhruva’s instruction, Canto 4, chapter 8) and the Vaishnava Dvadashakshari tradition',verification:'traditional',note:'Verse number not re-checked in this review.'},
 'mm-krishnaya':{work:'Namah-formula salutation',verification:'devotional',note:'A short salutation built in the standard “Om … namah” form; it is not a quotation from one verse.'},
 'mm-radhe':{work:'Braj devotional tradition',verification:'devotional',note:'A name-chant and greeting; no scriptural verse is claimed.'},
 'mm-govind-hare':{work:'Traditional bhajan',verification:'uncertain',note:'A sung refrain with no fixed written source. Words differ between singers; compare with your own tradition.'},
 'madhurashtakam':{work:'Shri Vallabhacharya, Madhurashtakam',verification:'traditional',note:'Eight verses as commonly printed; not yet compared with a specific printed edition.'},
 'govind-damodar':{work:'Govinda Damodara Stotram (attributed to Bilvamangala Thakura)',verification:'uncertain',note:'Only the refrain is included. Full verses vary between editions, so none were added until an edition is chosen.'},
 'mm-nara':{work:'Narayana (Ashtakshari) mantra tradition; associated with the Narayana Upanishad',verification:'traditional',note:'Source association not re-checked in this review.'},
 'shantakaram':{work:'Traditional Vishnu dhyana shloka',verification:'traditional',note:'Four-line text as commonly recited; the original work it comes from is not claimed here.'},
 'achyutam-keshavam':{work:'Achyutashtakam, verse 1',verification:'traditional',note:'Opening verse only. The remaining verses are not added.'},
 'vishnu-sahasranama':{work:'Mahabharata, Anushasana Parva (Bhishma to Yudhishthira)',verification:'pending',note:'Only the introduction, the dhyana verse and a few opening verses are present; they have not yet been checked against a printed edition. Nothing has been invented to fill the rest.'},
 'hanuman-chalisa':{work:'Goswami Tulsidas, Hanuman Chalisa (Awadhi)',edition:'Gita Press based recension, as stated in the content notes; known variant readings are noted on the verses where they occur',verification:'traditional',note:'Authorship by Tulsidas is the standard tradition. Devanagari was compared with a published Gita Press based edition in an earlier review; it was not re-fetched in this one.'},
 'mm-hanu':{work:'Namah-formula salutation',verification:'devotional',note:'A short salutation in the standard “Om … namah” form.'},
 'hanuman-ashtak':{work:'Traditional, attributed to Tulsidas',verification:'pending',note:'No text added yet. Waiting for a verified edition.'},
 'bajrang-baan':{work:'Traditional, attributed in popular tradition to Tulsidas',verification:'pending',note:'No text added yet. Printings differ; waiting for a verified edition.'},
 'mm-hanu-gayatri':{work:'Traditional Gayatri-form prayer',verification:'uncertain',note:'Several versions circulate (Anjaneya / Hanumat / Hanuman). This is the commonly chanted form.'},
 'mm-shiva':{work:'Shaiva tradition; the words “namaḥ śivāya” occur in the Shri Rudram (Yajurveda)',edition:'Shri Rudram passage as cited at sanskritdocuments.org',url:'https://sanskritdocuments.org/doc_shiva/panch.html',verification:'traditional',note:'The five-syllable mantra with Om is the Shaiva tradition’s core mantra. The Rudram contains the words “namaḥ śivāya ca”; the standalone chant “Om Namah Shivaya” is a traditional extraction, not a single verse.',checked:D},
 'mm-mmj':{work:'Rigveda',ref:'7.59.12',edition:'Rigveda text and English translation (wisdomlib); the Jamison and Brereton translation (The Rigveda, OUP, 2014) is the scholarly edition to compare',url:'https://www.wisdomlib.org/hinduism/book/rig-veda-english-translation/d/doc835080.html',verification:'verified',
  note:'The verse recurs in the Yajurveda (Taittiriya Samhita 1.8.6; Vajasaneyi Samhita 3.60). The opening “Om” is added in chanting and is not part of the Rigvedic verse. Tantric extended forms with seed syllables also exist; this is the plain Vedic verse.',checked:D},
 'shiva-panchakshara':{work:'Shiva Panchakshara Stotram, attributed to Adi Shankaracharya',edition:'sanskritdocuments.org (Anand Hudli, proofread; last updated 15 Sep 2020)',url:'https://sanskritdocuments.org/doc_shiva/panch.html',verification:'traditional',
  note:'Verses 1, 2, 5 and the closing verse were read directly from this edition; verses 3 and 4 were checked only in part. Verse 2 has a noted variant (makāramahitāya). Attribution to Shankaracharya is traditional.',checked:D},
 'mm-gayatri':{work:'Rigveda, with the three vyahritis added in chanting',ref:'3.62.10',verification:'traditional',note:'Reference as commonly cited; the wording was not re-fetched in this review. “Om bhur bhuvah svah” are added before the verse in chanting and are not part of the Rigvedic verse.'},
 'mm-durga':{work:'Devi Mahatmya (verse); Durga beej mantra from tantric tradition',ref:'Devi Mahatmya 11.10 (the “Sarva-mangala” verse), as commonly cited',verification:'traditional',note:'The verse reference is as commonly cited and was not re-checked here. “Om Dum Durgayai Namah” is a tantric seed mantra, not a Devi Mahatmya verse.'},
 'mm-om':{work:'Mandukya Upanishad (description of Om)',verification:'traditional',note:'The syllable itself; the explanation follows the Mandukya Upanishad. Section reference not re-checked.'},
};
export function provenanceFor(t){
 if(PROV[t.id])return {...PROV[t.id]};
 if(t.custom)return {work:'Added by you',verification:'custom'};
 return {work:t.source||'Unspecified',verification:t.status?.text==='pending'?'pending':'uncertain',note:t.status?.note};
}

// Bhagavad Gita verses used on Home, Wisdom and in the Gita section.
// Verse-level links go to the Gita Supersite (IIT Kanpur, Heritage of India), where the same verse can be read with classical commentaries.
const GITA_CHECKED={'bg-2-47':'Compared with Vedabase (Gita As It Is), asitis.com, wisdomlib and other published editions.','bg-18-66':'Compared with Vedabase (Gita As It Is), asitis.com, the Ramanuja Gita archive and other published editions.'};
export function gitaSrc(v){
 const ok=GITA_CHECKED[v.id];
 return {work:'Bhagavad Gita',ref:`${v.ch}.${v.v}`,edition:'Gita Supersite, Heritage of India (IIT Kanpur): verse with classical commentaries',
  url:`https://www.gitasupersite.iitk.ac.in/srimad?language=dv&field_chapter_value=${v.ch}&field_nsutra_value=${v.v}`,
  verification:ok?'verified':'traditional',
  note:ok||'Standard recension as widely printed; open the link to compare. Not individually re-fetched in the latest review.',checked:ok?D:undefined};
}
