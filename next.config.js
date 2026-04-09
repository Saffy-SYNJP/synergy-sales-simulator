/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Voice is always enabled — STT uses free Web Speech API (Chrome/Edge),
    // TTS uses ElevenLabs only if ELEVENLABS_API_KEY is set.
    NEXT_PUBLIC_VOICE_ENABLED: process.env.NEXT_PUBLIC_VOICE_ENABLED || "true",
  },
};

module.exports = nextConfig;
