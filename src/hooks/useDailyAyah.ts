import { useState, useEffect, useCallback } from 'react';
import { AyahData, getDailyAyah, saveDailyAyah } from '../storage/dailyAyahStorage';

const RANDOM_VERSE_URL = 'https://api.quran.com/api/v4/verses/random?language=ar&words=false&audio=false&fields=chapter_id,verse_number';

export const useDailyAyah = () => {
    // Hook to manage daily ayah fetching
    const [ayah, setAyah] = useState<AyahData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNewAyah = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Get a random verse to start from (to pick a random Surah)
            const randomResponse = await fetch(RANDOM_VERSE_URL);
            const randomData = await randomResponse.json();

            if (!randomData.verse) throw new Error('Invalid response');

            const chapterId = randomData.verse.chapter_id;

            // 2. Fetch chapter info to check total verses
            const chapterResponse = await fetch(`https://api.quran.com/api/v4/chapters/${chapterId}?language=ar`);
            const chapterData = await chapterResponse.json();
            const surahName = chapterData.chapter?.name_arabic || `سورة ${chapterId}`;
            const totalVerses = chapterData.chapter?.verses_count || 0;

            // 3. Determine which page to fetch
            let page = 1;
            let perPage = 5;

            if (totalVerses < 5) {
                // If surah is short, just get all of it
                page = 1;
                perPage = totalVerses;
            } else {
                // Calculate how many FULL pages of 5 verses exist
                const fullPages = Math.floor(totalVerses / 5);
                // Pick a random page from 1 to fullPages
                page = Math.floor(Math.random() * fullPages) + 1;
            }

            // 4. Fetch the verses
            const versesUrl = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=ar&words=false&audio=1&translations=160&fields=text_uthmani,verse_key,verse_number&per_page=${perPage}&page=${page}`;

            const versesResponse = await fetch(versesUrl);
            const versesData = await versesResponse.json();

            if (!versesData.verses || versesData.verses.length === 0) throw new Error('No verses found');

            const verses = versesData.verses;

            // 5. Combine data
            let combinedText = '';
            const audioUrls: string[] = [];
            let combinedTafseer = '';

            verses.forEach((v: any) => {
                // Add decorative brackets
                combinedText += `${v.text_uthmani} ﴿${v.verse_number}﴾ `;

                // Construct audio URL for Muhammad Ayyub (EveryAyah)
                const [surah, ayah] = v.verse_key.split(':');
                const paddedSurah = surah.padStart(3, '0');
                const paddedAyah = ayah.padStart(3, '0');
                audioUrls.push(`https://everyayah.com/data/Muhammad_Ayyoub_128kbps/${paddedSurah}${paddedAyah}.mp3`);

                if (v.translations && v.translations.length > 0) {
                    const tafseerText = v.translations[0].text.replace(/<[^>]*>?/gm, '');
                    combinedTafseer += `(آية ${v.verse_number}): ${tafseerText}\n\n`;
                }
            });

            const firstVerse = verses[0];
            const lastVerse = verses[verses.length - 1];

            const newAyah: AyahData = {
                id: firstVerse.verse_key,
                text: combinedText.trim(),
                surahName: surahName,
                ayahNumber: firstVerse.verse_number,
                endAyahNumber: lastVerse.verse_number,
                savedAt: new Date().toISOString(),
                audioUrls,
                tafseer: combinedTafseer.trim(),
            };

            setAyah(newAyah);
            saveDailyAyah(newAyah);
        } catch (err) {
            setError('حدث خطأ أثناء جلب الآيات، حاول مرة أخرى.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const saved = await getDailyAyah();
                // Check if saved data has audioUrls (new structure)
                if (saved && saved.audioUrls) {
                    const savedDate = new Date(saved.savedAt).toDateString();
                    const today = new Date().toDateString();
                    if (savedDate === today) {
                        setAyah(saved);
                        setLoading(false);
                        return;
                    }
                }
                fetchNewAyah();
            } catch (e) {
                fetchNewAyah();
            }
        };
        load();
    }, []);

    return { ayah, loading, error, fetchNewAyah };
};
