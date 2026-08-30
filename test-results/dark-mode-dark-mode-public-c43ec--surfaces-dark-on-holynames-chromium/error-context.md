# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /holynames
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: Found bright neutral surfaces in dark mode on /holynames: [
  {
    "selector": "div.q-banner.row.items-center",
    "backgroundColor": "rgba(255, 255, 255, 0.95)",
    "width": 960,
    "height": 66
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 8

- Array []
+ Array [
+   Object {
+     "backgroundColor": "rgba(255, 255, 255, 0.95)",
+     "height": 66,
+     "selector": "div.q-banner.row.items-center",
+     "width": 960,
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - banner [ref=e6]:
      - toolbar [ref=e7]:
        - button "Toggle menu" [ref=e8] [cursor=pointer]:
          - img [ref=e10]: menu
        - img "PEACE2074" [ref=e13]
        - link "Peace2074" [ref=e15] [cursor=pointer]:
          - /url: /
        - button "Search…" [ref=e16] [cursor=pointer]:
          - img [ref=e18]: search
        - button "Play Athan" [ref=e19] [cursor=pointer]:
          - img [ref=e21]: volume_up
        - button "Login" [ref=e22] [cursor=pointer]:
          - img [ref=e24]: login
    - main [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]: ﷽
        - heading "The 99 Holy Names of Allah" [level=1] [ref=e29]
        - generic [ref=e30]: Asma' Allah Al-Husna
        - generic [ref=e31]:
          - generic [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: الرَّحْمَنُ
            - generic [ref=e34]: Ar-Rahman
            - generic [ref=e35]: The Most Merciful
            - generic [ref=e36]: The Most Compassionate
          - generic [ref=e37] [cursor=pointer]:
            - generic [ref=e38]: الرَّحِيمُ
            - generic [ref=e39]: Ar-Raheem
            - generic [ref=e40]: The Most Gracious
            - generic [ref=e41]: The Bestower of Mercy
          - generic [ref=e42] [cursor=pointer]:
            - generic [ref=e43]: الْمَلِكُ
            - generic [ref=e44]: Al-Malik
            - generic [ref=e45]: The King
            - generic [ref=e46]: The Sovereign Lord
          - generic [ref=e47] [cursor=pointer]:
            - generic [ref=e48]: الْقُدُّوسُ
            - generic [ref=e49]: Al-Quddus
            - generic [ref=e50]: The Most Sacred
            - generic [ref=e51]: The Pure One
          - generic [ref=e52] [cursor=pointer]:
            - generic [ref=e53]: السَّلاَمُ
            - generic [ref=e54]: As-Salam
            - generic [ref=e55]: The Source of Peace
            - generic [ref=e56]: The Flawless One
          - generic [ref=e57] [cursor=pointer]:
            - generic [ref=e58]: الْمُؤْمِنُ
            - generic [ref=e59]: Al-Mu'min
            - generic [ref=e60]: The Inspirer of Faith
            - generic [ref=e61]: The Infuser of Faith
          - generic [ref=e62] [cursor=pointer]:
            - generic [ref=e63]: الْمُهَيْمِنُ
            - generic [ref=e64]: Al-Muhaymin
            - generic [ref=e65]: The Guardian
            - generic [ref=e66]: The Preserver of Safety
          - generic [ref=e67] [cursor=pointer]:
            - generic [ref=e68]: الْعَزِيزُ
            - generic [ref=e69]: Al-Aziz
            - generic [ref=e70]: The Victorious
            - generic [ref=e71]: The Mighty One
          - generic [ref=e72] [cursor=pointer]:
            - generic [ref=e73]: الْجَبَّارُ
            - generic [ref=e74]: Al-Jabbar
            - generic [ref=e75]: The Compeller
            - generic [ref=e76]: The Restorer
          - generic [ref=e77] [cursor=pointer]:
            - generic [ref=e78]: الْمُتَكَبِّرُ
            - generic [ref=e79]: Al-Mutakabbir
            - generic [ref=e80]: The Supreme
            - generic [ref=e81]: The Majestic One
          - generic [ref=e82] [cursor=pointer]:
            - generic [ref=e83]: الْخَالِقُ
            - generic [ref=e84]: Al-Khaliq
            - generic [ref=e85]: The Creator
            - generic [ref=e86]: The Maker of All Things
          - generic [ref=e87] [cursor=pointer]:
            - generic [ref=e88]: الْبَارِئُ
            - generic [ref=e89]: Al-Bari
            - generic [ref=e90]: The Evolver
            - generic [ref=e91]: The Fashioner
          - generic [ref=e92] [cursor=pointer]:
            - generic [ref=e93]: الْمُصَوِّرُ
            - generic [ref=e94]: Al-Musawwir
            - generic [ref=e95]: The Fashioner
            - generic [ref=e96]: The Shaper of Beauty
          - generic [ref=e97] [cursor=pointer]:
            - generic [ref=e98]: الْغَفَّارُ
            - generic [ref=e99]: Al-Ghaffar
            - generic [ref=e100]: The Forgiving
            - generic [ref=e101]: The All-Forgiving
          - generic [ref=e102] [cursor=pointer]:
            - generic [ref=e103]: الْقَهَّارُ
            - generic [ref=e104]: Al-Qahhar
            - generic [ref=e105]: The Subduer
            - generic [ref=e106]: The All-Prevailing One
          - generic [ref=e107] [cursor=pointer]:
            - generic [ref=e108]: الْوَهَّابُ
            - generic [ref=e109]: Al-Wahhab
            - generic [ref=e110]: The Bestower
            - generic [ref=e111]: The Supreme Bestower
          - generic [ref=e112] [cursor=pointer]:
            - generic [ref=e113]: الرَّزَّاقُ
            - generic [ref=e114]: Ar-Razzaq
            - generic [ref=e115]: The Provider
            - generic [ref=e116]: The Sustainer
          - generic [ref=e117] [cursor=pointer]:
            - generic [ref=e118]: الْفَتَّاحُ
            - generic [ref=e119]: Al-Fattah
            - generic [ref=e120]: The Opener
            - generic [ref=e121]: The Supreme Solver
          - generic [ref=e122] [cursor=pointer]:
            - generic [ref=e123]: الْعَلِيمُ
            - generic [ref=e124]: Al-Alim
            - generic [ref=e125]: The All-Knowing
            - generic [ref=e126]: The Omniscient
          - generic [ref=e127] [cursor=pointer]:
            - generic [ref=e128]: الْقَابِضُ
            - generic [ref=e129]: Al-Qabid
            - generic [ref=e130]: The Withholder
            - generic [ref=e131]: The Restrainer
          - generic [ref=e132] [cursor=pointer]:
            - generic [ref=e133]: الْبَاسِطُ
            - generic [ref=e134]: Al-Basit
            - generic [ref=e135]: The Extender
            - generic [ref=e136]: The Enlarger
          - generic [ref=e137] [cursor=pointer]:
            - generic [ref=e138]: الْخَافِضُ
            - generic [ref=e139]: Al-Khafid
            - generic [ref=e140]: The Reducer
            - generic [ref=e141]: The Abaser
          - generic [ref=e142] [cursor=pointer]:
            - generic [ref=e143]: الرَّافِعُ
            - generic [ref=e144]: Ar-Rafi
            - generic [ref=e145]: The Exalter
            - generic [ref=e146]: The Elevator
          - generic [ref=e147] [cursor=pointer]:
            - generic [ref=e148]: الْمُعِزُّ
            - generic [ref=e149]: Al-Mu'izz
            - generic [ref=e150]: The Honorer
            - generic [ref=e151]: The Bestower of Honor
          - generic [ref=e152] [cursor=pointer]:
            - generic [ref=e153]: الْمُذِلُّ
            - generic [ref=e154]: Al-Muzil
            - generic [ref=e155]: The Humiliator
            - generic [ref=e156]: The Dishonourer
          - generic [ref=e157] [cursor=pointer]:
            - generic [ref=e158]: السَّمِيعُ
            - generic [ref=e159]: As-Sami
            - generic [ref=e160]: The All-Hearing
            - generic [ref=e161]: The Hearer of All
          - generic [ref=e162] [cursor=pointer]:
            - generic [ref=e163]: الْبَصِيرُ
            - generic [ref=e164]: Al-Basir
            - generic [ref=e165]: The All-Seeing
            - generic [ref=e166]: The Seer of All
          - generic [ref=e167] [cursor=pointer]:
            - generic [ref=e168]: الْحَكَمُ
            - generic [ref=e169]: Al-Hakam
            - generic [ref=e170]: The Judge
            - generic [ref=e171]: The Impartial Judge
          - generic [ref=e172] [cursor=pointer]:
            - generic [ref=e173]: الْعَدْلُ
            - generic [ref=e174]: Al-Adl
            - generic [ref=e175]: The Just
            - generic [ref=e176]: The Utterly Just
          - generic [ref=e177] [cursor=pointer]:
            - generic [ref=e178]: اللَّطِيفُ
            - generic [ref=e179]: Al-Latif
            - generic [ref=e180]: The Subtle One
            - generic [ref=e181]: The Most Gentle
          - generic [ref=e182] [cursor=pointer]:
            - generic [ref=e183]: الْخَبِيرُ
            - generic [ref=e184]: Al-Khabir
            - generic [ref=e185]: The Aware
            - generic [ref=e186]: The All-Aware
          - generic [ref=e187] [cursor=pointer]:
            - generic [ref=e188]: الْحَلِيمُ
            - generic [ref=e189]: Al-Halim
            - generic [ref=e190]: The Forbearing
            - generic [ref=e191]: The Clement
          - generic [ref=e192] [cursor=pointer]:
            - generic [ref=e193]: الْعَظِيمُ
            - generic [ref=e194]: Al-Azim
            - generic [ref=e195]: The Magnificent
            - generic [ref=e196]: The Supreme
          - generic [ref=e197] [cursor=pointer]:
            - generic [ref=e198]: الْغَفُورُ
            - generic [ref=e199]: Al-Ghafur
            - generic [ref=e200]: The Forgiving
            - generic [ref=e201]: The All-Forgiving
          - generic [ref=e202] [cursor=pointer]:
            - generic [ref=e203]: الشَّكُورُ
            - generic [ref=e204]: Ash-Shakur
            - generic [ref=e205]: The Appreciative
            - generic [ref=e206]: The Most Grateful
          - generic [ref=e207] [cursor=pointer]:
            - generic [ref=e208]: الْعَلِيُّ
            - generic [ref=e209]: Al-Ali
            - generic [ref=e210]: The Most High
            - generic [ref=e211]: The Exalted
          - generic [ref=e212] [cursor=pointer]:
            - generic [ref=e213]: الْكَبِيرُ
            - generic [ref=e214]: Al-Kabir
            - generic [ref=e215]: The Most Great
            - generic [ref=e216]: The Greatest
          - generic [ref=e217] [cursor=pointer]:
            - generic [ref=e218]: الْحَفِيظُ
            - generic [ref=e219]: Al-Hafiz
            - generic [ref=e220]: The Preserver
            - generic [ref=e221]: The Guardian
          - generic [ref=e222] [cursor=pointer]:
            - generic [ref=e223]: الْمُقِيتُ
            - generic [ref=e224]: Al-Muqit
            - generic [ref=e225]: The Sustainer
            - generic [ref=e226]: The Nourisher
          - generic [ref=e227] [cursor=pointer]:
            - generic [ref=e228]: الْحَسِيبُ
            - generic [ref=e229]: Al-Hasib
            - generic [ref=e230]: The Reckoner
            - generic [ref=e231]: The Sufficient
          - generic [ref=e232] [cursor=pointer]:
            - generic [ref=e233]: الْجَلِيلُ
            - generic [ref=e234]: Al-Jalil
            - generic [ref=e235]: The Majestic
            - generic [ref=e236]: The Sublime One
          - generic [ref=e237] [cursor=pointer]:
            - generic [ref=e238]: الْكَرِيمُ
            - generic [ref=e239]: Al-Karim
            - generic [ref=e240]: The Generous
            - generic [ref=e241]: The Most Generous
          - generic [ref=e242] [cursor=pointer]:
            - generic [ref=e243]: الرَّقِيبُ
            - generic [ref=e244]: Ar-Raqib
            - generic [ref=e245]: The Watchful
            - generic [ref=e246]: The Ever-Watchful
          - generic [ref=e247] [cursor=pointer]:
            - generic [ref=e248]: الْمُجِيبُ
            - generic [ref=e249]: Al-Mujib
            - generic [ref=e250]: The Responsive
            - generic [ref=e251]: The Answerer of Prayers
          - generic [ref=e252] [cursor=pointer]:
            - generic [ref=e253]: الْوَاسِعُ
            - generic [ref=e254]: Al-Wasi
            - generic [ref=e255]: The All-Encompassing
            - generic [ref=e256]: The Boundless
          - generic [ref=e257] [cursor=pointer]:
            - generic [ref=e258]: الْحَكِيمُ
            - generic [ref=e259]: Al-Hakim
            - generic [ref=e260]: The Wise
            - generic [ref=e261]: The All-Wise
          - generic [ref=e262] [cursor=pointer]:
            - generic [ref=e263]: الْوَدُودُ
            - generic [ref=e264]: Al-Wadud
            - generic [ref=e265]: The Loving
            - generic [ref=e266]: The Most Loving
          - generic [ref=e267] [cursor=pointer]:
            - generic [ref=e268]: الْمَجِيدُ
            - generic [ref=e269]: Al-Majid
            - generic [ref=e270]: The Glorious
            - generic [ref=e271]: The Most Glorious
          - generic [ref=e272] [cursor=pointer]:
            - generic [ref=e273]: الْبَاعِثُ
            - generic [ref=e274]: Al-Ba'ith
            - generic [ref=e275]: The Resurrector
            - generic [ref=e276]: The Raiser of the Dead
          - generic [ref=e277] [cursor=pointer]:
            - generic [ref=e278]: الشَّهِيدُ
            - generic [ref=e279]: Ash-Shahid
            - generic [ref=e280]: The Witness
            - generic [ref=e281]: The All-Witnessing
          - generic [ref=e282] [cursor=pointer]:
            - generic [ref=e283]: الْحَقُّ
            - generic [ref=e284]: Al-Haqq
            - generic [ref=e285]: The Truth
            - generic [ref=e286]: The Absolute Truth
          - generic [ref=e287] [cursor=pointer]:
            - generic [ref=e288]: الْوَكِيلُ
            - generic [ref=e289]: Al-Wakil
            - generic [ref=e290]: The Trustee
            - generic [ref=e291]: The Disposer of Affairs
          - generic [ref=e292] [cursor=pointer]:
            - generic [ref=e293]: الْقَوِيُّ
            - generic [ref=e294]: Al-Qawiyy
            - generic [ref=e295]: The Strong
            - generic [ref=e296]: The All-Strong
          - generic [ref=e297] [cursor=pointer]:
            - generic [ref=e298]: الْمَتِينُ
            - generic [ref=e299]: Al-Matin
            - generic [ref=e300]: The Firm
            - generic [ref=e301]: The Steadfast
          - generic [ref=e302] [cursor=pointer]:
            - generic [ref=e303]: الْوَلِيُّ
            - generic [ref=e304]: Al-Waliyy
            - generic [ref=e305]: The Friend
            - generic [ref=e306]: The Protecting Friend
          - generic [ref=e307] [cursor=pointer]:
            - generic [ref=e308]: الْحَمِيدُ
            - generic [ref=e309]: Al-Hamid
            - generic [ref=e310]: The Praiseworthy
            - generic [ref=e311]: The All-Praiseworthy
          - generic [ref=e312] [cursor=pointer]:
            - generic [ref=e313]: الْمُحْصِي
            - generic [ref=e314]: Al-Muhsi
            - generic [ref=e315]: The Reckoner
            - generic [ref=e316]: The Accounter
          - generic [ref=e317] [cursor=pointer]:
            - generic [ref=e318]: الْمُبْدِئُ
            - generic [ref=e319]: Al-Mubdi
            - generic [ref=e320]: The Originator
            - generic [ref=e321]: The Initiator
          - generic [ref=e322] [cursor=pointer]:
            - generic [ref=e323]: الْمُعِيدُ
            - generic [ref=e324]: Al-Mu'id
            - generic [ref=e325]: The Restorer
            - generic [ref=e326]: The Reinstater
          - generic [ref=e327] [cursor=pointer]:
            - generic [ref=e328]: الْمُحْيِي
            - generic [ref=e329]: Al-Muhyi
            - generic [ref=e330]: The Giver of Life
            - generic [ref=e331]: The Bestower of Life
          - generic [ref=e332] [cursor=pointer]:
            - generic [ref=e333]: الْمُمِيتُ
            - generic [ref=e334]: Al-Mumit
            - generic [ref=e335]: The Destroyer
            - generic [ref=e336]: The Bringer of Death
          - generic [ref=e337] [cursor=pointer]:
            - generic [ref=e338]: الْحَيُّ
            - generic [ref=e339]: Al-Hayy
            - generic [ref=e340]: The Ever-Living
            - generic [ref=e341]: The Alive
          - generic [ref=e342] [cursor=pointer]:
            - generic [ref=e343]: الْقَيُّومُ
            - generic [ref=e344]: Al-Qayyum
            - generic [ref=e345]: The Self-Subsisting
            - generic [ref=e346]: The Sustainer of All
          - generic [ref=e347] [cursor=pointer]:
            - generic [ref=e348]: الْوَاجِدُ
            - generic [ref=e349]: Al-Wajid
            - generic [ref=e350]: The Finder
            - generic [ref=e351]: The Perceiver
          - generic [ref=e352] [cursor=pointer]:
            - generic [ref=e353]: الْمَاجِدُ
            - generic [ref=e354]: Al-Majid
            - generic [ref=e355]: The Noble
            - generic [ref=e356]: The Illustrious
          - generic [ref=e357] [cursor=pointer]:
            - generic [ref=e358]: الْوَاحِدُ
            - generic [ref=e359]: Al-Wahid
            - generic [ref=e360]: The One
            - generic [ref=e361]: The Unique
          - generic [ref=e362] [cursor=pointer]:
            - generic [ref=e363]: الأَحَد
            - generic [ref=e364]: Al-Ahad
            - generic [ref=e365]: The Indivisible
            - generic [ref=e366]: The One and Only
          - generic [ref=e367] [cursor=pointer]:
            - generic [ref=e368]: الصَّمَدُ
            - generic [ref=e369]: As-Samad
            - generic [ref=e370]: The Eternal
            - generic [ref=e371]: The Absolute
          - generic [ref=e372] [cursor=pointer]:
            - generic [ref=e373]: الْقَادِرُ
            - generic [ref=e374]: Al-Qadir
            - generic [ref=e375]: The Capable
            - generic [ref=e376]: The All-Powerful
          - generic [ref=e377] [cursor=pointer]:
            - generic [ref=e378]: الْمُقْتَدِرُ
            - generic [ref=e379]: Al-Muqtadir
            - generic [ref=e380]: The Omnipotent
            - generic [ref=e381]: The Determiner
          - generic [ref=e382] [cursor=pointer]:
            - generic [ref=e383]: الْمُقَدِّمُ
            - generic [ref=e384]: Al-Muqaddim
            - generic [ref=e385]: The Expediter
            - generic [ref=e386]: The Promoter
          - generic [ref=e387] [cursor=pointer]:
            - generic [ref=e388]: الْمُؤَخِّرُ
            - generic [ref=e389]: Al-Mu'akhkhir
            - generic [ref=e390]: The Delayer
            - generic [ref=e391]: The Postponer
          - generic [ref=e392] [cursor=pointer]:
            - generic [ref=e393]: الأَوَّلُ
            - generic [ref=e394]: Al-Awwal
            - generic [ref=e395]: The First
            - generic [ref=e396]: The Beginning
          - generic [ref=e397] [cursor=pointer]:
            - generic [ref=e398]: الآخِرُ
            - generic [ref=e399]: Al-Akhir
            - generic [ref=e400]: The Last
            - generic [ref=e401]: The End
          - generic [ref=e402] [cursor=pointer]:
            - generic [ref=e403]: الظَّاهِرُ
            - generic [ref=e404]: Az-Zahir
            - generic [ref=e405]: The Manifest
            - generic [ref=e406]: The Evident
          - generic [ref=e407] [cursor=pointer]:
            - generic [ref=e408]: الْبَاطِنُ
            - generic [ref=e409]: Al-Batin
            - generic [ref=e410]: The Hidden
            - generic [ref=e411]: The Concealed
          - generic [ref=e412] [cursor=pointer]:
            - generic [ref=e413]: الْوَالِي
            - generic [ref=e414]: Al-Wali
            - generic [ref=e415]: The Governor
            - generic [ref=e416]: The Patron
          - generic [ref=e417] [cursor=pointer]:
            - generic [ref=e418]: الْمُتَعَالِي
            - generic [ref=e419]: Al-Muta'ali
            - generic [ref=e420]: The Most Exalted
            - generic [ref=e421]: The Supreme
          - generic [ref=e422] [cursor=pointer]:
            - generic [ref=e423]: الْبَرُّ
            - generic [ref=e424]: Al-Barr
            - generic [ref=e425]: The Source of Goodness
            - generic [ref=e426]: The Righteous
          - generic [ref=e427] [cursor=pointer]:
            - generic [ref=e428]: التَّوَّابُ
            - generic [ref=e429]: At-Tawwab
            - generic [ref=e430]: The Acceptor of Repentance
            - generic [ref=e431]: The Ever-Pardoning
          - generic [ref=e432] [cursor=pointer]:
            - generic [ref=e433]: الْمُنْتَقِمُ
            - generic [ref=e434]: Al-Muntaqim
            - generic [ref=e435]: The Avenger
            - generic [ref=e436]: The Retaliator
          - generic [ref=e437] [cursor=pointer]:
            - generic [ref=e438]: الْعَفُوُّ
            - generic [ref=e439]: Al-Afuww
            - generic [ref=e440]: The Pardoner
            - generic [ref=e441]: The Supreme Pardoner
          - generic [ref=e442] [cursor=pointer]:
            - generic [ref=e443]: الرَّؤُوفُ
            - generic [ref=e444]: Ar-Ra'uf
            - generic [ref=e445]: The Compassionate
            - generic [ref=e446]: The Most Kind
          - generic [ref=e447] [cursor=pointer]:
            - generic [ref=e448]: مَالِكُ الْمُلْكِ
            - generic [ref=e449]: Malik-ul-Mulk
            - generic [ref=e450]: Master of the Kingdom
            - generic [ref=e451]: Owner of All Sovereignty
          - generic [ref=e452] [cursor=pointer]:
            - generic [ref=e453]: ذُو الْجَلاَلِ وَالإِكْرَامِ
            - generic [ref=e454]: Dhul-Jalali wal-Ikram
            - generic [ref=e455]: Lord of Majesty and Generosity
            - generic [ref=e456]: The Possessor of Glory and Honour
          - generic [ref=e457] [cursor=pointer]:
            - generic [ref=e458]: الْمُقْسِطُ
            - generic [ref=e459]: Al-Muqsit
            - generic [ref=e460]: The Equitable
            - generic [ref=e461]: The Just One
          - generic [ref=e462] [cursor=pointer]:
            - generic [ref=e463]: الْجَامِعُ
            - generic [ref=e464]: Al-Jami
            - generic [ref=e465]: The Gatherer
            - generic [ref=e466]: The Assembler
          - generic [ref=e467] [cursor=pointer]:
            - generic [ref=e468]: الْغَنِيُّ
            - generic [ref=e469]: Al-Ghani
            - generic [ref=e470]: The Self-Sufficient
            - generic [ref=e471]: The Wealthy
          - generic [ref=e472] [cursor=pointer]:
            - generic [ref=e473]: الْمُغْنِي
            - generic [ref=e474]: Al-Mughni
            - generic [ref=e475]: The Enricher
            - generic [ref=e476]: The Bestower of Wealth
          - generic [ref=e477] [cursor=pointer]:
            - generic [ref=e478]: الْمَانِعُ
            - generic [ref=e479]: Al-Mani
            - generic [ref=e480]: The Preventer
            - generic [ref=e481]: The Withholder
          - generic [ref=e482] [cursor=pointer]:
            - generic [ref=e483]: الضَّارُّ
            - generic [ref=e484]: Ad-Darr
            - generic [ref=e485]: The Distresser
            - generic [ref=e486]: The Creator of Harm
          - generic [ref=e487] [cursor=pointer]:
            - generic [ref=e488]: النَّافِعُ
            - generic [ref=e489]: An-Nafi
            - generic [ref=e490]: The Propitious
            - generic [ref=e491]: The Creator of Good
          - generic [ref=e492] [cursor=pointer]:
            - generic [ref=e493]: النُّورُ
            - generic [ref=e494]: An-Nur
            - generic [ref=e495]: The Light
            - generic [ref=e496]: The Illuminator
          - generic [ref=e497] [cursor=pointer]:
            - generic [ref=e498]: الْهَادِي
            - generic [ref=e499]: Al-Hadi
            - generic [ref=e500]: The Guide
            - generic [ref=e501]: The Provider of Guidance
          - generic [ref=e502] [cursor=pointer]:
            - generic [ref=e503]: الْبَدِيعُ
            - generic [ref=e504]: Al-Badi
            - generic [ref=e505]: The Incomparable
            - generic [ref=e506]: The Originator
          - generic [ref=e507] [cursor=pointer]:
            - generic [ref=e508]: الْبَاقِي
            - generic [ref=e509]: Al-Baqi
            - generic [ref=e510]: The Everlasting
            - generic [ref=e511]: The Eternal
          - generic [ref=e512] [cursor=pointer]:
            - generic [ref=e513]: الْوَارِثُ
            - generic [ref=e514]: Al-Warith
            - generic [ref=e515]: The Inheritor
            - generic [ref=e516]: The Supreme Inheritor
          - generic [ref=e517] [cursor=pointer]:
            - generic [ref=e518]: الرَّشِيدُ
            - generic [ref=e519]: Ar-Rashid
            - generic [ref=e520]: The Guide
            - generic [ref=e521]: The Righteous Teacher
          - generic [ref=e522] [cursor=pointer]:
            - generic [ref=e523]: الصَّبُورُ
            - generic [ref=e524]: As-Sabur
            - generic [ref=e525]: The Patient
            - generic [ref=e526]: The Most Patient
    - alert [ref=e527]:
      - generic [ref=e529]:
        - generic [ref=e530]: We use cookies to improve your experience and analyze site usage.
        - generic [ref=e531]: By clicking 'Accept', you consent to our use of cookies for analytics.
      - generic [ref=e532]:
        - button "Accept" [ref=e533] [cursor=pointer]:
          - generic [ref=e535]: Accept
        - button "Decline" [ref=e536] [cursor=pointer]:
          - generic [ref=e538]: Decline
    - contentinfo [ref=e539]:
      - generic [ref=e540]:
        - generic [ref=e541]:
          - img "decor" [ref=e542]
          - generic [ref=e543]: © 2026 Peace2074 · v3.3.27
        - navigation "Footer links" [ref=e544]:
          - link "About" [ref=e545] [cursor=pointer]:
            - /url: /about
          - link "Quran" [ref=e546] [cursor=pointer]:
            - /url: /quran
          - link "Terms and Conditions" [ref=e547] [cursor=pointer]:
            - /url: /terms
          - link "Privacy Policy" [ref=e548] [cursor=pointer]:
            - /url: /privacy
          - link "Contact" [ref=e549] [cursor=pointer]:
            - /url: /contact
          - link "Credits" [ref=e550] [cursor=pointer]:
            - /url: /credits
  - generic: God bless my mom
```

# Test source

```ts
  39  |         test(`keeps large surfaces dark on ${route.path}`, async ({ page }) => {
  40  |             await page.addInitScript(() => {
  41  |                 localStorage.setItem('peace2074:pref-theme-mode', 'dark')
  42  |             })
  43  | 
  44  |             await page.goto(route.path)
  45  |             await page.waitForLoadState('networkidle')
  46  |             await expect
  47  |                 .poll(async () =>
  48  |                     page.evaluate(
  49  |                         (key) => window.localStorage.getItem(key),
  50  |                         namespacedKey('pref-theme-mode')
  51  |                     )
  52  |                 )
  53  |                 .toBe('dark')
  54  |             await expect(page.locator('body')).toHaveClass(/body--dark/)
  55  |             await expect(page.locator(route.readySelector).first()).toBeVisible()
  56  | 
  57  |             const issues = await page.evaluate(() => {
  58  |                 const parseColor = (value: string) => {
  59  |                     const match = value.match(/rgba?\(([^)]+)\)/i)
  60  |                     if (!match) return null
  61  | 
  62  |                     const [r, g, b, alpha = '1'] = match[1]
  63  |                         .split(',')
  64  |                         .map((segment) => segment.trim())
  65  | 
  66  |                     return {
  67  |                         r: Number.parseFloat(r),
  68  |                         g: Number.parseFloat(g),
  69  |                         b: Number.parseFloat(b),
  70  |                         alpha: Number.parseFloat(alpha),
  71  |                     }
  72  |                 }
  73  | 
  74  |                 const isBrightNeutral = (color: {
  75  |                     r: number
  76  |                     g: number
  77  |                     b: number
  78  |                     alpha: number
  79  |                 }) => {
  80  |                     if (color.alpha < 0.85) return false
  81  | 
  82  |                     const values = [color.r, color.g, color.b]
  83  |                     const min = Math.min(...values)
  84  |                     const max = Math.max(...values)
  85  | 
  86  |                     return min >= 200 && max - min <= 35
  87  |                 }
  88  | 
  89  |                 const selectorsForElement = (element: Element) => {
  90  |                     const htmlElement = element as HTMLElement
  91  |                     const tag = element.tagName.toLowerCase()
  92  |                     const id = htmlElement.id ? `#${htmlElement.id}` : ''
  93  |                     const classNames = Array.from(htmlElement.classList)
  94  |                         .slice(0, 3)
  95  |                         .map((className) => `.${className}`)
  96  |                         .join('')
  97  | 
  98  |                     return `${tag}${id}${classNames}`
  99  |                 }
  100 | 
  101 |                 const elements = Array.from(document.body.querySelectorAll('*'))
  102 |                 const offenders: SurfaceIssue[] = []
  103 | 
  104 |                 for (const element of elements) {
  105 |                     if (!(element instanceof HTMLElement)) continue
  106 | 
  107 |                     const style = window.getComputedStyle(element)
  108 | 
  109 |                     if (
  110 |                         style.display === 'none' ||
  111 |                         style.visibility === 'hidden' ||
  112 |                         Number.parseFloat(style.opacity || '1') === 0
  113 |                     ) {
  114 |                         continue
  115 |                     }
  116 | 
  117 |                     const rect = element.getBoundingClientRect()
  118 |                     if (rect.width < 64 || rect.height < 64) continue
  119 | 
  120 |                     const color = parseColor(style.backgroundColor)
  121 |                     if (!color || !isBrightNeutral(color)) continue
  122 | 
  123 |                     offenders.push({
  124 |                         selector: selectorsForElement(element),
  125 |                         backgroundColor: style.backgroundColor,
  126 |                         width: Math.round(rect.width),
  127 |                         height: Math.round(rect.height),
  128 |                     })
  129 | 
  130 |                     if (offenders.length >= 10) break
  131 |                 }
  132 | 
  133 |                 return offenders
  134 |             })
  135 | 
  136 |             expect(
  137 |                 issues,
  138 |                 `Found bright neutral surfaces in dark mode on ${route.path}: ${JSON.stringify(issues, null, 2)}`
> 139 |             ).toEqual([])
      |               ^ Error: Found bright neutral surfaces in dark mode on /holynames: [
  140 |         })
  141 |     }
  142 | })
  143 | 
```