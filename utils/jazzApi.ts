import { Channel, SliderItem } from '../types';
import CryptoJS from 'crypto-js';

const API_V5_BASE = "https://web.jazztv.pk/alpha/api_gateway/v5/web/";
const API_V3_BASE = "https://web.jazztv.pk/alpha/api_gateway/v3/web/";
const PHP_GATEWAY = "https://jazztv.pk/alpha/api_gateway/index.php/media/";
const LOGIN_ENDPOINT = "https://web.jazztv.pk/alpha/api_gateway/v5/auth/login";

// Global Cache to prevent redundant login calls
let cachedToken: string | null = null;
let tokenRequestPromise: Promise<string> | null = null;

/**
 * Decrypts eData using the Jazz/Tamasha AES key.
 */
function decryptAes(text: string): any {
  if (!text || typeof text !== 'string') return null;
  const keyStr = "gTOwkDMjlDZ0EjY58GcsVWM4oGOllnd4VzN3UmZsBHc"; 
  const decodeKey = (str: string) => {
      let reversed = "";
      for (let i = str.length - 1; i >= 0; i--) reversed += str[i];
      try { return atob(reversed); } catch(e) { return ""; }
  };
  const key = decodeKey(keyStr);
  const iv = "fpmjlrbhpljoennm";
  try {
    const ct = CryptoJS.enc.Hex.parse(text);
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ct } as any, CryptoJS.enc.Utf8.parse(key), { iv: CryptoJS.enc.Utf8.parse(iv) });
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch (e) { return null; }
}

/**
 * Singleton Auth: Fetches or returns cached token.
 */
export const getFreshToken = async (forceRefresh = false): Promise<string> => {
  if (cachedToken && !forceRefresh) return cachedToken;
  if (tokenRequestPromise && !forceRefresh) return tokenRequestPromise;

  tokenRequestPromise = (async () => {
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json;charset=utf-8',
          'User-Agent': navigator.userAgent,
          'Referer': 'https://www.tamashaweb.com/live-tv'
        },
        body: JSON.stringify({
          'state': 'S29Pb3Q3eTl4dnUxRk5HME9sa0dXdVh0QjZmNXpoRDBAd2ViLmNvbQ==',
          'city': 'S29Pb3Q3eTl4dnUxRk5HME9sa0dXdVh0QjZmNXpoRDA'
        })
      });
      const data = await response.json();
      cachedToken = data.token || "";
      return cachedToken || "";
    } catch (error) {
      console.error('Auth Error:', error);
      return "";
    } finally {
      tokenRequestPromise = null;
    }
  })();

  return tokenRequestPromise;
};

export const getCurrentToken = () => cachedToken;

/**
 * Fetches channel list for TV tab.
 */
export const fetchJazzChannels = async (): Promise<Channel[]> => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_V3_BASE}live-tv`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ project_id: "2", platform: "web" }),
    });
    const json = await response.json();
    const data = decryptAes(json.eData);
    let channels = data?.data?.channels || [];

    return channels.map((ch: any) => ({
      id: `jazz-${ch.id || ch.channelId}`,
      name: ch.channelName || ch.name,
      logo: ch.logo || ch.image,
      slug: ch.channelSlug || ch.slug,
      type: 'channel'
    }));
  } catch (error) { return []; }
};

/**
 * Fetches data for the Home tab.
 */
export const fetchHomeSections = async () => {
  try {
    const token = await getFreshToken();
    const response = await fetch(`${API_V5_BASE}home-programs-carousal`, {
      method: 'POST',
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: "0", project_id: "2", platform: "web" })
    });
    const json = await response.json();
    const data = decryptAes(json.eData);
    
    return {
      slider: (data?.data?.slider || []).map((item: any) => ({
        id: `slide-${item.id || item.programId}`,
        title: item.channelName || item.name,
        thumbnail: item.image || item.thumbnail,
        slug: item.channelSlug || item.slug,
        type: item.type || 'channel'
      })),
      chunks: data?.data?.chunks || []
    };
  } catch (e) { return { slider: [], chunks: [] }; }
};

/**
 * Fetches programs by genre.
 */
export const fetchGenrePrograms = async (genre: string): Promise<Channel[]> => {
    try {
        const token = await getFreshToken();
        const response = await fetch(`${API_V5_BASE}genre-programs-carousal`, {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ genre_slug: genre, project_id: "2", platform: "web" })
        });
        const json = await response.json();
        const data = decryptAes(json.eData);
        const programs = data?.data?.programData || [];
        return programs.map((p: any) => ({
            id: `gen-${p.slug}`,
            name: p.name || p.title,
            logo: p.portrait_poster || p.image,
            slug: p.slug,
            type: p.type || 'vod'
        }));
    } catch (e) { return []; }
};

/**
 * Optimized Stream Fetch: Exactly matches the user's legacy HTML method.
 */
export const fetchChannelUrl = async (slug: string, type: string = 'channel'): Promise<string> => {
  try {
    // IMPORTANT: The PHP gateway does NOT use the Bearer token. 
    // Sending the token in headers here causes a 403 or signature error.
    const response = await fetch(`${PHP_GATEWAY}get-channel-url`, {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        "slug": slug,
        "phone_details": navigator.userAgent,
        "ip": "",
        "type": type === 'movie' || type === 'vod' || type === 'episode' ? 'vod' : 'channel',
        "user_id": "9999999999",
        "mobile": "9999999999"
      })
    });
    
    const json = await response.json();
    const decryptedData = decryptAes(json.eData);
    
    // The returned URL already has Akamai tokens in the query string.
    return decryptedData?.data?.ChannelStreamingUrls || decryptedData?.data?.HlsUrl || "";
  } catch (e) { 
    return ""; 
  }
}