import { Emotion, Track } from "../types";

// Default tracks if no custom music is found
const defaultTracks: Record<Emotion, Track[]> = {
  happy: [
    {
      id: "happy-1",
      title: "Dil Dhadakne Do",
      artist: "Suraj Jagan",
      emotion: "happy",
      path: "/music/happy/Dil Dhadakne Do.mp3",
      cover:
        "https://c.saavncdn.com/240/Dil-Dhadakne-Do-Hindi-2015-500x500.jpg",
    },
    {
      id: "happy-2",
      title: "Mera Mann Kehne Laga",
      artist: "Falak Shabbir",
      emotion: "happy",
      path: "/music/happy/Mera Mann Kehne Laga.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d00001e02785c415336347fca03a1d638",
    },
    {
      id: "happy-3",
      title: "Kabhi Kabhi Aditi",
      artist: "Rashid Ali",
      emotion: "happy",
      path: "/music/happy/Kabhi Kabhi Aditi.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d00001e02abf91851997179d195afab5f",
    },
  ],
  sad: [
    {
      id: "sad-1",
      title: "Finding Her",
      artist: "Kushagra",
      emotion: "sad",
      path: "/music/sad/Finding Her.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d0000485183141000ee8ce3b893a0b425",
    },
    {
      id: "sad-2",
      title: "Maand",
      artist: "Bayaan",
      emotion: "sad",
      path: "/music/sad/Maand.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d00001e02050a86ad4ac35aedb9b41d89",
    },
    {
      id: "sad-3",
      title: "Jhol",
      artist: "Mannu",
      emotion: "sad",
      path: "/music/sad/Jhol.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d000048516f276fe6c6093449347cc11d",
    },
  ],
  angry: [
    {
      id: "angry-1",
      title: "Jee Karda",
      artist: "Sachin jigar",
      emotion: "angry",
      path: "/music/angry/Jee Karda.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d000048514c74beed966d2f38aa298c57",
    },
    {
      id: "angry-2",
      title: "Brothers Anthem",
      artist: "Ajay-Atul",
      emotion: "angry",
      path: "/music/angry/Brothers Anthem.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d00004851b62efc8fa0cbf9bdd3331e49",
    },
    {
      id: "angry-3",
      title: "Saadda Haq",
      artist: "Mohit Chauhan",
      emotion: "angry",
      path: "/music/angry/Saadda Haq.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d0000485154e544672baa16145d67612b",
    },
  ],
  surprised: [
    {
      id: "surprised-1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      emotion: "surprised",
      path: "/music/surprised/Blinding Lights.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d000048518863bc11d2aa12b54f5aeb36",
    },
    {
      id: "surprised-2",
      title: "One Dance",
      artist: "Drake",
      emotion: "surprised",
      path: "/music/surprised/One Dance.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d0000485172d0af2341359a90710c1fdc",
    },
    {
      id: "surprised-3",
      title: "Counting Stars",
      artist: "OneRepublic",
      emotion: "surprised",
      path: "/music/surprised/Counting Stars.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d000048519e2f95ae77cf436017ada9cb",
    },
  ],
  neutral: [
    {
      id: "neutral-1",
      title: "Winning Speech",
      artist: "Karan Aujla",
      emotion: "neutral",
      path: "/music/neutral/Winning Speech - Karan Aujla.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d0000b273bb0a8916e30754d2e08f28bb",
    },
    {
      id: "neutral-2",
      title: "ANTIDOTE",
      artist: "Karan Aujla",
      emotion: "neutral",
      path: "/music/neutral/ANTIDOTE - Karan Aujla.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d00004851f9d66911f25fcb4b3b7d5cd3",
    },
    {
      id: "neutral-3",
      title: "Wavy",
      artist: "Karan Aujla",
      emotion: "neutral",
      path: "/music/neutral/Wavy - Karan Aujla.mp3",
      cover:
        "https://i.scdn.co/image/ab67616d00004851e34f05599c4a42e1cbb1c251",
    },
  ],
};

// Helper function to get all music files from a directory
const getMusicFiles = (emotion: Emotion): Track[] => {
  // For now, we'll return the default tracks since we can't directly access the filesystem in the browser
  // In a real implementation, you would:
  // 1. Either pre-build this list during build time
  // 2. Or have an API endpoint that returns the list of available files
  return defaultTracks[emotion];
};

// This is the music data structure that you'll customize
const musicData: Record<Emotion, Track[]> = {
  happy: getMusicFiles("happy"),
  sad: getMusicFiles("sad"),
  angry: getMusicFiles("angry"),
  surprised: getMusicFiles("surprised"),
  neutral: getMusicFiles("neutral"),
};

// Combine custom music with default tracks, preferring custom music when available
Object.keys(musicData).forEach((emotion) => {
  const customTracks = musicData[emotion as Emotion];
  if (customTracks.length === 0) {
    musicData[emotion as Emotion] = defaultTracks[emotion as Emotion];
  }
});

export default musicData;
