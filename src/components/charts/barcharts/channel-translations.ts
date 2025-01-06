export const channelTranslations: Record<string, { flag: string, name: string }> = {
  'français': { flag: '🇫🇷', name: 'French' },
  '中文': { flag: '🇨🇳', name: 'Chinese' },
  'українська-ua': { flag: '🇺🇦', name: 'Ukrainian' },
  'русский-ru': { flag: '🇷🇺', name: 'Russian' },
  'tiếng-việt': { flag: '🇻🇳', name: 'Vietnamese' },
  'bahasa-id': { flag: '🇮🇩', name: 'Indonesian' },
  'brasil-português': { flag: '🇧🇷', name: 'Brazilian Portuguese' },
  '한국어-kr': { flag: '🇰🇷', name: 'Korean' },
  'tagalog': { flag: '🇵🇭', name: 'Filipino' },
  'พูดคุย-thai': { flag: '🇹🇭', name: 'Thai' },
  'polska': { flag: '🇵🇱', name: 'Polish' },
  'español': { flag: '🇪🇸', name: 'Spanish' },
  'भारतीय-in': { flag: '🇮🇳', name: 'Hindi' },
  'türkçe': { flag: '🇹🇷', name: 'Turkish' },
  '日本語-jp': { flag: '🇯🇵', name: 'Japanese' },
  'আড্ডা-bng': { flag: '🇧🇩', name: 'Bengali' },
  'عربية': { flag: '🇸🇦', name: 'Arabic' },
  'italiano': { flag: '🇮🇹', name: 'Italian' },
  'deutsch': { flag: '🇩🇪', name: 'German' },
  'română': { flag: '🇷🇴', name: 'Romanian' },
  'dutch': { flag: '🇳🇱', name: 'Dutch' },
  'greek': { flag: '🇬🇷', name: 'Greek' },
  '台灣-tiw': { flag: '🇹🇼', name: 'Taiwanese' },
};

export function getChannelDisplayName(channelName: string): string {
  const translation = channelTranslations[channelName];
  return translation?.flag || channelName;
}

export function getFullChannelName(channelName: string): string {
  const translation = channelTranslations[channelName];
  return translation ? `${translation.flag} ${channelName} (${translation.name})` : channelName;
} 