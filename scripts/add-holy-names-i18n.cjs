const fs = require("fs");
const path = require("path");

const data = [
  ["The Most Merciful", "The Most Compassionate"],
  ["The Most Gracious", "The Bestower of Mercy"],
  ["The King", "The Sovereign Lord"],
  ["The Most Sacred", "The Pure One"],
  ["The Source of Peace", "The Flawless One"],
  ["The Inspirer of Faith", "The Infuser of Faith"],
  ["The Guardian", "The Preserver of Safety"],
  ["The Victorious", "The Mighty One"],
  ["The Compeller", "The Restorer"],
  ["The Supreme", "The Majestic One"],
  ["The Creator", "The Maker of All Things"],
  ["The Evolver", "The Fashioner"],
  ["The Fashioner", "The Shaper of Beauty"],
  ["The Forgiving", "The All-Forgiving"],
  ["The Subduer", "The All-Prevailing One"],
  ["The Bestower", "The Supreme Bestower"],
  ["The Provider", "The Sustainer"],
  ["The Opener", "The Supreme Solver"],
  ["The All-Knowing", "The Omniscient"],
  ["The Withholder", "The Restrainer"],
  ["The Extender", "The Enlarger"],
  ["The Reducer", "The Abaser"],
  ["The Exalter", "The Elevator"],
  ["The Honorer", "The Bestower of Honor"],
  ["The Humiliator", "The Dishonourer"],
  ["The All-Hearing", "The Hearer of All"],
  ["The All-Seeing", "The Seer of All"],
  ["The Judge", "The Impartial Judge"],
  ["The Just", "The Utterly Just"],
  ["The Subtle One", "The Most Gentle"],
  ["The Aware", "The All-Aware"],
  ["The Forbearing", "The Clement"],
  ["The Magnificent", "The Supreme"],
  ["The Forgiving", "The All-Forgiving"],
  ["The Appreciative", "The Most Grateful"],
  ["The Most High", "The Exalted"],
  ["The Most Great", "The Greatest"],
  ["The Preserver", "The Guardian"],
  ["The Sustainer", "The Nourisher"],
  ["The Reckoner", "The Sufficient"],
  ["The Majestic", "The Sublime One"],
  ["The Generous", "The Most Generous"],
  ["The Watchful", "The Ever-Watchful"],
  ["The Responsive", "The Answerer of Prayers"],
  ["The All-Encompassing", "The Boundless"],
  ["The Wise", "The All-Wise"],
  ["The Loving", "The Most Loving"],
  ["The Glorious", "The Most Glorious"],
  ["The Resurrector", "The Raiser of the Dead"],
  ["The Witness", "The All-Witnessing"],
  ["The Truth", "The Absolute Truth"],
  ["The Trustee", "The Disposer of Affairs"],
  ["The Strong", "The All-Strong"],
  ["The Firm", "The Steadfast"],
  ["The Friend", "The Protecting Friend"],
  ["The Praiseworthy", "The All-Praiseworthy"],
  ["The Reckoner", "The Accounter"],
  ["The Originator", "The Initiator"],
  ["The Restorer", "The Reinstater"],
  ["The Giver of Life", "The Bestower of Life"],
  ["The Destroyer", "The Bringer of Death"],
  ["The Ever-Living", "The Alive"],
  ["The Self-Subsisting", "The Sustainer of All"],
  ["The Finder", "The Perceiver"],
  ["The Noble", "The Illustrious"],
  ["The One", "The Unique"],
  ["The Indivisible", "The One and Only"],
  ["The Eternal", "The Absolute"],
  ["The Capable", "The All-Powerful"],
  ["The Omnipotent", "The Determiner"],
  ["The Expediter", "The Promoter"],
  ["The Delayer", "The Postponer"],
  ["The First", "The Beginning"],
  ["The Last", "The End"],
  ["The Manifest", "The Evident"],
  ["The Hidden", "The Concealed"],
  ["The Governor", "The Patron"],
  ["The Most Exalted", "The Supreme"],
  ["The Source of Goodness", "The Righteous"],
  ["The Acceptor of Repentance", "The Ever-Pardoning"],
  ["The Avenger", "The Retaliator"],
  ["The Pardoner", "The Supreme Pardoner"],
  ["The Compassionate", "The Most Kind"],
  ["Master of the Kingdom", "Owner of All Sovereignty"],
  ["Lord of Majesty and Generosity", "The Possessor of Glory and Honour"],
  ["The Equitable", "The Just One"],
  ["The Gatherer", "The Assembler"],
  ["The Self-Sufficient", "The Wealthy"],
  ["The Enricher", "The Bestower of Wealth"],
  ["The Preventer", "The Withholder"],
  ["The Distresser", "The Creator of Harm"],
  ["The Propitious", "The Creator of Good"],
  ["The Light", "The Illuminator"],
  ["The Guide", "The Provider of Guidance"],
  ["The Incomparable", "The Originator"],
  ["The Everlasting", "The Eternal"],
  ["The Inheritor", "The Supreme Inheritor"],
  ["The Guide", "The Righteous Teacher"],
  ["The Patient", "The Most Patient"],
];

// Add to English
const enPath = path.join(__dirname, "../src/locale/en.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
en.holyNames = {};
for (let i = 0; i < data.length; i++) {
  en.holyNames[i + 1] = {
    transliteration: data[i][0],
    meaning: data[i][1],
  };
}
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n");
console.log("✓ Added 99 names to en.json");

// For now, copy English structure to other languages (they can be translated later)
const languages = ["ar", "de", "ru", "he"];
languages.forEach((lang) => {
  const langPath = path.join(__dirname, `../src/locale/${lang}.json`);
  const langData = JSON.parse(fs.readFileSync(langPath, "utf8"));
  langData.holyNames = JSON.parse(JSON.stringify(en.holyNames)); // Deep copy
  fs.writeFileSync(langPath, JSON.stringify(langData, null, 2) + "\n");
  console.log(
    `✓ Added holyNames to ${lang}.json (English text, needs translation)`,
  );
});

console.log(
  "\nℹ Note: ar, de, ru, he locale files have English holy names. Please translate them.",
);
