# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-mode.spec.ts >> dark mode public route smoke test >> keeps large surfaces dark on /quran/12/reader
- Location: tests/dark-mode.spec.ts:39:9

# Error details

```
Error: Test timeout of 30000ms exceeded
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner:
      - navigation:
        - link "← Back":
          - /url: /quran
        - heading "Quran" [level=1]
        - link "Home":
          - /url: /
    - main [ref=e6]:
      - generic [ref=e7]:
        - link "← Back to list" [ref=e8] [cursor=pointer]:
          - /url: /quran
          - generic [ref=e10]: ← Back to list
        - alert [ref=e11]:
          - generic [ref=e13]: stop
          - generic [ref=e15]:
            - generic [ref=e16]: Play recitation
            - generic [ref=e17]: sura number 12 • verses 1 / 111 • Audio
          - generic [ref=e19]:
            - generic [ref=e20]: Play recitation
            - switch [disabled] [ref=e21]:
              - generic [ref=e25]: play_arrow
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]: Joseph — يوسف
              - generic [ref=e30]: "sura number: 12 • meccan • 111"
            - generic [ref=e31]:
              - button "Shazam Audio Sync" [ref=e32] [cursor=pointer]:
                - generic [ref=e33]:
                  - img [ref=e34]: graphic_eq
                  - generic [ref=e35]: Shazam Audio Sync
              - generic [ref=e36]:
                - button "Audio" [pressed] [ref=e37] [cursor=pointer]:
                  - generic [ref=e38]:
                    - img [ref=e39]: volume_up
                    - generic [ref=e40]: Audio
                - button "TTS" [ref=e41] [cursor=pointer]:
                  - generic [ref=e42]:
                    - img [ref=e43]: record_voice_over
                    - generic [ref=e44]: TTS
              - generic [ref=e46]:
                - generic [ref=e47]: Play recitation
                - switch [disabled] [ref=e48]:
                  - generic [ref=e52]: play_arrow
              - switch "Auto-continue to next sura" [ref=e53] [cursor=pointer]:
                - generic [ref=e57]: Auto-continue to next sura
              - generic [ref=e62] [cursor=pointer]:
                - generic [ref=e63]: 1x
                - combobox "1x" [ref=e64]
              - generic [ref=e66]:
                - button "Mushaf mode" [ref=e67] [cursor=pointer]:
                  - generic [ref=e68]:
                    - img [ref=e69]: auto_stories
                    - generic [ref=e70]: Mushaf mode
                - button "Reader mode" [pressed] [ref=e71] [cursor=pointer]:
                  - generic [ref=e72]:
                    - img [ref=e73]: menu_book
                    - generic [ref=e74]: Reader mode
                - button "Native mode" [ref=e75] [cursor=pointer]:
                  - generic [ref=e76]:
                    - img [ref=e77]: article
                    - generic [ref=e78]: Native mode
              - button "Quick" [ref=e79] [cursor=pointer]:
                - generic [ref=e80]:
                  - img [ref=e81]: flash_on
                  - generic [ref=e82]: Quick
              - button "Bookmarks" [ref=e83] [cursor=pointer]:
                - generic [ref=e84]:
                  - img [ref=e85]: bookmark
                  - generic [ref=e86]: Bookmarks
              - generic [ref=e87]:
                - generic [ref=e88]: cloud_off
                - generic [ref=e89]: Internet currently required
              - button "Offline Recitation" [ref=e90] [cursor=pointer]:
                - generic [ref=e91]:
                  - img [ref=e92]: download
                  - generic [ref=e93]: Offline Recitation
          - generic [ref=e95]:
            - generic [ref=e97] [cursor=pointer]:
              - generic [ref=e98]:
                - generic [ref=e99]: "1"
                - button "Bookmark verse 1" [ref=e100]:
                  - generic [ref=e101]: star_outline
                - button "Share verse 12:1" [ref=e102]:
                  - generic [ref=e103]: share
              - generic [ref=e104]: الٓرۚ تِلۡكَ ءَايَٰتُ ٱلۡكِتَٰبِ ٱلۡمُبِينِ
            - generic [ref=e106] [cursor=pointer]:
              - generic [ref=e107]:
                - generic [ref=e108]: "2"
                - button "Bookmark verse 2" [ref=e109]:
                  - generic [ref=e110]: star_outline
                - button "Share verse 12:2" [ref=e111]:
                  - generic [ref=e112]: share
              - generic [ref=e113]: إِنَّآ أَنزَلۡنَٰهُ قُرۡءَٰنًا عَرَبِيّٗا لَّعَلَّكُمۡ تَعۡقِلُونَ
            - generic [ref=e115] [cursor=pointer]:
              - generic [ref=e116]:
                - generic [ref=e117]: "3"
                - button "Bookmark verse 3" [ref=e118]:
                  - generic [ref=e119]: star_outline
                - button "Share verse 12:3" [ref=e120]:
                  - generic [ref=e121]: share
              - generic [ref=e122]: نَحۡنُ نَقُصُّ عَلَيۡكَ أَحۡسَنَ ٱلۡقَصَصِ بِمَآ أَوۡحَيۡنَآ إِلَيۡكَ هَٰذَا ٱلۡقُرۡءَانَ وَإِن كُنتَ مِن قَبۡلِهِۦ لَمِنَ ٱلۡغَٰفِلِينَ
            - generic [ref=e124] [cursor=pointer]:
              - generic [ref=e125]:
                - generic [ref=e126]: "4"
                - button "Bookmark verse 4" [ref=e127]:
                  - generic [ref=e128]: star_outline
                - button "Share verse 12:4" [ref=e129]:
                  - generic [ref=e130]: share
              - generic [ref=e131]: إِذۡ قَالَ يُوسُفُ لِأَبِيهِ يَـٰٓأَبَتِ إِنِّي رَأَيۡتُ أَحَدَ عَشَرَ كَوۡكَبٗا وَٱلشَّمۡسَ وَٱلۡقَمَرَ رَأَيۡتُهُمۡ لِي سَٰجِدِينَ
            - generic [ref=e133] [cursor=pointer]:
              - generic [ref=e134]:
                - generic [ref=e135]: "5"
                - button "Bookmark verse 5" [ref=e136]:
                  - generic [ref=e137]: star_outline
                - button "Share verse 12:5" [ref=e138]:
                  - generic [ref=e139]: share
              - generic [ref=e140]: قَالَ يَٰبُنَيَّ لَا تَقۡصُصۡ رُءۡيَاكَ عَلَىٰٓ إِخۡوَتِكَ فَيَكِيدُواْ لَكَ كَيۡدًاۖ إِنَّ ٱلشَّيۡطَٰنَ لِلۡإِنسَٰنِ عَدُوّٞ مُّبِينٞ
            - generic [ref=e142] [cursor=pointer]:
              - generic [ref=e143]:
                - generic [ref=e144]: "6"
                - button "Bookmark verse 6" [ref=e145]:
                  - generic [ref=e146]: star_outline
                - button "Share verse 12:6" [ref=e147]:
                  - generic [ref=e148]: share
              - generic [ref=e149]: وَكَذَٰلِكَ يَجۡتَبِيكَ رَبُّكَ وَيُعَلِّمُكَ مِن تَأۡوِيلِ ٱلۡأَحَادِيثِ وَيُتِمُّ نِعۡمَتَهُۥ عَلَيۡكَ وَعَلَىٰٓ ءَالِ يَعۡقُوبَ كَمَآ أَتَمَّهَا عَلَىٰٓ أَبَوَيۡكَ مِن قَبۡلُ إِبۡرَٰهِيمَ وَإِسۡحَٰقَۚ إِنَّ رَبَّكَ عَلِيمٌ حَكِيمٞ
            - generic [ref=e151] [cursor=pointer]:
              - generic [ref=e152]:
                - generic [ref=e153]: "7"
                - button "Bookmark verse 7" [ref=e154]:
                  - generic [ref=e155]: star_outline
                - button "Share verse 12:7" [ref=e156]:
                  - generic [ref=e157]: share
              - generic [ref=e158]: ۞لَّقَدۡ كَانَ فِي يُوسُفَ وَإِخۡوَتِهِۦٓ ءَايَٰتٞ لِّلسَّآئِلِينَ
            - generic [ref=e160] [cursor=pointer]:
              - generic [ref=e161]:
                - generic [ref=e162]: "8"
                - button "Bookmark verse 8" [ref=e163]:
                  - generic [ref=e164]: star_outline
                - button "Share verse 12:8" [ref=e165]:
                  - generic [ref=e166]: share
              - generic [ref=e167]: إِذۡ قَالُواْ لَيُوسُفُ وَأَخُوهُ أَحَبُّ إِلَىٰٓ أَبِينَا مِنَّا وَنَحۡنُ عُصۡبَةٌ إِنَّ أَبَانَا لَفِي ضَلَٰلٖ مُّبِينٍ
            - generic [ref=e169] [cursor=pointer]:
              - generic [ref=e170]:
                - generic [ref=e171]: "9"
                - button "Bookmark verse 9" [ref=e172]:
                  - generic [ref=e173]: star_outline
                - button "Share verse 12:9" [ref=e174]:
                  - generic [ref=e175]: share
              - generic [ref=e176]: ٱقۡتُلُواْ يُوسُفَ أَوِ ٱطۡرَحُوهُ أَرۡضٗا يَخۡلُ لَكُمۡ وَجۡهُ أَبِيكُمۡ وَتَكُونُواْ مِنۢ بَعۡدِهِۦ قَوۡمٗا صَٰلِحِينَ
            - generic [ref=e178] [cursor=pointer]:
              - generic [ref=e179]:
                - generic [ref=e180]: "10"
                - button "Bookmark verse 10" [ref=e181]:
                  - generic [ref=e182]: star_outline
                - button "Share verse 12:10" [ref=e183]:
                  - generic [ref=e184]: share
              - generic [ref=e185]: قَالَ قَآئِلٞ مِّنۡهُمۡ لَا تَقۡتُلُواْ يُوسُفَ وَأَلۡقُوهُ فِي غَيَٰبَتِ ٱلۡجُبِّ يَلۡتَقِطۡهُ بَعۡضُ ٱلسَّيَّارَةِ إِن كُنتُمۡ فَٰعِلِينَ
            - generic [ref=e187] [cursor=pointer]:
              - generic [ref=e188]:
                - generic [ref=e189]: "11"
                - button "Bookmark verse 11" [ref=e190]:
                  - generic [ref=e191]: star_outline
                - button "Share verse 12:11" [ref=e192]:
                  - generic [ref=e193]: share
              - generic [ref=e194]: قَالُواْ يَـٰٓأَبَانَا مَا لَكَ لَا تَأۡمَ۬نَّا عَلَىٰ يُوسُفَ وَإِنَّا لَهُۥ لَنَٰصِحُونَ
            - generic [ref=e196] [cursor=pointer]:
              - generic [ref=e197]:
                - generic [ref=e198]: "12"
                - button "Bookmark verse 12" [ref=e199]:
                  - generic [ref=e200]: star_outline
                - button "Share verse 12:12" [ref=e201]:
                  - generic [ref=e202]: share
              - generic [ref=e203]: أَرۡسِلۡهُ مَعَنَا غَدٗا يَرۡتَعۡ وَيَلۡعَبۡ وَإِنَّا لَهُۥ لَحَٰفِظُونَ
            - generic [ref=e205] [cursor=pointer]:
              - generic [ref=e206]:
                - generic [ref=e207]: "13"
                - button "Bookmark verse 13" [ref=e208]:
                  - generic [ref=e209]: star_outline
                - button "Share verse 12:13" [ref=e210]:
                  - generic [ref=e211]: share
              - generic [ref=e212]: قَالَ إِنِّي لَيَحۡزُنُنِيٓ أَن تَذۡهَبُواْ بِهِۦ وَأَخَافُ أَن يَأۡكُلَهُ ٱلذِّئۡبُ وَأَنتُمۡ عَنۡهُ غَٰفِلُونَ
            - generic [ref=e214] [cursor=pointer]:
              - generic [ref=e215]:
                - generic [ref=e216]: "14"
                - button "Bookmark verse 14" [ref=e217]:
                  - generic [ref=e218]: star_outline
                - button "Share verse 12:14" [ref=e219]:
                  - generic [ref=e220]: share
              - generic [ref=e221]: قَالُواْ لَئِنۡ أَكَلَهُ ٱلذِّئۡبُ وَنَحۡنُ عُصۡبَةٌ إِنَّآ إِذٗا لَّخَٰسِرُونَ
            - generic [ref=e223] [cursor=pointer]:
              - generic [ref=e224]:
                - generic [ref=e225]: "15"
                - button "Bookmark verse 15" [ref=e226]:
                  - generic [ref=e227]: star_outline
                - button "Share verse 12:15" [ref=e228]:
                  - generic [ref=e229]: share
              - generic [ref=e230]: فَلَمَّا ذَهَبُواْ بِهِۦ وَأَجۡمَعُوٓاْ أَن يَجۡعَلُوهُ فِي غَيَٰبَتِ ٱلۡجُبِّۚ وَأَوۡحَيۡنَآ إِلَيۡهِ لَتُنَبِّئَنَّهُم بِأَمۡرِهِمۡ هَٰذَا وَهُمۡ لَا يَشۡعُرُونَ
            - generic [ref=e232] [cursor=pointer]:
              - generic [ref=e233]:
                - generic [ref=e234]: "16"
                - button "Bookmark verse 16" [ref=e235]:
                  - generic [ref=e236]: star_outline
                - button "Share verse 12:16" [ref=e237]:
                  - generic [ref=e238]: share
              - generic [ref=e239]: وَجَآءُوٓ أَبَاهُمۡ عِشَآءٗ يَبۡكُونَ
            - generic [ref=e241] [cursor=pointer]:
              - generic [ref=e242]:
                - generic [ref=e243]: "17"
                - button "Bookmark verse 17" [ref=e244]:
                  - generic [ref=e245]: star_outline
                - button "Share verse 12:17" [ref=e246]:
                  - generic [ref=e247]: share
              - generic [ref=e248]: قَالُواْ يَـٰٓأَبَانَآ إِنَّا ذَهَبۡنَا نَسۡتَبِقُ وَتَرَكۡنَا يُوسُفَ عِندَ مَتَٰعِنَا فَأَكَلَهُ ٱلذِّئۡبُۖ وَمَآ أَنتَ بِمُؤۡمِنٖ لَّنَا وَلَوۡ كُنَّا صَٰدِقِينَ
            - generic [ref=e250] [cursor=pointer]:
              - generic [ref=e251]:
                - generic [ref=e252]: "18"
                - button "Bookmark verse 18" [ref=e253]:
                  - generic [ref=e254]: star_outline
                - button "Share verse 12:18" [ref=e255]:
                  - generic [ref=e256]: share
              - generic [ref=e257]: وَجَآءُو عَلَىٰ قَمِيصِهِۦ بِدَمٖ كَذِبٖۚ قَالَ بَلۡ سَوَّلَتۡ لَكُمۡ أَنفُسُكُمۡ أَمۡرٗاۖ فَصَبۡرٞ جَمِيلٞۖ وَٱللَّهُ ٱلۡمُسۡتَعَانُ عَلَىٰ مَا تَصِفُونَ
            - generic [ref=e259] [cursor=pointer]:
              - generic [ref=e260]:
                - generic [ref=e261]: "19"
                - button "Bookmark verse 19" [ref=e262]:
                  - generic [ref=e263]: star_outline
                - button "Share verse 12:19" [ref=e264]:
                  - generic [ref=e265]: share
              - generic [ref=e266]: وَجَآءَتۡ سَيَّارَةٞ فَأَرۡسَلُواْ وَارِدَهُمۡ فَأَدۡلَىٰ دَلۡوَهُۥۖ قَالَ يَٰبُشۡرَىٰ هَٰذَا غُلَٰمٞۚ وَأَسَرُّوهُ بِضَٰعَةٗۚ وَٱللَّهُ عَلِيمُۢ بِمَا يَعۡمَلُونَ
            - generic [ref=e268] [cursor=pointer]:
              - generic [ref=e269]:
                - generic [ref=e270]: "20"
                - button "Bookmark verse 20" [ref=e271]:
                  - generic [ref=e272]: star_outline
                - button "Share verse 12:20" [ref=e273]:
                  - generic [ref=e274]: share
              - generic [ref=e275]: وَشَرَوۡهُ بِثَمَنِۭ بَخۡسٖ دَرَٰهِمَ مَعۡدُودَةٖ وَكَانُواْ فِيهِ مِنَ ٱلزَّـٰهِدِينَ
            - generic [ref=e277] [cursor=pointer]:
              - generic [ref=e278]:
                - generic [ref=e279]: "21"
                - button "Bookmark verse 21" [ref=e280]:
                  - generic [ref=e281]: star_outline
                - button "Share verse 12:21" [ref=e282]:
                  - generic [ref=e283]: share
              - generic [ref=e284]: وَقَالَ ٱلَّذِي ٱشۡتَرَىٰهُ مِن مِّصۡرَ لِٱمۡرَأَتِهِۦٓ أَكۡرِمِي مَثۡوَىٰهُ عَسَىٰٓ أَن يَنفَعَنَآ أَوۡ نَتَّخِذَهُۥ وَلَدٗاۚ وَكَذَٰلِكَ مَكَّنَّا لِيُوسُفَ فِي ٱلۡأَرۡضِ وَلِنُعَلِّمَهُۥ مِن تَأۡوِيلِ ٱلۡأَحَادِيثِۚ وَٱللَّهُ غَالِبٌ عَلَىٰٓ أَمۡرِهِۦ وَلَٰكِنَّ أَكۡثَرَ ٱلنَّاسِ لَا يَعۡلَمُونَ
            - generic [ref=e286] [cursor=pointer]:
              - generic [ref=e287]:
                - generic [ref=e288]: "22"
                - button "Bookmark verse 22" [ref=e289]:
                  - generic [ref=e290]: star_outline
                - button "Share verse 12:22" [ref=e291]:
                  - generic [ref=e292]: share
              - generic [ref=e293]: وَلَمَّا بَلَغَ أَشُدَّهُۥٓ ءَاتَيۡنَٰهُ حُكۡمٗا وَعِلۡمٗاۚ وَكَذَٰلِكَ نَجۡزِي ٱلۡمُحۡسِنِينَ
            - generic [ref=e295] [cursor=pointer]:
              - generic [ref=e296]:
                - generic [ref=e297]: "23"
                - button "Bookmark verse 23" [ref=e298]:
                  - generic [ref=e299]: star_outline
                - button "Share verse 12:23" [ref=e300]:
                  - generic [ref=e301]: share
              - generic [ref=e302]: وَرَٰوَدَتۡهُ ٱلَّتِي هُوَ فِي بَيۡتِهَا عَن نَّفۡسِهِۦ وَغَلَّقَتِ ٱلۡأَبۡوَٰبَ وَقَالَتۡ هَيۡتَ لَكَۚ قَالَ مَعَاذَ ٱللَّهِۖ إِنَّهُۥ رَبِّيٓ أَحۡسَنَ مَثۡوَايَۖ إِنَّهُۥ لَا يُفۡلِحُ ٱلظَّـٰلِمُونَ
            - generic [ref=e304] [cursor=pointer]:
              - generic [ref=e305]:
                - generic [ref=e306]: "24"
                - button "Bookmark verse 24" [ref=e307]:
                  - generic [ref=e308]: star_outline
                - button "Share verse 12:24" [ref=e309]:
                  - generic [ref=e310]: share
              - generic [ref=e311]: وَلَقَدۡ هَمَّتۡ بِهِۦۖ وَهَمَّ بِهَا لَوۡلَآ أَن رَّءَا بُرۡهَٰنَ رَبِّهِۦۚ كَذَٰلِكَ لِنَصۡرِفَ عَنۡهُ ٱلسُّوٓءَ وَٱلۡفَحۡشَآءَۚ إِنَّهُۥ مِنۡ عِبَادِنَا ٱلۡمُخۡلَصِينَ
            - generic [ref=e313] [cursor=pointer]:
              - generic [ref=e314]:
                - generic [ref=e315]: "25"
                - button "Bookmark verse 25" [ref=e316]:
                  - generic [ref=e317]: star_outline
                - button "Share verse 12:25" [ref=e318]:
                  - generic [ref=e319]: share
              - generic [ref=e320]: وَٱسۡتَبَقَا ٱلۡبَابَ وَقَدَّتۡ قَمِيصَهُۥ مِن دُبُرٖ وَأَلۡفَيَا سَيِّدَهَا لَدَا ٱلۡبَابِۚ قَالَتۡ مَا جَزَآءُ مَنۡ أَرَادَ بِأَهۡلِكَ سُوٓءًا إِلَّآ أَن يُسۡجَنَ أَوۡ عَذَابٌ أَلِيمٞ
            - generic [ref=e322] [cursor=pointer]:
              - generic [ref=e323]:
                - generic [ref=e324]: "26"
                - button "Bookmark verse 26" [ref=e325]:
                  - generic [ref=e326]: star_outline
                - button "Share verse 12:26" [ref=e327]:
                  - generic [ref=e328]: share
              - generic [ref=e329]: قَالَ هِيَ رَٰوَدَتۡنِي عَن نَّفۡسِيۚ وَشَهِدَ شَاهِدٞ مِّنۡ أَهۡلِهَآ إِن كَانَ قَمِيصُهُۥ قُدَّ مِن قُبُلٖ فَصَدَقَتۡ وَهُوَ مِنَ ٱلۡكَٰذِبِينَ
            - generic [ref=e331] [cursor=pointer]:
              - generic [ref=e332]:
                - generic [ref=e333]: "27"
                - button "Bookmark verse 27" [ref=e334]:
                  - generic [ref=e335]: star_outline
                - button "Share verse 12:27" [ref=e336]:
                  - generic [ref=e337]: share
              - generic [ref=e338]: وَإِن كَانَ قَمِيصُهُۥ قُدَّ مِن دُبُرٖ فَكَذَبَتۡ وَهُوَ مِنَ ٱلصَّـٰدِقِينَ
            - generic [ref=e340] [cursor=pointer]:
              - generic [ref=e341]:
                - generic [ref=e342]: "28"
                - button "Bookmark verse 28" [ref=e343]:
                  - generic [ref=e344]: star_outline
                - button "Share verse 12:28" [ref=e345]:
                  - generic [ref=e346]: share
              - generic [ref=e347]: فَلَمَّا رَءَا قَمِيصَهُۥ قُدَّ مِن دُبُرٖ قَالَ إِنَّهُۥ مِن كَيۡدِكُنَّۖ إِنَّ كَيۡدَكُنَّ عَظِيمٞ
            - generic [ref=e349] [cursor=pointer]:
              - generic [ref=e350]:
                - generic [ref=e351]: "29"
                - button "Bookmark verse 29" [ref=e352]:
                  - generic [ref=e353]: star_outline
                - button "Share verse 12:29" [ref=e354]:
                  - generic [ref=e355]: share
              - generic [ref=e356]: يُوسُفُ أَعۡرِضۡ عَنۡ هَٰذَاۚ وَٱسۡتَغۡفِرِي لِذَنۢبِكِۖ إِنَّكِ كُنتِ مِنَ ٱلۡخَاطِـِٔينَ
            - generic [ref=e358] [cursor=pointer]:
              - generic [ref=e359]:
                - generic [ref=e360]: "30"
                - button "Bookmark verse 30" [ref=e361]:
                  - generic [ref=e362]: star_outline
                - button "Share verse 12:30" [ref=e363]:
                  - generic [ref=e364]: share
              - generic [ref=e365]: ۞وَقَالَ نِسۡوَةٞ فِي ٱلۡمَدِينَةِ ٱمۡرَأَتُ ٱلۡعَزِيزِ تُرَٰوِدُ فَتَىٰهَا عَن نَّفۡسِهِۦۖ قَدۡ شَغَفَهَا حُبًّاۖ إِنَّا لَنَرَىٰهَا فِي ضَلَٰلٖ مُّبِينٖ
            - generic [ref=e367] [cursor=pointer]:
              - generic [ref=e368]:
                - generic [ref=e369]: "31"
                - button "Bookmark verse 31" [ref=e370]:
                  - generic [ref=e371]: star_outline
                - button "Share verse 12:31" [ref=e372]:
                  - generic [ref=e373]: share
              - generic [ref=e374]: فَلَمَّا سَمِعَتۡ بِمَكۡرِهِنَّ أَرۡسَلَتۡ إِلَيۡهِنَّ وَأَعۡتَدَتۡ لَهُنَّ مُتَّكَـٔٗا وَءَاتَتۡ كُلَّ وَٰحِدَةٖ مِّنۡهُنَّ سِكِّينٗا وَقَالَتِ ٱخۡرُجۡ عَلَيۡهِنَّۖ فَلَمَّا رَأَيۡنَهُۥٓ أَكۡبَرۡنَهُۥ وَقَطَّعۡنَ أَيۡدِيَهُنَّ وَقُلۡنَ حَٰشَ لِلَّهِ مَا هَٰذَا بَشَرًا إِنۡ هَٰذَآ إِلَّا مَلَكٞ كَرِيمٞ
            - generic [ref=e376] [cursor=pointer]:
              - generic [ref=e377]:
                - generic [ref=e378]: "32"
                - button "Bookmark verse 32" [ref=e379]:
                  - generic [ref=e380]: star_outline
                - button "Share verse 12:32" [ref=e381]:
                  - generic [ref=e382]: share
              - generic [ref=e383]: قَالَتۡ فَذَٰلِكُنَّ ٱلَّذِي لُمۡتُنَّنِي فِيهِۖ وَلَقَدۡ رَٰوَدتُّهُۥ عَن نَّفۡسِهِۦ فَٱسۡتَعۡصَمَۖ وَلَئِن لَّمۡ يَفۡعَلۡ مَآ ءَامُرُهُۥ لَيُسۡجَنَنَّ وَلَيَكُونٗا مِّنَ ٱلصَّـٰغِرِينَ
            - generic [ref=e385] [cursor=pointer]:
              - generic [ref=e386]:
                - generic [ref=e387]: "33"
                - button "Bookmark verse 33" [ref=e388]:
                  - generic [ref=e389]: star_outline
                - button "Share verse 12:33" [ref=e390]:
                  - generic [ref=e391]: share
              - generic [ref=e392]: قَالَ رَبِّ ٱلسِّجۡنُ أَحَبُّ إِلَيَّ مِمَّا يَدۡعُونَنِيٓ إِلَيۡهِۖ وَإِلَّا تَصۡرِفۡ عَنِّي كَيۡدَهُنَّ أَصۡبُ إِلَيۡهِنَّ وَأَكُن مِّنَ ٱلۡجَٰهِلِينَ
            - generic [ref=e394] [cursor=pointer]:
              - generic [ref=e395]:
                - generic [ref=e396]: "34"
                - button "Bookmark verse 34" [ref=e397]:
                  - generic [ref=e398]: star_outline
                - button "Share verse 12:34" [ref=e399]:
                  - generic [ref=e400]: share
              - generic [ref=e401]: فَٱسۡتَجَابَ لَهُۥ رَبُّهُۥ فَصَرَفَ عَنۡهُ كَيۡدَهُنَّۚ إِنَّهُۥ هُوَ ٱلسَّمِيعُ ٱلۡعَلِيمُ
            - generic [ref=e403] [cursor=pointer]:
              - generic [ref=e404]:
                - generic [ref=e405]: "35"
                - button "Bookmark verse 35" [ref=e406]:
                  - generic [ref=e407]: star_outline
                - button "Share verse 12:35" [ref=e408]:
                  - generic [ref=e409]: share
              - generic [ref=e410]: ثُمَّ بَدَا لَهُم مِّنۢ بَعۡدِ مَا رَأَوُاْ ٱلۡأٓيَٰتِ لَيَسۡجُنُنَّهُۥ حَتَّىٰ حِينٖ
            - generic [ref=e412] [cursor=pointer]:
              - generic [ref=e413]:
                - generic [ref=e414]: "36"
                - button "Bookmark verse 36" [ref=e415]:
                  - generic [ref=e416]: star_outline
                - button "Share verse 12:36" [ref=e417]:
                  - generic [ref=e418]: share
              - generic [ref=e419]: وَدَخَلَ مَعَهُ ٱلسِّجۡنَ فَتَيَانِۖ قَالَ أَحَدُهُمَآ إِنِّيٓ أَرَىٰنِيٓ أَعۡصِرُ خَمۡرٗاۖ وَقَالَ ٱلۡأٓخَرُ إِنِّيٓ أَرَىٰنِيٓ أَحۡمِلُ فَوۡقَ رَأۡسِي خُبۡزٗا تَأۡكُلُ ٱلطَّيۡرُ مِنۡهُۖ نَبِّئۡنَا بِتَأۡوِيلِهِۦٓۖ إِنَّا نَرَىٰكَ مِنَ ٱلۡمُحۡسِنِينَ
            - generic [ref=e421] [cursor=pointer]:
              - generic [ref=e422]:
                - generic [ref=e423]: "37"
                - button "Bookmark verse 37" [ref=e424]:
                  - generic [ref=e425]: star_outline
                - button "Share verse 12:37" [ref=e426]:
                  - generic [ref=e427]: share
              - generic [ref=e428]: قَالَ لَا يَأۡتِيكُمَا طَعَامٞ تُرۡزَقَانِهِۦٓ إِلَّا نَبَّأۡتُكُمَا بِتَأۡوِيلِهِۦ قَبۡلَ أَن يَأۡتِيَكُمَاۚ ذَٰلِكُمَا مِمَّا عَلَّمَنِي رَبِّيٓۚ إِنِّي تَرَكۡتُ مِلَّةَ قَوۡمٖ لَّا يُؤۡمِنُونَ بِٱللَّهِ وَهُم بِٱلۡأٓخِرَةِ هُمۡ كَٰفِرُونَ
            - generic [ref=e430] [cursor=pointer]:
              - generic [ref=e431]:
                - generic [ref=e432]: "38"
                - button "Bookmark verse 38" [ref=e433]:
                  - generic [ref=e434]: star_outline
                - button "Share verse 12:38" [ref=e435]:
                  - generic [ref=e436]: share
              - generic [ref=e437]: وَٱتَّبَعۡتُ مِلَّةَ ءَابَآءِيٓ إِبۡرَٰهِيمَ وَإِسۡحَٰقَ وَيَعۡقُوبَۚ مَا كَانَ لَنَآ أَن نُّشۡرِكَ بِٱللَّهِ مِن شَيۡءٖۚ ذَٰلِكَ مِن فَضۡلِ ٱللَّهِ عَلَيۡنَا وَعَلَى ٱلنَّاسِ وَلَٰكِنَّ أَكۡثَرَ ٱلنَّاسِ لَا يَشۡكُرُونَ
            - generic [ref=e439] [cursor=pointer]:
              - generic [ref=e440]:
                - generic [ref=e441]: "39"
                - button "Bookmark verse 39" [ref=e442]:
                  - generic [ref=e443]: star_outline
                - button "Share verse 12:39" [ref=e444]:
                  - generic [ref=e445]: share
              - generic [ref=e446]: يَٰصَٰحِبَيِ ٱلسِّجۡنِ ءَأَرۡبَابٞ مُّتَفَرِّقُونَ خَيۡرٌ أَمِ ٱللَّهُ ٱلۡوَٰحِدُ ٱلۡقَهَّارُ
            - generic [ref=e448] [cursor=pointer]:
              - generic [ref=e449]:
                - generic [ref=e450]: "40"
                - button "Bookmark verse 40" [ref=e451]:
                  - generic [ref=e452]: star_outline
                - button "Share verse 12:40" [ref=e453]:
                  - generic [ref=e454]: share
              - generic [ref=e455]: مَا تَعۡبُدُونَ مِن دُونِهِۦٓ إِلَّآ أَسۡمَآءٗ سَمَّيۡتُمُوهَآ أَنتُمۡ وَءَابَآؤُكُم مَّآ أَنزَلَ ٱللَّهُ بِهَا مِن سُلۡطَٰنٍۚ إِنِ ٱلۡحُكۡمُ إِلَّا لِلَّهِ أَمَرَ أَلَّا تَعۡبُدُوٓاْ إِلَّآ إِيَّاهُۚ ذَٰلِكَ ٱلدِّينُ ٱلۡقَيِّمُ وَلَٰكِنَّ أَكۡثَرَ ٱلنَّاسِ لَا يَعۡلَمُونَ
            - generic [ref=e457] [cursor=pointer]:
              - generic [ref=e458]:
                - generic [ref=e459]: "41"
                - button "Bookmark verse 41" [ref=e460]:
                  - generic [ref=e461]: star_outline
                - button "Share verse 12:41" [ref=e462]:
                  - generic [ref=e463]: share
              - generic [ref=e464]: يَٰصَٰحِبَيِ ٱلسِّجۡنِ أَمَّآ أَحَدُكُمَا فَيَسۡقِي رَبَّهُۥ خَمۡرٗاۖ وَأَمَّا ٱلۡأٓخَرُ فَيُصۡلَبُ فَتَأۡكُلُ ٱلطَّيۡرُ مِن رَّأۡسِهِۦۚ قُضِيَ ٱلۡأَمۡرُ ٱلَّذِي فِيهِ تَسۡتَفۡتِيَانِ
            - generic [ref=e466] [cursor=pointer]:
              - generic [ref=e467]:
                - generic [ref=e468]: "42"
                - button "Bookmark verse 42" [ref=e469]:
                  - generic [ref=e470]: star_outline
                - button "Share verse 12:42" [ref=e471]:
                  - generic [ref=e472]: share
              - generic [ref=e473]: وَقَالَ لِلَّذِي ظَنَّ أَنَّهُۥ نَاجٖ مِّنۡهُمَا ٱذۡكُرۡنِي عِندَ رَبِّكَ فَأَنسَىٰهُ ٱلشَّيۡطَٰنُ ذِكۡرَ رَبِّهِۦ فَلَبِثَ فِي ٱلسِّجۡنِ بِضۡعَ سِنِينَ
            - generic [ref=e475] [cursor=pointer]:
              - generic [ref=e476]:
                - generic [ref=e477]: "43"
                - button "Bookmark verse 43" [ref=e478]:
                  - generic [ref=e479]: star_outline
                - button "Share verse 12:43" [ref=e480]:
                  - generic [ref=e481]: share
              - generic [ref=e482]: وَقَالَ ٱلۡمَلِكُ إِنِّيٓ أَرَىٰ سَبۡعَ بَقَرَٰتٖ سِمَانٖ يَأۡكُلُهُنَّ سَبۡعٌ عِجَافٞ وَسَبۡعَ سُنۢبُلَٰتٍ خُضۡرٖ وَأُخَرَ يَابِسَٰتٖۖ يَـٰٓأَيُّهَا ٱلۡمَلَأُ أَفۡتُونِي فِي رُءۡيَٰيَ إِن كُنتُمۡ لِلرُّءۡيَا تَعۡبُرُونَ
            - generic [ref=e484] [cursor=pointer]:
              - generic [ref=e485]:
                - generic [ref=e486]: "44"
                - button "Bookmark verse 44" [ref=e487]:
                  - generic [ref=e488]: star_outline
                - button "Share verse 12:44" [ref=e489]:
                  - generic [ref=e490]: share
              - generic [ref=e491]: قَالُوٓاْ أَضۡغَٰثُ أَحۡلَٰمٖۖ وَمَا نَحۡنُ بِتَأۡوِيلِ ٱلۡأَحۡلَٰمِ بِعَٰلِمِينَ
            - generic [ref=e493] [cursor=pointer]:
              - generic [ref=e494]:
                - generic [ref=e495]: "45"
                - button "Bookmark verse 45" [ref=e496]:
                  - generic [ref=e497]: star_outline
                - button "Share verse 12:45" [ref=e498]:
                  - generic [ref=e499]: share
              - generic [ref=e500]: وَقَالَ ٱلَّذِي نَجَا مِنۡهُمَا وَٱدَّكَرَ بَعۡدَ أُمَّةٍ أَنَا۠ أُنَبِّئُكُم بِتَأۡوِيلِهِۦ فَأَرۡسِلُونِ
            - generic [ref=e502] [cursor=pointer]:
              - generic [ref=e503]:
                - generic [ref=e504]: "46"
                - button "Bookmark verse 46" [ref=e505]:
                  - generic [ref=e506]: star_outline
                - button "Share verse 12:46" [ref=e507]:
                  - generic [ref=e508]: share
              - generic [ref=e509]: يُوسُفُ أَيُّهَا ٱلصِّدِّيقُ أَفۡتِنَا فِي سَبۡعِ بَقَرَٰتٖ سِمَانٖ يَأۡكُلُهُنَّ سَبۡعٌ عِجَافٞ وَسَبۡعِ سُنۢبُلَٰتٍ خُضۡرٖ وَأُخَرَ يَابِسَٰتٖ لَّعَلِّيٓ أَرۡجِعُ إِلَى ٱلنَّاسِ لَعَلَّهُمۡ يَعۡلَمُونَ
            - generic [ref=e511] [cursor=pointer]:
              - generic [ref=e512]:
                - generic [ref=e513]: "47"
                - button "Bookmark verse 47" [ref=e514]:
                  - generic [ref=e515]: star_outline
                - button "Share verse 12:47" [ref=e516]:
                  - generic [ref=e517]: share
              - generic [ref=e518]: قَالَ تَزۡرَعُونَ سَبۡعَ سِنِينَ دَأَبٗا فَمَا حَصَدتُّمۡ فَذَرُوهُ فِي سُنۢبُلِهِۦٓ إِلَّا قَلِيلٗا مِّمَّا تَأۡكُلُونَ
            - generic [ref=e520] [cursor=pointer]:
              - generic [ref=e521]:
                - generic [ref=e522]: "48"
                - button "Bookmark verse 48" [ref=e523]:
                  - generic [ref=e524]: star_outline
                - button "Share verse 12:48" [ref=e525]:
                  - generic [ref=e526]: share
              - generic [ref=e527]: ثُمَّ يَأۡتِي مِنۢ بَعۡدِ ذَٰلِكَ سَبۡعٞ شِدَادٞ يَأۡكُلۡنَ مَا قَدَّمۡتُمۡ لَهُنَّ إِلَّا قَلِيلٗا مِّمَّا تُحۡصِنُونَ
            - generic [ref=e529] [cursor=pointer]:
              - generic [ref=e530]:
                - generic [ref=e531]: "49"
                - button "Bookmark verse 49" [ref=e532]:
                  - generic [ref=e533]: star_outline
                - button "Share verse 12:49" [ref=e534]:
                  - generic [ref=e535]: share
              - generic [ref=e536]: ثُمَّ يَأۡتِي مِنۢ بَعۡدِ ذَٰلِكَ عَامٞ فِيهِ يُغَاثُ ٱلنَّاسُ وَفِيهِ يَعۡصِرُونَ
            - generic [ref=e538] [cursor=pointer]:
              - generic [ref=e539]:
                - generic [ref=e540]: "50"
                - button "Bookmark verse 50" [ref=e541]:
                  - generic [ref=e542]: star_outline
                - button "Share verse 12:50" [ref=e543]:
                  - generic [ref=e544]: share
              - generic [ref=e545]: وَقَالَ ٱلۡمَلِكُ ٱئۡتُونِي بِهِۦۖ فَلَمَّا جَآءَهُ ٱلرَّسُولُ قَالَ ٱرۡجِعۡ إِلَىٰ رَبِّكَ فَسۡـَٔلۡهُ مَا بَالُ ٱلنِّسۡوَةِ ٱلَّـٰتِي قَطَّعۡنَ أَيۡدِيَهُنَّۚ إِنَّ رَبِّي بِكَيۡدِهِنَّ عَلِيمٞ
            - generic [ref=e547] [cursor=pointer]:
              - generic [ref=e548]:
                - generic [ref=e549]: "51"
                - button "Bookmark verse 51" [ref=e550]:
                  - generic [ref=e551]: star_outline
                - button "Share verse 12:51" [ref=e552]:
                  - generic [ref=e553]: share
              - generic [ref=e554]: قَالَ مَا خَطۡبُكُنَّ إِذۡ رَٰوَدتُّنَّ يُوسُفَ عَن نَّفۡسِهِۦۚ قُلۡنَ حَٰشَ لِلَّهِ مَا عَلِمۡنَا عَلَيۡهِ مِن سُوٓءٖۚ قَالَتِ ٱمۡرَأَتُ ٱلۡعَزِيزِ ٱلۡـَٰٔنَ حَصۡحَصَ ٱلۡحَقُّ أَنَا۠ رَٰوَدتُّهُۥ عَن نَّفۡسِهِۦ وَإِنَّهُۥ لَمِنَ ٱلصَّـٰدِقِينَ
            - generic [ref=e556] [cursor=pointer]:
              - generic [ref=e557]:
                - generic [ref=e558]: "52"
                - button "Bookmark verse 52" [ref=e559]:
                  - generic [ref=e560]: star_outline
                - button "Share verse 12:52" [ref=e561]:
                  - generic [ref=e562]: share
              - generic [ref=e563]: ذَٰلِكَ لِيَعۡلَمَ أَنِّي لَمۡ أَخُنۡهُ بِٱلۡغَيۡبِ وَأَنَّ ٱللَّهَ لَا يَهۡدِي كَيۡدَ ٱلۡخَآئِنِينَ
            - generic [ref=e565] [cursor=pointer]:
              - generic [ref=e566]:
                - generic [ref=e567]: "53"
                - button "Bookmark verse 53" [ref=e568]:
                  - generic [ref=e569]: star_outline
                - button "Share verse 12:53" [ref=e570]:
                  - generic [ref=e571]: share
              - generic [ref=e572]: ۞وَمَآ أُبَرِّئُ نَفۡسِيٓۚ إِنَّ ٱلنَّفۡسَ لَأَمَّارَةُۢ بِٱلسُّوٓءِ إِلَّا مَا رَحِمَ رَبِّيٓۚ إِنَّ رَبِّي غَفُورٞ رَّحِيمٞ
            - generic [ref=e574] [cursor=pointer]:
              - generic [ref=e575]:
                - generic [ref=e576]: "54"
                - button "Bookmark verse 54" [ref=e577]:
                  - generic [ref=e578]: star_outline
                - button "Share verse 12:54" [ref=e579]:
                  - generic [ref=e580]: share
              - generic [ref=e581]: وَقَالَ ٱلۡمَلِكُ ٱئۡتُونِي بِهِۦٓ أَسۡتَخۡلِصۡهُ لِنَفۡسِيۖ فَلَمَّا كَلَّمَهُۥ قَالَ إِنَّكَ ٱلۡيَوۡمَ لَدَيۡنَا مَكِينٌ أَمِينٞ
            - generic [ref=e583] [cursor=pointer]:
              - generic [ref=e584]:
                - generic [ref=e585]: "55"
                - button "Bookmark verse 55" [ref=e586]:
                  - generic [ref=e587]: star_outline
                - button "Share verse 12:55" [ref=e588]:
                  - generic [ref=e589]: share
              - generic [ref=e590]: قَالَ ٱجۡعَلۡنِي عَلَىٰ خَزَآئِنِ ٱلۡأَرۡضِۖ إِنِّي حَفِيظٌ عَلِيمٞ
            - generic [ref=e592] [cursor=pointer]:
              - generic [ref=e593]:
                - generic [ref=e594]: "56"
                - button "Bookmark verse 56" [ref=e595]:
                  - generic [ref=e596]: star_outline
                - button "Share verse 12:56" [ref=e597]:
                  - generic [ref=e598]: share
              - generic [ref=e599]: وَكَذَٰلِكَ مَكَّنَّا لِيُوسُفَ فِي ٱلۡأَرۡضِ يَتَبَوَّأُ مِنۡهَا حَيۡثُ يَشَآءُۚ نُصِيبُ بِرَحۡمَتِنَا مَن نَّشَآءُۖ وَلَا نُضِيعُ أَجۡرَ ٱلۡمُحۡسِنِينَ
            - generic [ref=e601] [cursor=pointer]:
              - generic [ref=e602]:
                - generic [ref=e603]: "57"
                - button "Bookmark verse 57" [ref=e604]:
                  - generic [ref=e605]: star_outline
                - button "Share verse 12:57" [ref=e606]:
                  - generic [ref=e607]: share
              - generic [ref=e608]: وَلَأَجۡرُ ٱلۡأٓخِرَةِ خَيۡرٞ لِّلَّذِينَ ءَامَنُواْ وَكَانُواْ يَتَّقُونَ
            - generic [ref=e610] [cursor=pointer]:
              - generic [ref=e611]:
                - generic [ref=e612]: "58"
                - button "Bookmark verse 58" [ref=e613]:
                  - generic [ref=e614]: star_outline
                - button "Share verse 12:58" [ref=e615]:
                  - generic [ref=e616]: share
              - generic [ref=e617]: وَجَآءَ إِخۡوَةُ يُوسُفَ فَدَخَلُواْ عَلَيۡهِ فَعَرَفَهُمۡ وَهُمۡ لَهُۥ مُنكِرُونَ
            - generic [ref=e619] [cursor=pointer]:
              - generic [ref=e620]:
                - generic [ref=e621]: "59"
                - button "Bookmark verse 59" [ref=e622]:
                  - generic [ref=e623]: star_outline
                - button "Share verse 12:59" [ref=e624]:
                  - generic [ref=e625]: share
              - generic [ref=e626]: وَلَمَّا جَهَّزَهُم بِجَهَازِهِمۡ قَالَ ٱئۡتُونِي بِأَخٖ لَّكُم مِّنۡ أَبِيكُمۡۚ أَلَا تَرَوۡنَ أَنِّيٓ أُوفِي ٱلۡكَيۡلَ وَأَنَا۠ خَيۡرُ ٱلۡمُنزِلِينَ
            - generic [ref=e628] [cursor=pointer]:
              - generic [ref=e629]:
                - generic [ref=e630]: "60"
                - button "Bookmark verse 60" [ref=e631]:
                  - generic [ref=e632]: star_outline
                - button "Share verse 12:60" [ref=e633]:
                  - generic [ref=e634]: share
              - generic [ref=e635]: فَإِن لَّمۡ تَأۡتُونِي بِهِۦ فَلَا كَيۡلَ لَكُمۡ عِندِي وَلَا تَقۡرَبُونِ
            - generic [ref=e637] [cursor=pointer]:
              - generic [ref=e638]:
                - generic [ref=e639]: "61"
                - button "Bookmark verse 61" [ref=e640]:
                  - generic [ref=e641]: star_outline
                - button "Share verse 12:61" [ref=e642]:
                  - generic [ref=e643]: share
              - generic [ref=e644]: قَالُواْ سَنُرَٰوِدُ عَنۡهُ أَبَاهُ وَإِنَّا لَفَٰعِلُونَ
            - generic [ref=e646] [cursor=pointer]:
              - generic [ref=e647]:
                - generic [ref=e648]: "62"
                - button "Bookmark verse 62" [ref=e649]:
                  - generic [ref=e650]: star_outline
                - button "Share verse 12:62" [ref=e651]:
                  - generic [ref=e652]: share
              - generic [ref=e653]: وَقَالَ لِفِتۡيَٰنِهِ ٱجۡعَلُواْ بِضَٰعَتَهُمۡ فِي رِحَالِهِمۡ لَعَلَّهُمۡ يَعۡرِفُونَهَآ إِذَا ٱنقَلَبُوٓاْ إِلَىٰٓ أَهۡلِهِمۡ لَعَلَّهُمۡ يَرۡجِعُونَ
            - generic [ref=e655] [cursor=pointer]:
              - generic [ref=e656]:
                - generic [ref=e657]: "63"
                - button "Bookmark verse 63" [ref=e658]:
                  - generic [ref=e659]: star_outline
                - button "Share verse 12:63" [ref=e660]:
                  - generic [ref=e661]: share
              - generic [ref=e662]: فَلَمَّا رَجَعُوٓاْ إِلَىٰٓ أَبِيهِمۡ قَالُواْ يَـٰٓأَبَانَا مُنِعَ مِنَّا ٱلۡكَيۡلُ فَأَرۡسِلۡ مَعَنَآ أَخَانَا نَكۡتَلۡ وَإِنَّا لَهُۥ لَحَٰفِظُونَ
            - generic [ref=e664] [cursor=pointer]:
              - generic [ref=e665]:
                - generic [ref=e666]: "64"
                - button "Bookmark verse 64" [ref=e667]:
                  - generic [ref=e668]: star_outline
                - button "Share verse 12:64" [ref=e669]:
                  - generic [ref=e670]: share
              - generic [ref=e671]: قَالَ هَلۡ ءَامَنُكُمۡ عَلَيۡهِ إِلَّا كَمَآ أَمِنتُكُمۡ عَلَىٰٓ أَخِيهِ مِن قَبۡلُ فَٱللَّهُ خَيۡرٌ حَٰفِظٗاۖ وَهُوَ أَرۡحَمُ ٱلرَّـٰحِمِينَ
            - generic [ref=e673] [cursor=pointer]:
              - generic [ref=e674]:
                - generic [ref=e675]: "65"
                - button "Bookmark verse 65" [ref=e676]:
                  - generic [ref=e677]: star_outline
                - button "Share verse 12:65" [ref=e678]:
                  - generic [ref=e679]: share
              - generic [ref=e680]: وَلَمَّا فَتَحُواْ مَتَٰعَهُمۡ وَجَدُواْ بِضَٰعَتَهُمۡ رُدَّتۡ إِلَيۡهِمۡۖ قَالُواْ يَـٰٓأَبَانَا مَا نَبۡغِيۖ هَٰذِهِۦ بِضَٰعَتُنَا رُدَّتۡ إِلَيۡنَاۖ وَنَمِيرُ أَهۡلَنَا وَنَحۡفَظُ أَخَانَا وَنَزۡدَادُ كَيۡلَ بَعِيرٖۖ ذَٰلِكَ كَيۡلٞ يَسِيرٞ
            - generic [ref=e682] [cursor=pointer]:
              - generic [ref=e683]:
                - generic [ref=e684]: "66"
                - button "Bookmark verse 66" [ref=e685]:
                  - generic [ref=e686]: star_outline
                - button "Share verse 12:66" [ref=e687]:
                  - generic [ref=e688]: share
              - generic [ref=e689]: قَالَ لَنۡ أُرۡسِلَهُۥ مَعَكُمۡ حَتَّىٰ تُؤۡتُونِ مَوۡثِقٗا مِّنَ ٱللَّهِ لَتَأۡتُنَّنِي بِهِۦٓ إِلَّآ أَن يُحَاطَ بِكُمۡۖ فَلَمَّآ ءَاتَوۡهُ مَوۡثِقَهُمۡ قَالَ ٱللَّهُ عَلَىٰ مَا نَقُولُ وَكِيلٞ
            - generic [ref=e691] [cursor=pointer]:
              - generic [ref=e692]:
                - generic [ref=e693]: "67"
                - button "Bookmark verse 67" [ref=e694]:
                  - generic [ref=e695]: star_outline
                - button "Share verse 12:67" [ref=e696]:
                  - generic [ref=e697]: share
              - generic [ref=e698]: وَقَالَ يَٰبَنِيَّ لَا تَدۡخُلُواْ مِنۢ بَابٖ وَٰحِدٖ وَٱدۡخُلُواْ مِنۡ أَبۡوَٰبٖ مُّتَفَرِّقَةٖۖ وَمَآ أُغۡنِي عَنكُم مِّنَ ٱللَّهِ مِن شَيۡءٍۖ إِنِ ٱلۡحُكۡمُ إِلَّا لِلَّهِۖ عَلَيۡهِ تَوَكَّلۡتُۖ وَعَلَيۡهِ فَلۡيَتَوَكَّلِ ٱلۡمُتَوَكِّلُونَ
            - generic [ref=e700] [cursor=pointer]:
              - generic [ref=e701]:
                - generic [ref=e702]: "68"
                - button "Bookmark verse 68" [ref=e703]:
                  - generic [ref=e704]: star_outline
                - button "Share verse 12:68" [ref=e705]:
                  - generic [ref=e706]: share
              - generic [ref=e707]: وَلَمَّا دَخَلُواْ مِنۡ حَيۡثُ أَمَرَهُمۡ أَبُوهُم مَّا كَانَ يُغۡنِي عَنۡهُم مِّنَ ٱللَّهِ مِن شَيۡءٍ إِلَّا حَاجَةٗ فِي نَفۡسِ يَعۡقُوبَ قَضَىٰهَاۚ وَإِنَّهُۥ لَذُو عِلۡمٖ لِّمَا عَلَّمۡنَٰهُ وَلَٰكِنَّ أَكۡثَرَ ٱلنَّاسِ لَا يَعۡلَمُونَ
            - generic [ref=e709] [cursor=pointer]:
              - generic [ref=e710]:
                - generic [ref=e711]: "69"
                - button "Bookmark verse 69" [ref=e712]:
                  - generic [ref=e713]: star_outline
                - button "Share verse 12:69" [ref=e714]:
                  - generic [ref=e715]: share
              - generic [ref=e716]: وَلَمَّا دَخَلُواْ عَلَىٰ يُوسُفَ ءَاوَىٰٓ إِلَيۡهِ أَخَاهُۖ قَالَ إِنِّيٓ أَنَا۠ أَخُوكَ فَلَا تَبۡتَئِسۡ بِمَا كَانُواْ يَعۡمَلُونَ
            - generic [ref=e718] [cursor=pointer]:
              - generic [ref=e719]:
                - generic [ref=e720]: "70"
                - button "Bookmark verse 70" [ref=e721]:
                  - generic [ref=e722]: star_outline
                - button "Share verse 12:70" [ref=e723]:
                  - generic [ref=e724]: share
              - generic [ref=e725]: فَلَمَّا جَهَّزَهُم بِجَهَازِهِمۡ جَعَلَ ٱلسِّقَايَةَ فِي رَحۡلِ أَخِيهِ ثُمَّ أَذَّنَ مُؤَذِّنٌ أَيَّتُهَا ٱلۡعِيرُ إِنَّكُمۡ لَسَٰرِقُونَ
            - generic [ref=e727] [cursor=pointer]:
              - generic [ref=e728]:
                - generic [ref=e729]: "71"
                - button "Bookmark verse 71" [ref=e730]:
                  - generic [ref=e731]: star_outline
                - button "Share verse 12:71" [ref=e732]:
                  - generic [ref=e733]: share
              - generic [ref=e734]: قَالُواْ وَأَقۡبَلُواْ عَلَيۡهِم مَّاذَا تَفۡقِدُونَ
            - generic [ref=e736] [cursor=pointer]:
              - generic [ref=e737]:
                - generic [ref=e738]: "72"
                - button "Bookmark verse 72" [ref=e739]:
                  - generic [ref=e740]: star_outline
                - button "Share verse 12:72" [ref=e741]:
                  - generic [ref=e742]: share
              - generic [ref=e743]: قَالُواْ نَفۡقِدُ صُوَاعَ ٱلۡمَلِكِ وَلِمَن جَآءَ بِهِۦ حِمۡلُ بَعِيرٖ وَأَنَا۠ بِهِۦ زَعِيمٞ
            - generic [ref=e745] [cursor=pointer]:
              - generic [ref=e746]:
                - generic [ref=e747]: "73"
                - button "Bookmark verse 73" [ref=e748]:
                  - generic [ref=e749]: star_outline
                - button "Share verse 12:73" [ref=e750]:
                  - generic [ref=e751]: share
              - generic [ref=e752]: قَالُواْ تَٱللَّهِ لَقَدۡ عَلِمۡتُم مَّا جِئۡنَا لِنُفۡسِدَ فِي ٱلۡأَرۡضِ وَمَا كُنَّا سَٰرِقِينَ
            - generic [ref=e754] [cursor=pointer]:
              - generic [ref=e755]:
                - generic [ref=e756]: "74"
                - button "Bookmark verse 74" [ref=e757]:
                  - generic [ref=e758]: star_outline
                - button "Share verse 12:74" [ref=e759]:
                  - generic [ref=e760]: share
              - generic [ref=e761]: قَالُواْ فَمَا جَزَـٰٓؤُهُۥٓ إِن كُنتُمۡ كَٰذِبِينَ
            - generic [ref=e763] [cursor=pointer]:
              - generic [ref=e764]:
                - generic [ref=e765]: "75"
                - button "Bookmark verse 75" [ref=e766]:
                  - generic [ref=e767]: star_outline
                - button "Share verse 12:75" [ref=e768]:
                  - generic [ref=e769]: share
              - generic [ref=e770]: قَالُواْ جَزَـٰٓؤُهُۥ مَن وُجِدَ فِي رَحۡلِهِۦ فَهُوَ جَزَـٰٓؤُهُۥۚ كَذَٰلِكَ نَجۡزِي ٱلظَّـٰلِمِينَ
            - generic [ref=e772] [cursor=pointer]:
              - generic [ref=e773]:
                - generic [ref=e774]: "76"
                - button "Bookmark verse 76" [ref=e775]:
                  - generic [ref=e776]: star_outline
                - button "Share verse 12:76" [ref=e777]:
                  - generic [ref=e778]: share
              - generic [ref=e779]: فَبَدَأَ بِأَوۡعِيَتِهِمۡ قَبۡلَ وِعَآءِ أَخِيهِ ثُمَّ ٱسۡتَخۡرَجَهَا مِن وِعَآءِ أَخِيهِۚ كَذَٰلِكَ كِدۡنَا لِيُوسُفَۖ مَا كَانَ لِيَأۡخُذَ أَخَاهُ فِي دِينِ ٱلۡمَلِكِ إِلَّآ أَن يَشَآءَ ٱللَّهُۚ نَرۡفَعُ دَرَجَٰتٖ مَّن نَّشَآءُۗ وَفَوۡقَ كُلِّ ذِي عِلۡمٍ عَلِيمٞ
            - generic [ref=e781] [cursor=pointer]:
              - generic [ref=e782]:
                - generic [ref=e783]: "77"
                - button "Bookmark verse 77" [ref=e784]:
                  - generic [ref=e785]: star_outline
                - button "Share verse 12:77" [ref=e786]:
                  - generic [ref=e787]: share
              - generic [ref=e788]: ۞قَالُوٓاْ إِن يَسۡرِقۡ فَقَدۡ سَرَقَ أَخٞ لَّهُۥ مِن قَبۡلُۚ فَأَسَرَّهَا يُوسُفُ فِي نَفۡسِهِۦ وَلَمۡ يُبۡدِهَا لَهُمۡۚ قَالَ أَنتُمۡ شَرّٞ مَّكَانٗاۖ وَٱللَّهُ أَعۡلَمُ بِمَا تَصِفُونَ
            - generic [ref=e790] [cursor=pointer]:
              - generic [ref=e791]:
                - generic [ref=e792]: "78"
                - button "Bookmark verse 78" [ref=e793]:
                  - generic [ref=e794]: star_outline
                - button "Share verse 12:78" [ref=e795]:
                  - generic [ref=e796]: share
              - generic [ref=e797]: قَالُواْ يَـٰٓأَيُّهَا ٱلۡعَزِيزُ إِنَّ لَهُۥٓ أَبٗا شَيۡخٗا كَبِيرٗا فَخُذۡ أَحَدَنَا مَكَانَهُۥٓۖ إِنَّا نَرَىٰكَ مِنَ ٱلۡمُحۡسِنِينَ
            - generic [ref=e799] [cursor=pointer]:
              - generic [ref=e800]:
                - generic [ref=e801]: "79"
                - button "Bookmark verse 79" [ref=e802]:
                  - generic [ref=e803]: star_outline
                - button "Share verse 12:79" [ref=e804]:
                  - generic [ref=e805]: share
              - generic [ref=e806]: قَالَ مَعَاذَ ٱللَّهِ أَن نَّأۡخُذَ إِلَّا مَن وَجَدۡنَا مَتَٰعَنَا عِندَهُۥٓ إِنَّآ إِذٗا لَّظَٰلِمُونَ
            - generic [ref=e808] [cursor=pointer]:
              - generic [ref=e809]:
                - generic [ref=e810]: "80"
                - button "Bookmark verse 80" [ref=e811]:
                  - generic [ref=e812]: star_outline
                - button "Share verse 12:80" [ref=e813]:
                  - generic [ref=e814]: share
              - generic [ref=e815]: فَلَمَّا ٱسۡتَيۡـَٔسُواْ مِنۡهُ خَلَصُواْ نَجِيّٗاۖ قَالَ كَبِيرُهُمۡ أَلَمۡ تَعۡلَمُوٓاْ أَنَّ أَبَاكُمۡ قَدۡ أَخَذَ عَلَيۡكُم مَّوۡثِقٗا مِّنَ ٱللَّهِ وَمِن قَبۡلُ مَا فَرَّطتُمۡ فِي يُوسُفَۖ فَلَنۡ أَبۡرَحَ ٱلۡأَرۡضَ حَتَّىٰ يَأۡذَنَ لِيٓ أَبِيٓ أَوۡ يَحۡكُمَ ٱللَّهُ لِيۖ وَهُوَ خَيۡرُ ٱلۡحَٰكِمِينَ
            - generic [ref=e817] [cursor=pointer]:
              - generic [ref=e818]:
                - generic [ref=e819]: "81"
                - button "Bookmark verse 81" [ref=e820]:
                  - generic [ref=e821]: star_outline
                - button "Share verse 12:81" [ref=e822]:
                  - generic [ref=e823]: share
              - generic [ref=e824]: ٱرۡجِعُوٓاْ إِلَىٰٓ أَبِيكُمۡ فَقُولُواْ يَـٰٓأَبَانَآ إِنَّ ٱبۡنَكَ سَرَقَ وَمَا شَهِدۡنَآ إِلَّا بِمَا عَلِمۡنَا وَمَا كُنَّا لِلۡغَيۡبِ حَٰفِظِينَ
            - generic [ref=e826] [cursor=pointer]:
              - generic [ref=e827]:
                - generic [ref=e828]: "82"
                - button "Bookmark verse 82" [ref=e829]:
                  - generic [ref=e830]: star_outline
                - button "Share verse 12:82" [ref=e831]:
                  - generic [ref=e832]: share
              - generic [ref=e833]: وَسۡـَٔلِ ٱلۡقَرۡيَةَ ٱلَّتِي كُنَّا فِيهَا وَٱلۡعِيرَ ٱلَّتِيٓ أَقۡبَلۡنَا فِيهَاۖ وَإِنَّا لَصَٰدِقُونَ
            - generic [ref=e835] [cursor=pointer]:
              - generic [ref=e836]:
                - generic [ref=e837]: "83"
                - button "Bookmark verse 83" [ref=e838]:
                  - generic [ref=e839]: star_outline
                - button "Share verse 12:83" [ref=e840]:
                  - generic [ref=e841]: share
              - generic [ref=e842]: قَالَ بَلۡ سَوَّلَتۡ لَكُمۡ أَنفُسُكُمۡ أَمۡرٗاۖ فَصَبۡرٞ جَمِيلٌۖ عَسَى ٱللَّهُ أَن يَأۡتِيَنِي بِهِمۡ جَمِيعًاۚ إِنَّهُۥ هُوَ ٱلۡعَلِيمُ ٱلۡحَكِيمُ
            - generic [ref=e844] [cursor=pointer]:
              - generic [ref=e845]:
                - generic [ref=e846]: "84"
                - button "Bookmark verse 84" [ref=e847]:
                  - generic [ref=e848]: star_outline
                - button "Share verse 12:84" [ref=e849]:
                  - generic [ref=e850]: share
              - generic [ref=e851]: وَتَوَلَّىٰ عَنۡهُمۡ وَقَالَ يَـٰٓأَسَفَىٰ عَلَىٰ يُوسُفَ وَٱبۡيَضَّتۡ عَيۡنَاهُ مِنَ ٱلۡحُزۡنِ فَهُوَ كَظِيمٞ
            - generic [ref=e853] [cursor=pointer]:
              - generic [ref=e854]:
                - generic [ref=e855]: "85"
                - button "Bookmark verse 85" [ref=e856]:
                  - generic [ref=e857]: star_outline
                - button "Share verse 12:85" [ref=e858]:
                  - generic [ref=e859]: share
              - generic [ref=e860]: قَالُواْ تَٱللَّهِ تَفۡتَؤُاْ تَذۡكُرُ يُوسُفَ حَتَّىٰ تَكُونَ حَرَضًا أَوۡ تَكُونَ مِنَ ٱلۡهَٰلِكِينَ
            - generic [ref=e862] [cursor=pointer]:
              - generic [ref=e863]:
                - generic [ref=e864]: "86"
                - button "Bookmark verse 86" [ref=e865]:
                  - generic [ref=e866]: star_outline
                - button "Share verse 12:86" [ref=e867]:
                  - generic [ref=e868]: share
              - generic [ref=e869]: قَالَ إِنَّمَآ أَشۡكُواْ بَثِّي وَحُزۡنِيٓ إِلَى ٱللَّهِ وَأَعۡلَمُ مِنَ ٱللَّهِ مَا لَا تَعۡلَمُونَ
            - generic [ref=e871] [cursor=pointer]:
              - generic [ref=e872]:
                - generic [ref=e873]: "87"
                - button "Bookmark verse 87" [ref=e874]:
                  - generic [ref=e875]: star_outline
                - button "Share verse 12:87" [ref=e876]:
                  - generic [ref=e877]: share
              - generic [ref=e878]: يَٰبَنِيَّ ٱذۡهَبُواْ فَتَحَسَّسُواْ مِن يُوسُفَ وَأَخِيهِ وَلَا تَاْيۡـَٔسُواْ مِن رَّوۡحِ ٱللَّهِۖ إِنَّهُۥ لَا يَاْيۡـَٔسُ مِن رَّوۡحِ ٱللَّهِ إِلَّا ٱلۡقَوۡمُ ٱلۡكَٰفِرُونَ
            - generic [ref=e880] [cursor=pointer]:
              - generic [ref=e881]:
                - generic [ref=e882]: "88"
                - button "Bookmark verse 88" [ref=e883]:
                  - generic [ref=e884]: star_outline
                - button "Share verse 12:88" [ref=e885]:
                  - generic [ref=e886]: share
              - generic [ref=e887]: فَلَمَّا دَخَلُواْ عَلَيۡهِ قَالُواْ يَـٰٓأَيُّهَا ٱلۡعَزِيزُ مَسَّنَا وَأَهۡلَنَا ٱلضُّرُّ وَجِئۡنَا بِبِضَٰعَةٖ مُّزۡجَىٰةٖ فَأَوۡفِ لَنَا ٱلۡكَيۡلَ وَتَصَدَّقۡ عَلَيۡنَآۖ إِنَّ ٱللَّهَ يَجۡزِي ٱلۡمُتَصَدِّقِينَ
            - generic [ref=e889] [cursor=pointer]:
              - generic [ref=e890]:
                - generic [ref=e891]: "89"
                - button "Bookmark verse 89" [ref=e892]:
                  - generic [ref=e893]: star_outline
                - button "Share verse 12:89" [ref=e894]:
                  - generic [ref=e895]: share
              - generic [ref=e896]: قَالَ هَلۡ عَلِمۡتُم مَّا فَعَلۡتُم بِيُوسُفَ وَأَخِيهِ إِذۡ أَنتُمۡ جَٰهِلُونَ
            - generic [ref=e898] [cursor=pointer]:
              - generic [ref=e899]:
                - generic [ref=e900]: "90"
                - button "Bookmark verse 90" [ref=e901]:
                  - generic [ref=e902]: star_outline
                - button "Share verse 12:90" [ref=e903]:
                  - generic [ref=e904]: share
              - generic [ref=e905]: قَالُوٓاْ أَءِنَّكَ لَأَنتَ يُوسُفُۖ قَالَ أَنَا۠ يُوسُفُ وَهَٰذَآ أَخِيۖ قَدۡ مَنَّ ٱللَّهُ عَلَيۡنَآۖ إِنَّهُۥ مَن يَتَّقِ وَيَصۡبِرۡ فَإِنَّ ٱللَّهَ لَا يُضِيعُ أَجۡرَ ٱلۡمُحۡسِنِينَ
            - generic [ref=e907] [cursor=pointer]:
              - generic [ref=e908]:
                - generic [ref=e909]: "91"
                - button "Bookmark verse 91" [ref=e910]:
                  - generic [ref=e911]: star_outline
                - button "Share verse 12:91" [ref=e912]:
                  - generic [ref=e913]: share
              - generic [ref=e914]: قَالُواْ تَٱللَّهِ لَقَدۡ ءَاثَرَكَ ٱللَّهُ عَلَيۡنَا وَإِن كُنَّا لَخَٰطِـِٔينَ
            - generic [ref=e916] [cursor=pointer]:
              - generic [ref=e917]:
                - generic [ref=e918]: "92"
                - button "Bookmark verse 92" [ref=e919]:
                  - generic [ref=e920]: star_outline
                - button "Share verse 12:92" [ref=e921]:
                  - generic [ref=e922]: share
              - generic [ref=e923]: قَالَ لَا تَثۡرِيبَ عَلَيۡكُمُ ٱلۡيَوۡمَۖ يَغۡفِرُ ٱللَّهُ لَكُمۡۖ وَهُوَ أَرۡحَمُ ٱلرَّـٰحِمِينَ
            - generic [ref=e925] [cursor=pointer]:
              - generic [ref=e926]:
                - generic [ref=e927]: "93"
                - button "Bookmark verse 93" [ref=e928]:
                  - generic [ref=e929]: star_outline
                - button "Share verse 12:93" [ref=e930]:
                  - generic [ref=e931]: share
              - generic [ref=e932]: ٱذۡهَبُواْ بِقَمِيصِي هَٰذَا فَأَلۡقُوهُ عَلَىٰ وَجۡهِ أَبِي يَأۡتِ بَصِيرٗا وَأۡتُونِي بِأَهۡلِكُمۡ أَجۡمَعِينَ
            - generic [ref=e934] [cursor=pointer]:
              - generic [ref=e935]:
                - generic [ref=e936]: "94"
                - button "Bookmark verse 94" [ref=e937]:
                  - generic [ref=e938]: star_outline
                - button "Share verse 12:94" [ref=e939]:
                  - generic [ref=e940]: share
              - generic [ref=e941]: وَلَمَّا فَصَلَتِ ٱلۡعِيرُ قَالَ أَبُوهُمۡ إِنِّي لَأَجِدُ رِيحَ يُوسُفَۖ لَوۡلَآ أَن تُفَنِّدُونِ
            - generic [ref=e943] [cursor=pointer]:
              - generic [ref=e944]:
                - generic [ref=e945]: "95"
                - button "Bookmark verse 95" [ref=e946]:
                  - generic [ref=e947]: star_outline
                - button "Share verse 12:95" [ref=e948]:
                  - generic [ref=e949]: share
              - generic [ref=e950]: قَالُواْ تَٱللَّهِ إِنَّكَ لَفِي ضَلَٰلِكَ ٱلۡقَدِيمِ
            - generic [ref=e952] [cursor=pointer]:
              - generic [ref=e953]:
                - generic [ref=e954]: "96"
                - button "Bookmark verse 96" [ref=e955]:
                  - generic [ref=e956]: star_outline
                - button "Share verse 12:96" [ref=e957]:
                  - generic [ref=e958]: share
              - generic [ref=e959]: فَلَمَّآ أَن جَآءَ ٱلۡبَشِيرُ أَلۡقَىٰهُ عَلَىٰ وَجۡهِهِۦ فَٱرۡتَدَّ بَصِيرٗاۖ قَالَ أَلَمۡ أَقُل لَّكُمۡ إِنِّيٓ أَعۡلَمُ مِنَ ٱللَّهِ مَا لَا تَعۡلَمُونَ
            - generic [ref=e961] [cursor=pointer]:
              - generic [ref=e962]:
                - generic [ref=e963]: "97"
                - button "Bookmark verse 97" [ref=e964]:
                  - generic [ref=e965]: star_outline
                - button "Share verse 12:97" [ref=e966]:
                  - generic [ref=e967]: share
              - generic [ref=e968]: قَالُواْ يَـٰٓأَبَانَا ٱسۡتَغۡفِرۡ لَنَا ذُنُوبَنَآ إِنَّا كُنَّا خَٰطِـِٔينَ
            - generic [ref=e970] [cursor=pointer]:
              - generic [ref=e971]:
                - generic [ref=e972]: "98"
                - button "Bookmark verse 98" [ref=e973]:
                  - generic [ref=e974]: star_outline
                - button "Share verse 12:98" [ref=e975]:
                  - generic [ref=e976]: share
              - generic [ref=e977]: قَالَ سَوۡفَ أَسۡتَغۡفِرُ لَكُمۡ رَبِّيٓۖ إِنَّهُۥ هُوَ ٱلۡغَفُورُ ٱلرَّحِيمُ
            - generic [ref=e979] [cursor=pointer]:
              - generic [ref=e980]:
                - generic [ref=e981]: "99"
                - button "Bookmark verse 99" [ref=e982]:
                  - generic [ref=e983]: star_outline
                - button "Share verse 12:99" [ref=e984]:
                  - generic [ref=e985]: share
              - generic [ref=e986]: فَلَمَّا دَخَلُواْ عَلَىٰ يُوسُفَ ءَاوَىٰٓ إِلَيۡهِ أَبَوَيۡهِ وَقَالَ ٱدۡخُلُواْ مِصۡرَ إِن شَآءَ ٱللَّهُ ءَامِنِينَ
            - generic [ref=e988] [cursor=pointer]:
              - generic [ref=e989]:
                - generic [ref=e990]: "100"
                - button "Bookmark verse 100" [ref=e991]:
                  - generic [ref=e992]: star_outline
                - button "Share verse 12:100" [ref=e993]:
                  - generic [ref=e994]: share
              - generic [ref=e995]: وَرَفَعَ أَبَوَيۡهِ عَلَى ٱلۡعَرۡشِ وَخَرُّواْ لَهُۥ سُجَّدٗاۖ وَقَالَ يَـٰٓأَبَتِ هَٰذَا تَأۡوِيلُ رُءۡيَٰيَ مِن قَبۡلُ قَدۡ جَعَلَهَا رَبِّي حَقّٗاۖ وَقَدۡ أَحۡسَنَ بِيٓ إِذۡ أَخۡرَجَنِي مِنَ ٱلسِّجۡنِ وَجَآءَ بِكُم مِّنَ ٱلۡبَدۡوِ مِنۢ بَعۡدِ أَن نَّزَغَ ٱلشَّيۡطَٰنُ بَيۡنِي وَبَيۡنَ إِخۡوَتِيٓۚ إِنَّ رَبِّي لَطِيفٞ لِّمَا يَشَآءُۚ إِنَّهُۥ هُوَ ٱلۡعَلِيمُ ٱلۡحَكِيمُ
            - generic [ref=e997] [cursor=pointer]:
              - generic [ref=e998]:
                - generic [ref=e999]: "101"
                - button "Bookmark verse 101" [ref=e1000]:
                  - generic [ref=e1001]: star_outline
                - button "Share verse 12:101" [ref=e1002]:
                  - generic [ref=e1003]: share
              - generic [ref=e1004]: ۞رَبِّ قَدۡ ءَاتَيۡتَنِي مِنَ ٱلۡمُلۡكِ وَعَلَّمۡتَنِي مِن تَأۡوِيلِ ٱلۡأَحَادِيثِۚ فَاطِرَ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضِ أَنتَ وَلِيِّۦ فِي ٱلدُّنۡيَا وَٱلۡأٓخِرَةِۖ تَوَفَّنِي مُسۡلِمٗا وَأَلۡحِقۡنِي بِٱلصَّـٰلِحِينَ
            - generic [ref=e1006] [cursor=pointer]:
              - generic [ref=e1007]:
                - generic [ref=e1008]: "102"
                - button "Bookmark verse 102" [ref=e1009]:
                  - generic [ref=e1010]: star_outline
                - button "Share verse 12:102" [ref=e1011]:
                  - generic [ref=e1012]: share
              - generic [ref=e1013]: ذَٰلِكَ مِنۡ أَنۢبَآءِ ٱلۡغَيۡبِ نُوحِيهِ إِلَيۡكَۖ وَمَا كُنتَ لَدَيۡهِمۡ إِذۡ أَجۡمَعُوٓاْ أَمۡرَهُمۡ وَهُمۡ يَمۡكُرُونَ
            - generic [ref=e1015] [cursor=pointer]:
              - generic [ref=e1016]:
                - generic [ref=e1017]: "103"
                - button "Bookmark verse 103" [ref=e1018]:
                  - generic [ref=e1019]: star_outline
                - button "Share verse 12:103" [ref=e1020]:
                  - generic [ref=e1021]: share
              - generic [ref=e1022]: وَمَآ أَكۡثَرُ ٱلنَّاسِ وَلَوۡ حَرَصۡتَ بِمُؤۡمِنِينَ
            - generic [ref=e1024] [cursor=pointer]:
              - generic [ref=e1025]:
                - generic [ref=e1026]: "104"
                - button "Bookmark verse 104" [ref=e1027]:
                  - generic [ref=e1028]: star_outline
                - button "Share verse 12:104" [ref=e1029]:
                  - generic [ref=e1030]: share
              - generic [ref=e1031]: وَمَا تَسۡـَٔلُهُمۡ عَلَيۡهِ مِنۡ أَجۡرٍۚ إِنۡ هُوَ إِلَّا ذِكۡرٞ لِّلۡعَٰلَمِينَ
            - generic [ref=e1033] [cursor=pointer]:
              - generic [ref=e1034]:
                - generic [ref=e1035]: "105"
                - button "Bookmark verse 105" [ref=e1036]:
                  - generic [ref=e1037]: star_outline
                - button "Share verse 12:105" [ref=e1038]:
                  - generic [ref=e1039]: share
              - generic [ref=e1040]: وَكَأَيِّن مِّنۡ ءَايَةٖ فِي ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضِ يَمُرُّونَ عَلَيۡهَا وَهُمۡ عَنۡهَا مُعۡرِضُونَ
            - generic [ref=e1042] [cursor=pointer]:
              - generic [ref=e1043]:
                - generic [ref=e1044]: "106"
                - button "Bookmark verse 106" [ref=e1045]:
                  - generic [ref=e1046]: star_outline
                - button "Share verse 12:106" [ref=e1047]:
                  - generic [ref=e1048]: share
              - generic [ref=e1049]: وَمَا يُؤۡمِنُ أَكۡثَرُهُم بِٱللَّهِ إِلَّا وَهُم مُّشۡرِكُونَ
            - generic [ref=e1051] [cursor=pointer]:
              - generic [ref=e1052]:
                - generic [ref=e1053]: "107"
                - button "Bookmark verse 107" [ref=e1054]:
                  - generic [ref=e1055]: star_outline
                - button "Share verse 12:107" [ref=e1056]:
                  - generic [ref=e1057]: share
              - generic [ref=e1058]: أَفَأَمِنُوٓاْ أَن تَأۡتِيَهُمۡ غَٰشِيَةٞ مِّنۡ عَذَابِ ٱللَّهِ أَوۡ تَأۡتِيَهُمُ ٱلسَّاعَةُ بَغۡتَةٗ وَهُمۡ لَا يَشۡعُرُونَ
            - generic [ref=e1060] [cursor=pointer]:
              - generic [ref=e1061]:
                - generic [ref=e1062]: "108"
                - button "Bookmark verse 108" [ref=e1063]:
                  - generic [ref=e1064]: star_outline
                - button "Share verse 12:108" [ref=e1065]:
                  - generic [ref=e1066]: share
              - generic [ref=e1067]: قُلۡ هَٰذِهِۦ سَبِيلِيٓ أَدۡعُوٓاْ إِلَى ٱللَّهِۚ عَلَىٰ بَصِيرَةٍ أَنَا۠ وَمَنِ ٱتَّبَعَنِيۖ وَسُبۡحَٰنَ ٱللَّهِ وَمَآ أَنَا۠ مِنَ ٱلۡمُشۡرِكِينَ
            - generic [ref=e1069] [cursor=pointer]:
              - generic [ref=e1070]:
                - generic [ref=e1071]: "109"
                - button "Bookmark verse 109" [ref=e1072]:
                  - generic [ref=e1073]: star_outline
                - button "Share verse 12:109" [ref=e1074]:
                  - generic [ref=e1075]: share
              - generic [ref=e1076]: وَمَآ أَرۡسَلۡنَا مِن قَبۡلِكَ إِلَّا رِجَالٗا نُّوحِيٓ إِلَيۡهِم مِّنۡ أَهۡلِ ٱلۡقُرَىٰٓۗ أَفَلَمۡ يَسِيرُواْ فِي ٱلۡأَرۡضِ فَيَنظُرُواْ كَيۡفَ كَانَ عَٰقِبَةُ ٱلَّذِينَ مِن قَبۡلِهِمۡۗ وَلَدَارُ ٱلۡأٓخِرَةِ خَيۡرٞ لِّلَّذِينَ ٱتَّقَوۡاْۚ أَفَلَا تَعۡقِلُونَ
            - generic [ref=e1078] [cursor=pointer]:
              - generic [ref=e1079]:
                - generic [ref=e1080]: "110"
                - button "Bookmark verse 110" [ref=e1081]:
                  - generic [ref=e1082]: star_outline
                - button "Share verse 12:110" [ref=e1083]:
                  - generic [ref=e1084]: share
              - generic [ref=e1085]: حَتَّىٰٓ إِذَا ٱسۡتَيۡـَٔسَ ٱلرُّسُلُ وَظَنُّوٓاْ أَنَّهُمۡ قَدۡ كُذِبُواْ جَآءَهُمۡ نَصۡرُنَا فَنُجِّيَ مَن نَّشَآءُۖ وَلَا يُرَدُّ بَأۡسُنَا عَنِ ٱلۡقَوۡمِ ٱلۡمُجۡرِمِينَ
            - generic [ref=e1087] [cursor=pointer]:
              - generic [ref=e1088]:
                - generic [ref=e1089]: "111"
                - button "Bookmark verse 111" [ref=e1090]:
                  - generic [ref=e1091]: star_outline
                - button "Share verse 12:111" [ref=e1092]:
                  - generic [ref=e1093]: share
              - generic [ref=e1094]: لَقَدۡ كَانَ فِي قَصَصِهِمۡ عِبۡرَةٞ لِّأُوْلِي ٱلۡأَلۡبَٰبِۗ مَا كَانَ حَدِيثٗا يُفۡتَرَىٰ وَلَٰكِن تَصۡدِيقَ ٱلَّذِي بَيۡنَ يَدَيۡهِ وَتَفۡصِيلَ كُلِّ شَيۡءٖ وَهُدٗى وَرَحۡمَةٗ لِّقَوۡمٖ يُؤۡمِنُونَ
  - generic: God bless my mom
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | type DarkRouteCheck = {
  4   |     path: string
  5   |     readySelector: string
  6   | }
  7   | 
  8   | type SurfaceIssue = {
  9   |     selector: string
  10  |     backgroundColor: string
  11  |     width: number
  12  |     height: number
  13  | }
  14  | 
  15  | const darkRoutes: DarkRouteCheck[] = [
  16  |     { path: '/', readySelector: '.manifesto-card' },
  17  |     { path: '/quran', readySelector: 'a.sura-card' },
  18  |     { path: '/quran/12/reader', readySelector: '.reader-layout .arabic-block' },
  19  |     { path: '/quran/12/mushaf', readySelector: '.mushaf-page' },
  20  |     { path: '/quran/12/native', readySelector: '.native-layout' },
  21  |     { path: '/holynames', readySelector: '.glory-card' },
  22  |     { path: '/tasbeeh', readySelector: '.tasbeeh-card' },
  23  |     { path: '/miracles', readySelector: '.miracle-card' },
  24  |     { path: '/support', readySelector: '.support-card, .q-card, main' },
  25  |     { path: '/contact', readySelector: '.contact-card, .q-card, main' },
  26  |     { path: '/blog', readySelector: '.blog-list, .q-card, main' },
  27  |     { path: '/privacy', readySelector: 'main h1, main .my-card, main .q-card' },
  28  |     { path: '/terms', readySelector: 'main h1, main .my-card, main .q-card' },
  29  | ]
  30  | 
  31  | const USTORE_NAMESPACE = 'peace2074'
  32  | 
  33  | function namespacedKey(key: string) {
  34  |     return `${USTORE_NAMESPACE}:${key}`
  35  | }
  36  | 
  37  | test.describe('dark mode public route smoke test', () => {
  38  |     for (const route of darkRoutes) {
  39  |         test(`keeps large surfaces dark on ${route.path}`, async ({ page }) => {
  40  |             await page.addInitScript(() => {
  41  |                 localStorage.setItem('peace2074:pref-theme-mode', 'dark')
  42  |             })
  43  | 
  44  |             await page.goto(route.path)
  45  |             await page.waitForLoadState('networkidle')
> 46  |             await expect
      |             ^ Error: Test timeout of 30000ms exceeded
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
  139 |             ).toEqual([])
  140 |         })
  141 |     }
  142 | })
  143 | 
```